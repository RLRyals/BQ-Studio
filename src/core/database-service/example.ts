/**
 * Database Service Usage Examples
 *
 * This file demonstrates how to use the DatabaseService
 * in various scenarios within BQ Studio.
 */

import { createDatabaseService, DatabaseService } from './index';
import * as path from 'path';

/**
 * Example 1: Initialize the database
 */
async function example1_initialize() {
  console.log('Example 1: Initialize Database');

  // Create database service
  const dbService = createDatabaseService('/tmp/bq-studio-data', {
    verbose: true,
  });

  // Initialize (creates database file and runs migrations)
  await dbService.initialize();

  console.log('Database initialized successfully!\n');

  return dbService;
}

/**
 * Example 2: Create projects and pennames
 */
async function example2_createProjectsAndPennames(db: DatabaseService) {
  console.log('Example 2: Create Projects and Pennames');

  // Create a penname
  const pennameId = db.insert('pennames', {
    name: 'Jane Storyteller',
    real_name: 'Jane Doe',
    bio: 'Award-winning fantasy author',
    brand_guidelines: 'Dark, atmospheric fantasy with strong female leads',
    voice_profile: 'Lyrical, descriptive prose with a touch of mystery',
    is_active: true,
  });

  console.log('Created penname:', pennameId);

  // Create a project
  const projectId = db.insert('projects', {
    name: 'The Dragon Chronicles',
    type: 'series',
    description: 'A 5-book epic fantasy series',
    penname_id: pennameId,
    status: 'active',
    metadata: {
      genre: 'Fantasy',
      subgenre: 'Epic Fantasy',
      targetWordCount: 500000,
      books: 5,
    },
  });

  console.log('Created project:', projectId);
  console.log();

  return { projectId, pennameId };
}

/**
 * Example 3: Query data
 */
async function example3_queryData(db: DatabaseService) {
  console.log('Example 3: Query Data');

  // Get all active projects
  const activeProjects = db.select('projects', {
    where: [{ field: 'status', operator: '=', value: 'active' }],
    orderBy: [{ field: 'created_at', direction: 'DESC' }],
  });

  console.log('Active projects:', activeProjects.length);

  // Get a specific project with penname
  const project = db.query(`
    SELECT p.*, pen.name as penname
    FROM projects p
    LEFT JOIN pennames pen ON p.penname_id = pen.id
    WHERE p.id = ?
  `, [1])[0];

  console.log('Project with penname:', project);
  console.log();

  return activeProjects;
}

/**
 * Example 4: Create a workflow
 */
async function example4_createWorkflow(db: DatabaseService, projectId: number) {
  console.log('Example 4: Create Workflow');

  const workflowId = db.insert('workflows', {
    project_id: projectId,
    workflow_type: 'series-architect',
    current_stage: 'intake',
    stages_data: [
      { name: 'Intake & Assessment', order: 1 },
      { name: 'Research Phase', order: 2 },
      { name: 'Series Framework', order: 3 },
      { name: 'Story Dossier', order: 4 },
      { name: 'Book Development', order: 5 },
      { name: 'Output Generation', order: 6 },
    ],
    state: {
      currentStep: 'gathering-requirements',
    },
    progress: 10,
  });

  console.log('Created workflow:', workflowId);

  // Create workflow stages
  const stages = [
    { name: 'Intake & Assessment', order: 1, status: 'in_progress' as const },
    { name: 'Research Phase', order: 2, status: 'pending' as const },
    { name: 'Series Framework', order: 3, status: 'pending' as const },
    { name: 'Story Dossier', order: 4, status: 'pending' as const },
    { name: 'Book Development', order: 5, status: 'pending' as const },
    { name: 'Output Generation', order: 6, status: 'pending' as const },
  ];

  for (const stage of stages) {
    db.insert('workflow_stages', {
      workflow_id: workflowId,
      stage_name: stage.name,
      stage_order: stage.order,
      status: stage.status,
    });
  }

  console.log('Created workflow stages\n');

  return workflowId;
}

/**
 * Example 5: Log AI interaction
 */
