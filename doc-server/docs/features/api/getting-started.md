# Getting Started with Nudgebee GraphQL API

## What is the Nudgebee GraphQL API?

The Nudgebee GraphQL API provides programmatic access to your account's data and operations. It enables you to:
- Monitor agents and their tasks
- Retrieve AI-powered insights and recommendations
- Manage anomaly detection and optimization
- Track applications and resources
- Audit account activities
- Automate workflows and runbooks

## Quick Start (3 Steps)

### Step 1: Get Your API Endpoint

```
https://api.nudgebee.com/graphql
```

### Step 2: Generate an API Token (secret)

Follow these steps to create a new API token (this is the long-lived secret shown once in the UI):

1. **Log in** to your Nudgebee account
2. **Click your user menu** (top-right corner)
3. **Select "API Tokens"** from the dropdown
4. **Click "Create New Token"** button
5. **Enter a descriptive name** (e.g., "Production API", "CI/CD Integration")
6. **Click "Create Token"**
7. **Copy and save your token** securely (shown only once!)

⚠️ **Important:** The token shown in the UI is a long-lived secret (your API secret). Do NOT use this secret directly as a `Bearer` token when calling the GraphQL API. Instead, exchange it at the token endpoint for a short-lived access token and use that access token in the `Authorization: Bearer` header for GraphQL requests. Store the UI secret securely (environment variables, secret manager), and never commit it to source control.

### Step 3: Make Your First Query

Exchange your API secret (the token you copied from the UI) for a short-lived access token, then call the GraphQL endpoint with that access token.

1) Get an access token:

```bash
curl -X POST https://app.nudgebee.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","secret":"YOUR_API_TOKEN"}'
```

Example response:

```json
{ "token": "YOUR_ACCESS_TOKEN", "expiry": 3600 }
```

2) Use the access token to call the GraphQL API:

```bash
curl -X POST https://api.nudgebee.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"query":"query { account_env_type(limit: 10) { value } }"}'
```

**Expected Response:**
```json
{
  "data": {
    "account_env_type": [
      { "value": "dev" },
      { "value": "staging" },
      { "value": "production" }
    ]
  }
}
```

✅ **Success!** You've made your first API call.

---

## Requirements

Before using the API, ensure you have:

- ✅ A valid Nudgebee account
- ✅ An API token (generated via user menu)
- ✅ An HTTP client: cURL, Postman, Insomnia, or programming language library
- ✅ Basic GraphQL knowledge (optional but helpful)

---

## What You Can Do

### 1. **Query Data**
Fetch information about agents, anomalies, applications, and more.

```graphql
query {
  agent(limit: 5) {
    id
    name
    status
  }
}
```

### 2. **Monitor Operations**
Track anomalies, auto-optimizations, and auto-pilot executions.

```graphql
query {
  anomaly_v2(limit: 20, order_by: [{created_at: desc}]) {
    id
    name
    severity
    created_at
  }
}
```

### 3. **Get AI Insights**
Retrieve root cause analysis and recommendations.

```graphql
query {
  ai_get_rca(account_id: "your-account-id", event_id: "event-id", generate: true) {
    response
  }
}
```

### 4. **Manage Resources**
Access information about active resources and optimization opportunities.

```graphql
query {
  active_resources(limit: 10, where: {tenant_id: {_eq: "your-tenant-id"}}) {
    external_resource_id
    resource_type
  }
}
```


---

## Common Use Cases

### 1. **CI/CD Integration**
Trigger optimizations, deployments, or troubleshooting from your pipeline.

### 2. **Monitoring Dashboards**
Pull real-time data to display in custom dashboards.

### 3. **Automation Scripts**
Write scripts to automate repetitive tasks like anomaly investigation or resource management.

### 4. **Data Export**
Export audit logs, metrics, and optimization recommendations for reporting.

### 5. **System Integration**
Connect Nudgebee with your existing tools and platforms.

---

## Next Steps

1. **[Learn Authentication](./authentication.md)** - Understand token management and implementation
2. **[Explore API Categories](./api-categories.md)** - Discover what APIs are available
3. **[Query Patterns](./query-patterns.md)** - Learn common GraphQL patterns
4. **[Error Handling](./error-handling.md)** - Handle errors gracefully
5. **[Full Reference](./reference.md)** - Complete API documentation

---

## Troubleshooting

### "Invalid token" error?
- Ensure your token hasn't expired (check "Last Used" in API Tokens page)
- Verify you're using `Bearer YOUR_TOKEN` in the Authorization header
- Create a new token if needed

### "Unauthorized (401)" error?
- Check that your email and secret are correct when requesting a token
- Verify the Authorization header is properly formatted

### "GraphQL parse error"?
- Check your query syntax against [Query Patterns](./query-patterns.md)
- Validate JSON in your request body

Need more help? See [Error Handling](./error-handling.md) for detailed guidance.
