# GitHub API Access Guide for Claude Code

This document explains how Claude Code agents can programmatically access GitHub issues and pull requests using environment tokens.

## Overview

BQ Studio provides GitHub API access through environment variables that are automatically configured during session startup. This allows Claude Code to:
- Read open and closed issues
- Fetch issue details and comments
- Create and update issues
- Close issues and add labels
- Comment on issues and PRs

## Authentication

### Environment Variables

Two tokens are available in the environment:

1. **GITHUB_AUTH_TOKEN** (Primary)
   - Format: `ghp_...` (classic Personal Access Token)
   - Used by default for all API operations

2. **GIT_TOKEN** (Alternative)
   - Format: `github_pat_...` (fine-grained Personal Access Token)
   - Fallback option if primary token is unavailable

### Authorization Headers

Use this authorization pattern for API requests:

```bash
# Using curl
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "User-Agent: BQ-Studio-Claude" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/RLRyals/BQ-Studio/issues
```

```javascript
// Using Node.js HTTPS module
const options = {
  hostname: 'api.github.com',
  path: '/repos/RLRyals/BQ-Studio/issues',
  method: 'GET',
  headers: {
    'Authorization': `token ${process.env.GITHUB_AUTH_TOKEN}`,
    'User-Agent': 'BQ-Studio-Claude',
    'Accept': 'application/vnd.github.v3+json'
  }
};
```

## Common API Operations

### 1. List Open Issues

```bash
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues?state=open&per_page=30"
```

Query parameters:
- `state`: `open`, `closed`, or `all`
- `per_page`: Number of results (max 100)
- `page`: Page number for pagination
- `labels`: Filter by comma-separated label names
- `sort`: `created`, `updated`, or `comments`
- `direction`: `asc` or `desc`

### 2. Get Specific Issue

```bash
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42"
```

### 3. Create Issue

```bash
curl -X POST \
     -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Content-Type: application/json" \
     -d '{"title":"Issue title","body":"Issue description","labels":["bug","priority:high"]}' \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues"
```

Request body:
```json
{
  "title": "Issue title",
  "body": "Detailed description",
  "labels": ["bug", "enhancement"],
  "assignees": ["username"],
  "milestone": 1
}
```

### 4. Update Issue

```bash
curl -X PATCH \
     -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Content-Type: application/json" \
     -d '{"title":"Updated title","body":"Updated description"}' \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42"
```

### 5. Close Issue

```bash
curl -X PATCH \
     -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Content-Type: application/json" \
     -d '{"state":"closed"}' \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42"
```

### 6. Add Comment to Issue

```bash
curl -X POST \
     -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Content-Type: application/json" \
     -d '{"body":"Comment text here"}' \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42/comments"
```

### 7. List Issue Comments

```bash
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42/comments"
```

### 8. Add Labels to Issue

```bash
curl -X POST \
     -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Content-Type: application/json" \
     -d '{"labels":["bug","needs-review"]}' \
     "https://api.github.com/repos/RLRyals/BQ-Studio/issues/42/labels"
```

### 9. Search Issues

```bash
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/search/issues?q=repo:RLRyals/BQ-Studio+is:issue+is:open+label:bug"
```

## Response Format

All responses return JSON data. Common fields:

```json
{
  "id": 123456789,
  "number": 42,
  "title": "Issue title",
  "body": "Issue description",
  "state": "open",
  "labels": [
    {"name": "bug", "color": "d73a4a"}
  ],
  "user": {
    "login": "username",
    "id": 12345
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z",
  "closed_at": null,
  "html_url": "https://github.com/RLRyals/BQ-Studio/issues/42"
}
```

## Rate Limiting

GitHub API has rate limits:
- **Authenticated requests**: 5,000 per hour
- **Search API**: 30 requests per minute

Check rate limit status:
```bash
curl -H "Authorization: token $GITHUB_AUTH_TOKEN" \
     "https://api.github.com/rate_limit"
```

## Error Handling

Common HTTP status codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `304 Not Modified` - Resource hasn't changed
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Rate limit exceeded or insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation failed

Example error response:
```json
{
  "message": "Bad credentials",
  "documentation_url": "https://docs.github.com/rest"
}
```

## Best Practices

1. **Always set User-Agent header** - GitHub requires this for API requests
2. **Use Accept header** - Specify `application/vnd.github.v3+json` for consistent responses
3. **Handle rate limits** - Check `X-RateLimit-Remaining` header
4. **Implement retry logic** - For network errors, use exponential backoff
5. **Validate token** - Check for 401 errors and notify if token is invalid
6. **Use pagination** - For large result sets, iterate through pages
7. **Cache responses** - Where appropriate, cache issue data to reduce API calls

## Example: Complete Issue Workflow

```javascript
const https = require('https');

function githubRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${process.env.GITHUB_AUTH_TOKEN}`,
        'User-Agent': 'BQ-Studio-Claude',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`API error: ${res.statusCode} ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// List open issues
async function listOpenIssues() {
  return await githubRequest('GET', '/repos/RLRyals/BQ-Studio/issues?state=open');
}

// Create new issue
async function createIssue(title, body, labels) {
  return await githubRequest('POST', '/repos/RLRyals/BQ-Studio/issues', {
    title, body, labels
  });
}

// Close issue
async function closeIssue(issueNumber) {
  return await githubRequest('PATCH', `/repos/RLRyals/BQ-Studio/issues/${issueNumber}`, {
    state: 'closed'
  });
}

// Add comment
async function addComment(issueNumber, comment) {
  return await githubRequest('POST', `/repos/RLRyals/BQ-Studio/issues/${issueNumber}/comments`, {
    body: comment
  });
}
```

## Troubleshooting

### Token Invalid or Expired
If you receive `401 Unauthorized` errors:
- Token may have expired (classic PATs don't expire, but can be revoked)
- Token may lack required permissions
- Check token is correctly set in environment: `echo $GITHUB_AUTH_TOKEN`

### Permission Denied
If you receive `403 Forbidden` errors:
- Verify token has `repo` scope enabled
- Check rate limits: `curl -H "Authorization: token $GITHUB_AUTH_TOKEN" https://api.github.com/rate_limit`
- Ensure token hasn't been revoked in GitHub settings

### API Format Changes
GitHub occasionally updates API versions:
- Use `Accept: application/vnd.github.v3+json` for stable v3 API
- Check GitHub's API changelog for breaking changes
- Consider migrating to newer API versions when available

## References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub API Issues Endpoint](https://docs.github.com/en/rest/issues/issues)
- [GitHub Authentication](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)
- [GitHub Rate Limiting](https://docs.github.com/en/rest/rate-limit)
