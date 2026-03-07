module.exports = function getGettingStartedMarkdown() {
  return `## Getting Started

### Authentication

The Nudgebee GraphQL API supports three authentication methods:

#### 1. Programmatic Token (Recommended for API integrations)

Request a JWT token by POSTing to the token endpoint:

\`\`\`bash
curl -X POST https://your-domain.com/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your-api-user@example.com", "secret": "your-api-secret"}'
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiry": 3600
}
\`\`\`

Then include the token in subsequent requests:

\`\`\`bash
curl -X POST https://your-domain.com/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"query": "{ cloud_accounts { id account_name cloud_provider } }"}'
\`\`\`

### List Cloud Accounts Example

**GraphQL Query:**

\`\`\`graphql
query CloudAccounts {
  cloud_accounts(limit: 3) {
    id
    account_name
    cloud_provider
    status
  }
}
\`\`\`

**Full curl example:**

\`\`\`bash
# Step 1: Get a token
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"email": "api-user@example.com", "secret": "your-secret"}' \\
  | jq -r '.token')

# Step 2: Query the API
curl -X POST https://your-domain.com/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "query": "query HelloWorld { cloud_accounts(limit: 3) { id account_name cloud_provider status } }"
  }'
\`\`\`

**JavaScript example:**

\`\`\`javascript
const response = await fetch('https://your-domain.com/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    query: \`
      query HelloWorld {
        cloud_accounts(limit: 3) {
          id
          account_name
          cloud_provider
          status
        }
      }
    \`,
  }),
});

const { data } = await response.json();
console.log(data.cloud_accounts);
\`\`\`

---

`;
};