async function example5_logAIInteraction(
  db: DatabaseService,
  projectId: number,
  workflowId: number
) {
  console.log('Example 5: Log AI Interaction');

  const interactionId = db.insert('ai_interactions', {
    project_id: projectId,
    workflow_id: workflowId,
    provider: 'anthropic',
    model: 'claude-3-opus',
    prompt: 'Generate series concept based on user input...',
    response: 'Here is your series concept...',
    tokens_input: 150,
    tokens_output: 500,
    tokens_total: 650,
    cost_usd: 0.0195, // $0.015/1K input + $0.075/1K output
    duration_ms: 2500,
    status: 'success',
    metadata: {
      temperature: 0.7,
      max_tokens: 1000,
    },
  });

  console.log('Logged AI interaction:', interactionId);
  console.log();

  return interactionId;
}

/**
 * Example 6: Use transactions
 */
async function example6_useTransactions(db: DatabaseService) {
  console.log('Example 6: Use Transactions');

  try {
    const result = db.transaction(() => {
      // All of these operations succeed or fail together
      const pennameId = db.insert('pennames', {
        name: 'John Writer',
        is_active: true,
      });

      const projectId = db.insert('projects', {
        name: 'Mystery Novel',
        type: 'manuscript',
        penname_id: pennameId,
        status: 'active',
      });

      const workflowId = db.insert('workflows', {
        project_id: projectId,
        workflow_type: 'manuscript-writer',
        current_stage: 'chapter-1',
        stages_data: [{ name: 'Chapter 1', order: 1 }],
        progress: 0,
      });

      return { pennameId, projectId, workflowId };
    });

    console.log('Transaction completed:', result);
  } catch (error) {
    console.error('Transaction failed:', error);
  }

  console.log();
}

/**
 * Example 7: Update and delete
 */
async function example7_updateAndDelete(db: DatabaseService) {
  console.log('Example 7: Update and Delete');

  // Update project status
  const updated = db.update(
    'projects',
    { status: 'archived' },
    {
      where: [
        { field: 'type', operator: '=', value: 'manuscript' },
        { field: 'status', operator: '=', value: 'active' },
      ],
    }
  );

  console.log('Updated projects:', updated);

  // Count archived projects
  const archivedCount = db.count('projects', {
    where: [{ field: 'status', operator: '=', value: 'archived' }],
  });

  console.log('Archived projects count:', archivedCount);
  console.log();
}

/**
 * Example 8: Plugin schema extension
 */
async function example8_pluginSchemaExtension(db: DatabaseService) {
  console.log('Example 8: Plugin Schema Extension');

  await db.registerPluginSchema({
    pluginId: 'series-architect',
    pluginName: 'Series Architect',
    version: '1.0.0',
    sql: `
      CREATE TABLE IF NOT EXISTS series_beats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        beat_name TEXT NOT NULL,
        beat_type TEXT NOT NULL,
        beat_order INTEGER NOT NULL,
        content TEXT,
        metadata JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_series_beats_project ON series_beats(project_id);
    `,
    tables: ['series_beats'],
  });

  console.log('Plugin schema registered successfully');

  // Insert a beat into the plugin table
  db.execute(
    'INSERT INTO series_beats (project_id, beat_name, beat_type, beat_order) VALUES (?, ?, ?, ?)',
    [1, 'Opening Hook', 'three-act', 1]
  );

  console.log('Inserted data into plugin table');
  console.log();
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('='.repeat(60));
  console.log('BQ Studio Database Service Examples');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize
    const db = await example1_initialize();

    // Create data
    const { projectId, pennameId } = await example2_createProjectsAndPennames(db);

    // Query data
    await example3_queryData(db);

    // Create workflow
    const workflowId = await example4_createWorkflow(db, projectId);

    // Log AI interaction
    await example5_logAIInteraction(db, projectId, workflowId);

    // Use transactions
    await example6_useTransactions(db);

    // Update and delete
    await example7_updateAndDelete(db);

    // Plugin schema extension
    await example8_pluginSchemaExtension(db);

    console.log('='.repeat(60));
    console.log('All examples completed successfully!');
    console.log('='.repeat(60));

    // Close database
    db.close();
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  example1_initialize,
  example2_createProjectsAndPennames,
  example3_queryData,
  example4_createWorkflow,
  example5_logAIInteraction,
  example6_useTransactions,
  example7_updateAndDelete,
  example8_pluginSchemaExtension,
  runAllExamples,
};
