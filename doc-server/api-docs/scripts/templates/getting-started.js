module.exports = function getGettingStartedMarkdown() {
  return `## Getting Started

### How the API is shaped

Requests are GraphQL documents POSTed to \`/api/graphql\`, but the schema is **not** a table-per-entity
schema. Every operation is a named **action** — \`accounts_list\`, \`events_list_v2\`,
\`recommendations_list\` — routed by the in-app gateway to the service that owns it. Query the action,
not a table: there is no \`cloud_accounts\` root field; the account listing is \`accounts_list\`.

Most list actions share a shape: \`limit\`, \`offset\`, \`order_by\` and a typed \`where\`, answering with a
\`rows\` array.

### Authentication

Create an API token in **Admin → Access & Users → API Tokens**, then exchange it for a JWT. The API
token is used as the \`secret\` in step one — it is **not** sent directly as a bearer token.

\`\`\`bash
curl -X POST https://your-domain.com/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your-api-user@example.com", "secret": "your-api-token"}'
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiry": 3600
}
\`\`\`

Then send the JWT as a bearer token on every request:

\`\`\`bash
curl -X POST https://your-domain.com/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"query": "{ accounts_list(limit: 3) { rows { id account_name cloud_provider } } }"}'
\`\`\`

See [API Tokens](./api-tokens.md) for token lifecycle and scoping.

### List Cloud Accounts Example

**GraphQL Query:**

\`\`\`graphql
query CloudAccounts {
  accounts_list(limit: 3) {
    rows {
      id
      account_name
      cloud_provider
      status
    }
  }
}
\`\`\`

**Full curl example:**

\`\`\`bash
# Step 1: Exchange the API token for a JWT
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"email": "api-user@example.com", "secret": "your-api-token"}' \\
  | jq -r '.token')

# Step 2: Call an action
curl -X POST https://your-domain.com/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{
    "query": "query HelloWorld { accounts_list(limit: 3) { rows { id account_name cloud_provider status } } }"
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
        accounts_list(limit: 3) {
          rows {
            id
            account_name
            cloud_provider
            status
          }
        }
      }
    \`,
  }),
});

const { data } = await response.json();
console.log(data.accounts_list.rows);
\`\`\`

### Errors

A failed call still returns HTTP 200 with a GraphQL \`errors\` array. Two messages are worth
recognising:

| Message | Meaning |
|---|---|
| \`Upstream unreachable for <action>\` | The service that owns the action is down. |
| \`Handler URL unresolved for <action>\` | The deployment has no URL configured for that service. |

Calls made against \`/api/rpc\` instead of \`/api/graphql\` surface the same two as HTTP **502** and
**500** respectively.

---

`;
};
