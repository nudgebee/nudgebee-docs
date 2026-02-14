# Common GraphQL Query Patterns

This guide shows the most common patterns used when working with the Nudgebee GraphQL API.

---

## 1. Basic List Query

Fetch a list of items with optional filtering and sorting:

```graphql
query {
  agent(
    limit: 10
    offset: 0
    order_by: [{created_at: desc}]
    where: {status: {_eq: "active"}}
  ) {
    id
    name
    created_at
    status
  }
}
```

**Use Case:** Get the 10 most recently created active agents.

**Response:**
```json
{
  "data": {
    "agent": [
      {
        "id": "agent-uuid-1",
        "name": "Production Agent",
        "created_at": "2026-02-14T10:00:00Z",
        "status": "active"
      }
    ]
  }
}
```

---

## 2. Aggregated Data (Counts & Stats)

Get summary statistics and counts:

```graphql
query {
  agent_aggregate(
    where: {status: {_eq: "active"}}
  ) {
    aggregate {
      count
    }
  }
}
```

**Use Case:** Count total number of active agents.

**Response:**
```json
{
  "data": {
    "agent_aggregate": {
      "aggregate": {
        "count": 42
      }
    }
  }
}
```

---

## 3. Fetch by Primary Key

Get a specific record by ID:

```graphql
query {
  agent_by_pk(id: "agent-uuid-123") {
    id
    name
    status
    created_at
    updated_at
  }
}
```

**Use Case:** Get detailed information about a specific agent.

**Response:**
```json
{
  "data": {
    "agent_by_pk": {
      "id": "agent-uuid-123",
      "name": "My Agent",
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-02-14T12:00:00Z"
    }
  }
}
```

---

## 4. Complex Filtering

Use multiple conditions with `_and`, `_or`, and comparison operators:

```graphql
query {
  anomaly(
    where: {
      _and: [
        {severity: {_gte: "high"}}
        {created_at: {_gt: "2026-02-01"}}
        {status: {_neq: "resolved"}}
      ]
    }
    limit: 50
    order_by: [{created_at: desc}]
  ) {
    id
    name
    severity
    created_at
    status
  }
}
```

**Use Case:** Find unresolved high-severity anomalies created after Feb 1st.

**Comparison Operators:**
- `_eq` - Equals
- `_neq` - Not equals
- `_gt` - Greater than
- `_gte` - Greater than or equal
- `_lt` - Less than
- `_lte` - Less than or equal
- `_in` - In array
- `_nin` - Not in array

---

## 5. Distinct Queries

Get unique values:

```graphql
query {
  anomaly(
    distinct_on: [severity]
    where: {status: {_eq: "active"}}
  ) {
    severity
  }
}
```

**Use Case:** Get all unique severity levels for active anomalies.

**Response:**
```json
{
  "data": {
    "anomaly": [
      {"severity": "critical"},
      {"severity": "high"},
      {"severity": "medium"},
      {"severity": "low"}
    ]
  }
}
```

---

## 6. Pagination

Paginate through large result sets:

```graphql
query {
  anomaly(
    limit: 20
    offset: 40
    order_by: [{created_at: desc}]
  ) {
    id
    name
    created_at
  }
}
```

**Use Case:** Get results 40-60 (the 3rd page with 20 items per page).

**Best Practice:**
```javascript
async function getAllResults(pageSize = 20) {
  const allResults = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await client.query({
      query: `query {
        anomaly(limit: ${pageSize}, offset: ${offset}) {
          id name
        }
      }`
    });

    if (response.data.anomaly.length < pageSize) {
      hasMore = false;
    }

    allResults.push(...response.data.anomaly);
    offset += pageSize;
  }

  return allResults;
}
```

---

## 7. Selecting Specific Fields

Only request the fields you need:

```graphql
query {
  agent(limit: 5) {
    id
    name
  }
}
```

**vs. All fields:**

```graphql
query {
  agent(limit: 5) {
    id
    name
    status
    created_at
    updated_at
    configuration
    metadata
    last_heartbeat
  }
}
```

**Best Practice:** Only select fields you actually use to reduce response size and improve performance.

