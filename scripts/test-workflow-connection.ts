/**
 * Test script to verify WorkflowManagerClient can connect to the MCP server
 */

import { workflowManagerClient } from '../src/services/WorkflowManagerClient';

async function testConnection() {
  console.log('🔍 Testing connection to Workflow Manager MCP (port 3012)...\n');

  try {
    // Test 1: Health check
    console.log('Test 1: Health Check');
    const health = await workflowManagerClient.healthCheck();
    console.log('✅ Health check passed!');
    console.log('   Status:', health.status);
    console.log('   Database:', health.database?.connected ? 'Connected' : 'Disconnected');
    console.log('   Active Sessions:', health.activeSessions || 0);
    console.log('');

    // Test 2: List active workflows
    console.log('Test 2: List Active Workflows');
    const workflows = await workflowManagerClient.listActiveWorkflows();
    console.log(`✅ Found ${workflows.length} active workflow(s)`);
    if (workflows.length > 0) {
      console.log('   Latest workflow:', workflows[0]);
    }
    console.log('');

    // Test 3: Create a test workflow
    console.log('Test 3: Create Test Workflow');
    const workflow = await workflowManagerClient.createWorkflow({
      series_id: 1,
      user_id: 1,
      concept: 'Test workflow - ghost detective in Victorian London',
    });
    console.log('✅ Workflow created successfully!');
    console.log('   Workflow ID:', workflow.workflow_id);
    console.log('   Status:', workflow.status);
    console.log('   Current Phase:', workflow.current_phase);
    console.log('');

    // Test 4: Get workflow state
    console.log('Test 4: Get Workflow State');
    const state = await workflowManagerClient.getWorkflowState(workflow.workflow_id);
    console.log('✅ Retrieved workflow state');
    console.log('   Status:', state.status);
    console.log('   Phase:', state.current_phase);
    console.log('');

    // Test 5: Get workflow metrics
    console.log('Test 5: Get Workflow Metrics');
    const metrics = await workflowManagerClient.getWorkflowMetrics(workflow.workflow_id);
    console.log('✅ Retrieved workflow metrics');
    console.log('   Total Phases:', metrics.total_phases);
    console.log('   Completed Phases:', metrics.completed_phases);
    console.log('');

    console.log('🎉 All tests passed! Workflow Manager MCP is ready to use.\n');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('   Error:', error instanceof Error ? error.message : String(error));
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Ensure Docker container is running (check FictionLab dashboard)');
    console.error('   2. Verify port 3012 is exposed and mapped correctly');
    console.error('   3. Check that workflow-manager server loaded (check Docker logs)');
    console.error('');
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
