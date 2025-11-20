/**
 * DatabaseService - Core database service for BQ Studio
 * Provides type-safe interface to SQLite database with migrations,
 * transactions, and plugin schema extensions
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import {
  DatabaseConfig,
  MigrationResult,
  PluginSchemaExtension,
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
  BackupOptions,
  RestoreOptions,
} from './types';

/**
 * Main database service class
 */
export class DatabaseService {
  private db: Database.Database | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Initialize the database connection and run migrations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.config.filename);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database connection
      this.db = new Database(this.config.filename, {
        verbose: this.config.verbose ? console.log : undefined,
        readonly: this.config.readonly,
        fileMustExist: this.config.fileMustExist,
        timeout: this.config.timeout || 5000,
      });

      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');

      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');

      // Run migrations
      await this.runMigrations();

      this.isInitialized = true;

      if (this.config.verbose) {
        console.log('DatabaseService initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get the database instance (for advanced queries)
   */
  getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Run all pending migrations
   */
  private async runMigrations(): Promise<MigrationResult[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const results: MigrationResult[] = [];
    const migrationsDir = path.join(__dirname, 'migrations');

    // Ensure migrations table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get applied migrations
    const appliedMigrations = this.db
      .prepare('SELECT version FROM migrations')
      .all() as { version: string }[];

    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

    // Get all migration files
    if (!fs.existsSync(migrationsDir)) {
      console.warn('Migrations directory not found:', migrationsDir);
      return results;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Run pending migrations
    for (const file of migrationFiles) {
      const version = file.replace('.sql', '');

      if (appliedVersions.has(version)) {
        continue; // Already applied
      }

      try {
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        // Execute migration in a transaction
        this.db.exec(sql);

        // Note: Migration 001 inserts its own record, so we only insert for others
        if (version !== '001') {
          this.db
            .prepare('INSERT INTO migrations (version, name) VALUES (?, ?)')
            .run(version, file);
        }

        results.push({
          success: true,
          version,
          message: `Migration ${version} applied successfully`,
        });

        console.log(`Migration ${version} applied successfully`);
      } catch (error) {
        results.push({
          success: false,
          version,
          message: `Failed to apply migration ${version}`,
          error: error as Error,
        });

        console.error(`Failed to apply migration ${version}:`, error);
        throw error; // Stop on first error
      }
    }

    return results;
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: TransactionFunction<T>, options?: TransactionOptions): T {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(fn);

    if (options?.immediate) {
      return transaction.immediate();
    }

    return transaction();
  }

  /**
   * Register a plugin schema extension
   */
  async registerPluginSchema(
    extension: PluginSchemaExtension
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.transaction(() => {
      // Check if plugin schema already exists
      const existing = this.db!.prepare(
        'SELECT id FROM plugin_schemas WHERE plugin_id = ?'
      ).get(extension.pluginId);

      if (existing) {
        console.warn(
          `Plugin schema ${extension.pluginId} already registered`
        );
        return;
      }

      // Execute plugin schema SQL
      this.db!.exec(extension.sql);

      // Record plugin schema
      this.db!.prepare(`
        INSERT INTO plugin_schemas (plugin_id, plugin_name, schema_version, tables)
        VALUES (?, ?, ?, ?)
      `).run(
        extension.pluginId,
        extension.pluginName,
        extension.version,
        JSON.stringify(extension.tables)
      );

      console.log(
        `Plugin schema ${extension.pluginId} registered successfully`
      );
    });
  }

  /**
   * Generic insert method
   */
  insert<T extends TableName>(
    table: T,
    data: InputMap[T],
    options?: InsertOptions
  ): number {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const fields = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values);

    return options?.returnId !== false ? result.lastInsertRowid as number : 0;
  }

  /**
   * Generic update method
   */
  update<T extends TableName>(
    table: T,
    data: Partial<InputMap[T]>,
    options: UpdateOptions
  ): number {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const fields = Object.keys(data);
    const values = Object.values(data).map((v) =>
      typeof v === 'object' ? JSON.stringify(v) : v
    );

    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const { whereClause, whereValues } = this.buildWhereClause(options.where);

    const sql = `UPDATE ${table} SET ${setClause} ${whereClause}`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...values, ...whereValues);

    return result.changes;
  }

  /**
   * Generic delete method
   */
  delete<T extends TableName>(table: T, options: DeleteOptions): number {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const { whereClause, whereValues } = this.buildWhereClause(options.where);

    const sql = `DELETE FROM ${table} ${whereClause}`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...whereValues);

    return result.changes;
  }

  /**
   * Generic select method
   */
  select<T extends TableName>(
    table: T,
    options?: QueryOptions
  ): ModelMap[T][] {
    if (!this.db) {
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
      sql += ` LIMIT ?`;
      values.push(options.limit);
    }

    // OFFSET clause
    if (options?.offset) {
      sql += ` OFFSET ?`;
      values.push(options.offset);
    }

    const stmt = this.db.prepare(sql);
    const results = stmt.all(...values) as any[];

    // Parse JSON fields
    return results.map((row) => this.parseJsonFields(row));
  }

  /**
   * Select a single record
   */
  selectOne<T extends TableName>(
    table: T,
    options?: QueryOptions
  ): ModelMap[T] | null {
    const results = this.select(table, { ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Count records
   */
  count<T extends TableName>(table: T, options?: QueryOptions): number {
    if (!this.db) {
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

    const stmt = this.db.prepare(sql);
    const result = stmt.get(...values) as { count: number };

    return result.count;
  }

  /**
   * Execute raw SQL query
   */
  query(sql: string, params: any[] = []): any[] {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(sql);
    const results = stmt.all(...params) as any[];

    return results.map((row) => this.parseJsonFields(row));
  }

  /**
   * Execute raw SQL statement (INSERT, UPDATE, DELETE)
   */
  execute(sql: string, params: any[] = []): Database.RunResult {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Backup database to file
   */
  async backup(options: BackupOptions): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const destDir = path.dirname(options.destination);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db!.backup(options.destination)
        .then(() => {
          console.log('Database backup completed:', options.destination);
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Restore database from backup
   */
  async restore(options: RestoreOptions): Promise<void> {
    if (!fs.existsSync(options.source)) {
      throw new Error(`Backup file not found: ${options.source}`);
    }

    if (options.overwrite && this.db) {
      this.close();
    }

    // Copy backup file to current database location
    fs.copyFileSync(options.source, this.config.filename);

    // Reinitialize
    await this.initialize();

    console.log('Database restored from:', options.source);
  }

  /**
   * Build WHERE clause from conditions
   */
  private buildWhereClause(conditions: QueryCondition[]): {
    whereClause: string;
    whereValues: any[];
  } {
    if (!conditions || conditions.length === 0) {
      return { whereClause: '', whereValues: [] };
    }

    const clauses: string[] = [];
    const values: any[] = [];

    for (const condition of conditions) {
      if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const placeholders = condition.value
          .map(() => '?')
          .join(', ');
        clauses.push(`${condition.field} ${condition.operator} (${placeholders})`);
        values.push(...condition.value);
      } else {
        clauses.push(`${condition.field} ${condition.operator} ?`);
        values.push(condition.value);
      }
    }

    return {
      whereClause: `WHERE ${clauses.join(' AND ')}`,
      whereValues: values,
    };
  }

  /**
   * Parse JSON fields in database rows
   */
  private parseJsonFields(row: any): any {
    const parsed = { ...row };

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && this.isJsonField(key, value)) {
        try {
          parsed[key] = JSON.parse(value);
        } catch {
          // Not valid JSON, leave as string
        }
      }
    }

    return parsed;
  }

  /**
   * Check if a field should be parsed as JSON
   */
  private isJsonField(key: string, value: string): boolean {
    // Fields that commonly store JSON
    const jsonFields = [
      'metadata',
      'social_links',
      'stages_data',
      'state',
      'data',
      'validation_result',
      'tables',
    ];

    return (
      jsonFields.includes(key) &&
      (value.startsWith('{') || value.startsWith('['))
    );
  }
}

/**
 * Create a default database service instance
 */
export function createDatabaseService(
  userDataPath: string,
  options?: Partial<DatabaseConfig>
): DatabaseService {
  const config: DatabaseConfig = {
    filename: path.join(userDataPath, 'bq-studio.db'),
    verbose: false,
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    ...options,
  };

  return new DatabaseService(config);
}

export default DatabaseService;