---

## 8. Combining Queries (Multiple Root Fields)

Execute multiple queries in one request:

```graphql
query {
  agents: agent(limit: 5) {
    id
    name
  }
  anomalies: anomaly(limit: 10) {
    id
    name
    severity
  }
  active_resources_count: active_resources_aggregate {
    aggregate {
      count
    }
  }
}
```

**Use Case:** Get agents, anomalies, and resource count in a single request.

---

## 9. Using Variables

Pass variables instead of hardcoding values:

```graphql
query ListAgents($limit: Int, $status: String) {
  agent(limit: $limit, where: {status: {_eq: $status}}) {
    id
    name
  }
}
```

**Variables (JSON):**
```json
{
  "limit": 10,
  "status": "active"
}
```

**Client Example (curl):**
```bash
curl -s -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer $NUDGEBEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query ListAgents($limit: Int, $status: String) { agent(limit: $limit, where: {status: {_eq: $status}}) { id name } }","variables":{"limit":10,"status":"active"}}' | jq .
```

**Best Practice:** Always use variables for user input to prevent query injection.

---

## 10. Handling Null Values

Check for null values in your responses:

```graphql
query {
  agent(limit: 5) {
    id
    name
    description  # May be null
    last_heartbeat  # May be null
  }
}
```

**In your code:**
```javascript
response.data.agent.forEach(agent => {
  console.log(agent.name); // Always exists
  console.log(agent.description || 'No description'); // Handle null
});
```

---

## Real-World Examples

### Example 1: Monitor Recent Anomalies

Get anomalies from the last 24 hours:

```graphql
query RecentAnomalies {
  anomaly(
    where: {
      created_at: {_gt: "2026-02-13"}
    }
    order_by: [{created_at: desc}]
    limit: 50
  ) {
    id
    name
    severity
    resource_type
    created_at
  }
}
```

### Example 2: Count Active Resources by Type

Group and count resources:

```graphql
query {
  ec2_count: active_resources_aggregate(
    where: {resource_type: {_eq: "EC2"}}
  ) {
    aggregate { count }
  }
  rds_count: active_resources_aggregate(
    where: {resource_type: {_eq: "RDS"}}
  ) {
    aggregate { count }
  }
  s3_count: active_resources_aggregate(
    where: {resource_type: {_eq: "S3"}}
  ) {
    aggregate { count }
  }
}
```

### Example 3: List Agents with Status

Get agents grouped by status:

```graphql
query {
  active_agents: agent(where: {status: {_eq: "active"}}) {
    id
    name
  }
  inactive_agents: agent(where: {status: {_eq: "inactive"}}) {
    id
    name
  }
}
```

### Example 4: Search with Text Match

Find agents by name pattern:

```graphql
query {
  agent(
    where: {name: {_ilike: "%production%"}}
    limit: 20
  ) {
    id
    name
  }
}
```

**String Operators:**
- `_like` - Case-sensitive pattern match
- `_ilike` - Case-insensitive pattern match
- `_eq` - Exact match
- `_neq` - Not equal

---

## Performance Tips

1. **Limit Results:** Always use `limit` to prevent loading entire tables
2. **Filter Early:** Use `where` to filter on the backend, not in your application
3. **Select Fields:** Only request fields you need
4. **Use Pagination:** Don't fetch all records at once for large datasets
5. **Combine Queries:** Use multiple root fields instead of multiple requests
6. **Pre-sort Data:** Let the API sort with `order_by` instead of sorting in code

---

## Common Mistakes

❌ **Wrong:** Fetching all records without limit
```graphql
query {
  anomaly {  # Could be millions!
    id
    name
  }
}
```

✅ **Correct:** Using limit and pagination
```graphql
query {
  anomaly(limit: 100, offset: 0) {
    id
    name
  }
}
```

---

## More Resources

- [API Categories](./api-categories.md) - Available endpoints
- [Authentication](./authentication.md) - How to authenticate
- [Error Handling](./error-handling.md) - Handling errors
- [Full Reference](./reference.md) - Complete endpoint documentation
