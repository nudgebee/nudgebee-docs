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

#### 2. Admin Secret (Server-side / internal use only)

For server-to-server calls, use the Hasura admin secret header directly against the Hasura endpoint:

\`\`\`bash
curl -X POST https://your-domain.com/v1/graphql \\
  -H "Content-Type: application/json" \\
  -H "x-hasura-admin-secret: YOUR_ADMIN_SECRET" \\
  -d '{"query": "{ cloud_accounts { id account_name } }"}'
\`\`\`

> **Warning:** Never expose the admin secret in client-side code.

#### 3. Session Cookie (Browser / Frontend)

The Next.js frontend uses NextAuth session cookies. Requests are proxied through \`/api/graphql\` which attaches the JWT automatically. This method is only relevant for custom frontend development.

### Base URL

| Context | Endpoint |
|---------|----------|
| Via Next.js proxy (recommended) | \`https://your-domain.com/api/graphql\` |
| Direct Hasura access | \`https://your-domain.com/v1/graphql\` |

All requests use \`POST\` method with \`Content-Type: application/json\`.

### Request Format

\`\`\`json
{
  "query": "query MyQuery($var: Type!) { ... }",
  "variables": { "var": "value" },
  "operationName": "MyQuery"
}
\`\`\`

### Roles & Permissions

The JWT token includes Hasura claims that determine data access:

| Role | Scope |
|------|-------|
| \`tenant_admin\` | Full access to all tenant data |
| \`tenant_admin_readonly\` | Read-only access to all tenant data |
| \`account_admin\` | Full access to assigned cloud accounts |
| \`account_admin_readonly\` | Read-only access to assigned accounts |
| \`k8s_namespace_admin\` | Full access to assigned K8s namespaces |
| \`k8s_namespace_admin_readonly\` | Read-only access to K8s namespaces |
| \`tenant_usage\` | Minimal access (default when no roles assigned) |

Data is automatically filtered by your role. For example, \`account_admin\` users only see data for their assigned accounts.

### Hello World Example

**GraphQL Query:**

\`\`\`graphql
query HelloWorld {
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
