/**
 * DatabaseService - Core database service for BQ Studio
 * Provides type-safe interface to Postgres database (managed by FictionLab)
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import {
  DatabaseConfig,
  TransactionFunction,
  TransactionOptions,
  QueryCondition,
  QueryOptions,
  InsertOptions,
  UpdateOptions,
  DeleteOptions,
  TableName,
  ModelMap,
  InputMap,
} from './types';

/**
 * Main database service class
 */
export class DatabaseService {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create connection pool
      // Note: We use the connection string from config or environment
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // Default to localhost if not provided (fallback)
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '6432'),
        user: process.env.DB_USER || 'fictionlab',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'fictionlab',
        max: 20, // Max clients in pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      try {
        await client.query('SELECT NOW()');
        if (this.config.verbose) {
          console.log('DatabaseService initialized successfully (Postgres)');
        }
      } finally {
        client.release();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get a raw pool client (for advanced queries)
   * Remember to release the client when done!
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool.connect();
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(fn: TransactionFunction<T>, options?: TransactionOptions): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      
      // We need to pass the client to the transaction function
      // But our current interface doesn't support that directly.
      // For now, we'll assume the function uses the service methods
      // which will use the pool. This is NOT a true transaction across
      // multiple service calls unless we refactor to support passing a client.
      // TODO: Refactor TransactionFunction to accept a transaction context
      
      const result = await fn(); // This awaits the promise returned by fn
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generic insert method
   */
  async insert<T extends TableName>(
    table: T,
    data: InputMap[T],
    options?: InsertOptions
  ): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const fields = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    
    // Postgres uses $1, $2, etc.
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING id`;

    const result = await this.pool.query(sql, values);
    
    // Return the ID of the inserted row
    return result.rows[0]?.id || 0;
  }

  /**
   * Generic update method
   */
  async update<T extends TableName>(
    table: T,
    data: Partial<InputMap[T]>,
    options: UpdateOptions
  ): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const fields = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    
    // Offset for WHERE clause parameters
    const paramOffset = values.length;
    const { whereClause, whereValues } = this.buildWhereClause(options.where, paramOffset);

    const sql = `UPDATE ${table} SET ${setClause} ${whereClause}`;

    const result = await this.pool.query(sql, [...values, ...whereValues]);

    return result.rowCount || 0;
  }

  /**
   * Generic delete method
   */
  async delete<T extends TableName>(table: T, options: DeleteOptions): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const { whereClause, whereValues } = this.buildWhereClause(options.where);

    const sql = `DELETE FROM ${table} ${whereClause}`;

    const result = await this.pool.query(sql, whereValues);

    return result.rowCount || 0;
  }

  /**
   * Generic select method
   */
  async select<T extends TableName>(
    table: T,
    options?: QueryOptions
  ): Promise<ModelMap[T][]> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    let sql = `SELECT * FROM ${table}`;
    const values: any[] = [];

    // WHERE clause
    if (options?.where && options.where.length > 0) {
      const { whereClause, whereValues } = this.buildWhereClause(
        options.where
      );
      sql += ` ${whereClause}`;
      values.push(...whereValues);
    }

    // ORDER BY clause
    if (options?.orderBy && options.orderBy.length > 0) {
      const orderClauses = options.orderBy
        .map((o) => `${o.field} ${o.direction}`)
        .join(', ');
      sql += ` ORDER BY ${orderClauses}`;
    }

    // LIMIT clause
    if (options?.limit) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(options.limit);
    }

    // OFFSET clause
    if (options?.offset) {
      sql += ` OFFSET $${values.length + 1}`;
      values.push(options.offset);
    }

    const result = await this.pool.query(sql, values);

    // Parse JSON fields (Postgres driver handles JSON automatically for JSON types, 
    // but we might be storing as text/string in some cases or need specific handling)
    // For now, we'll assume the driver handles it or we map it.
    return result.rows as ModelMap[T][];
  }

  /**
   * Select a single record
   */
  async selectOne<T extends TableName>(
    table: T,
    options?: QueryOptions
  ): Promise<ModelMap[T] | null> {
    const results = await this.select(table, { ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Count records
   */
  async count<T extends TableName>(table: T, options?: QueryOptions): Promise<number> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const values: any[] = [];

    if (options?.where && options.where.length > 0) {
      const { whereClause, whereValues } = this.buildWhereClause(
        options.where
      );
      sql += ` ${whereClause}`;
      values.push(...whereValues);
    }

    const result = await this.pool.query(sql, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Execute raw SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  /**
   * Execute raw SQL statement (INSERT, UPDATE, DELETE)
   */
  async execute(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    return this.pool.query(sql, params);
  }

  /**
   * Build WHERE clause from conditions
   */
  private buildWhereClause(conditions: QueryCondition[], paramOffset: number = 0): {
    whereClause: string;
    whereValues: any[];
  } {
    if (!conditions || conditions.length === 0) {
      return { whereClause: '', whereValues: [] };
    }

    const clauses: string[] = [];
    const values: any[] = [];
    let paramIndex = paramOffset + 1;

    for (const condition of conditions) {
      if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const placeholders = condition.value
          .map(() => `$${paramIndex++}`)
          .join(', ');
        clauses.push(`${condition.field} ${condition.operator} (${placeholders})`);
        values.push(...condition.value);
      } else {
        clauses.push(`${condition.field} ${condition.operator} $${paramIndex++}`);
        values.push(condition.value);
      }
    }

    return {
      whereClause: `WHERE ${clauses.join(' AND ')}`,
      whereValues: values,
    };
  }
}

/**
 * Create a default database service instance
 */
export function createDatabaseService(
  userDataPath: string, // Kept for compatibility, but not used for Postgres file path
  options?: Partial<DatabaseConfig>
): DatabaseService {
  const config: DatabaseConfig = {
    filename: '', // Not used for Postgres
    verbose: false,
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    ...options,
  };

  return new DatabaseService(config);
}

export default DatabaseService;
