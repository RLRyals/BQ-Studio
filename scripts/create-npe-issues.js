const fs = require('fs');
const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_AUTH_TOKEN;
const REPO_OWNER = 'RLRyals';
const REPO_NAME = 'BQ-Studio';

const issuesData = JSON.parse(fs.readFileSync('.github-issues/npe-issues.json', 'utf8'));

function createIssue(title, body, labels) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title,
      body,
      labels
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'BQ-Studio-NPE-Issue-Creator',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const issue = JSON.parse(responseData);
          console.log(`✓ Created issue #${issue.number}: ${title}`);
          resolve(issue);
        } else {
          console.error(`✗ Failed to create issue: ${title}`);
          console.error(`Status: ${res.statusCode}`);
          console.error(`Response: ${responseData}`);
          reject(new Error(`Failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`✗ Error creating issue: ${title}`);
      console.error(error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function createAllNPEIssues() {
  console.log('Creating NPE GitHub issues for BQ Studio...\n');

  const epicMap = {};

  // Create epics first
  console.log('Creating NPE Epic...');
  for (const epic of issuesData.epics) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      const issue = await createIssue(epic.title, epic.body, epic.labels);
      epicMap[epic.title] = issue;
    } catch (error) {
      console.error(`Failed to create epic: ${epic.title}`);
      console.error(error.message);
    }
  }

  console.log('\nCreating NPE sub-issues...');

  // Create sub-issues and link to epics
  for (const issue of issuesData.issues) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting

      // Add epic reference to body
      let body = issue.body;
      if (issue.epic && epicMap[issue.epic]) {
        const epicNumber = epicMap[issue.epic].number;
        body = `**Epic:** #${epicNumber}\n\n${body}`;
      }

      await createIssue(issue.title, body, issue.labels);
    } catch (error) {
      console.error(`Failed to create issue: ${issue.title}`);
      console.error(error.message);
    }
  }

  console.log('\n✓ All NPE issues created successfully!');
  console.log(`\nView issues at: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
}

createAllNPEIssues().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
