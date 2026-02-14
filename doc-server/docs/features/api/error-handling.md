# Error Handling

Proper error handling is critical for building reliable applications. This guide covers common errors and how to handle them.

---

## HTTP Status Codes

| Status | Meaning | What To Do |
|--------|---------|-----------|
| 200 | OK | Success! Check the response body for data |
| 400 | Bad Request | Invalid query syntax or arguments. Check your GraphQL query |
| 401 | Unauthorized | Invalid or missing token. Generate a new token |
| 403 | Forbidden | You don't have permission for this operation |
| 429 | Rate Limit | Too many requests. Implement exponential backoff |
| 500 | Server Error | Server issue. Retry after a delay |

---

## Common GraphQL Errors

### 1. Unauthorized (401)

**Error Response:**
```json
{
  "errors": [{
    "message": "Invalid or missing authorization token",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```

**Causes:**
- Missing `Authorization` header
- Invalid or expired token
- Malformed header (missing `Bearer` prefix)

**Solution:**
```bash
# ✅ Correct format
curl -H "Authorization: Bearer YOUR_TOKEN" ...

# ❌ Wrong formats
-H "Authorization: YOUR_TOKEN"              # Missing "Bearer"
-H "Authorization: Bearer"                  # Missing token
-H "Authorization: Bearer TokenWithoutSpace" # Needs the token
```

In code:
```bash
# curl example (header format)
curl -H "Authorization: Bearer $TOKEN" ...

# JavaScript
headers['Authorization'] = `Bearer ${token}`;

# Python
headers['Authorization'] = f'Bearer {token}'
```

---

### 2. Invalid Query (400)

**Error Response:**
```json
{
  "errors": [{
    "message": "Parse error on line 2, column 5: Expected Name, found }",
    "locations": [{
      "line": 2,
      "column": 5
    }]
  }]
}
```

**Causes:**
- GraphQL syntax errors
- Missing required fields
- Typos in field names
- Invalid variable types

**Solution:** Check your query syntax carefully:

```graphql
# ❌ Wrong - missing query keyword
{
  agent(limit: 5) {
    id name
  }
}

# ✅ Correct
query {
  agent(limit: 5) {
    id
    name
  }
}
```

**Debug Tip:** Use GraphQL IDE like Apollo Sandbox or Postman with syntax highlighting.

---

### 3. Rate Limit (429)

**Error Response:**
```json
{
  "errors": [{
    "message": "Rate limit exceeded. Max 100 requests per minute.",
    "extensions": {
      "code": "RATE_LIMITED"
    }
  }]
}
```

**Causes:**
- Too many requests in a short time
- Default limit: 100 requests/minute

**Solution - Exponential Backoff:**

**Bash (curl with exponential backoff):**
```bash
execute_with_retry() {
  max_retries=${1:-5}; shift
  attempt=0
  while [ $attempt -lt $max_retries ]; do
    resp_file=$(mktemp)
    status=$(curl -s -w "%{http_code}" -o "$resp_file" "$@")
    if [ "$status" -ne 429 ]; then
      cat "$resp_file"
      rm -f "$resp_file"
      return 0
    fi
    backoff=$((2 ** attempt))
    sleep "$backoff"
    attempt=$((attempt + 1))
  done
  echo "max retries exceeded" >&2
  return 1
}

## Usage:
# execute_with_retry 5 curl -X POST https://api.nudgebee.com/graphql -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"query":"..."}'
```

**Python:**
```python
import time
import random

def execute_with_retry(fn, max_retries=5):
  for attempt in range(max_retries):
    try:
      return fn()
    except RateLimitError:
      backoff = (2 ** attempt) + random.uniform(0, 1)
      time.sleep(backoff)
  raise Exception("Max retries exceeded")
```

**JavaScript:**
```javascript
async function executeWithRetry(fn, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const backoff = Math.pow(2, attempt) + Math.random();
        await new Promise(r => setTimeout(r, backoff * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

### 4. Validation Error

**Error Response:**
```json
{
  "errors": [{
    "message": "field 'limit' has type Int but received String"
  }]
}
```

**Causes:**
- Wrong data type for argument
- Negative values for limit/offset
- Invalid enum value

**Solution:** Check argument types:

```graphql
# ❌ Wrong - limit is string
query {
  agent(limit: "10") {
    id
  }
}

# ✅ Correct - limit is integer
query {
  agent(limit: 10) {
    id
  }
}
```

---

### 5. Server Error (500)

**Error Response:**
```json
{
  "errors": [{
    "message": "Internal server error",
    "extensions": {
      "code": "INTERNAL_SERVER_ERROR"
    }
  }]
}
```

**Causes:**
- Temporary server issue
- Database problem
- Service overload

**Solution:**
1. Retry after 5-10 seconds
2. Implement exponential backoff
3. Contact support if persists

---

## Error Handling Examples

### cURL / shell example

Use `curl` and `jq` to call the API, inspect HTTP status and GraphQL `errors`, and handle common cases.

```bash
resp_file=$(mktemp)
status=$(curl -s -w "%{http_code}" -o "$resp_file" \
  -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer $NUDGEBEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { agent(limit: 5) { id name } }"}')

if [ "$status" -ne 200 ]; then
  echo "HTTP error: $status" >&2
  cat "$resp_file" >&2
  rm -f "$resp_file"
  exit 1
fi

if jq -e '.errors' "$resp_file" >/dev/null; then
  code=$(jq -r '.errors[0].extensions.code // "UNKNOWN"' "$resp_file")
  message=$(jq -r '.errors[0].message' "$resp_file")
  case "$code" in
    UNAUTHENTICATED)
      echo "Authentication failed: $message" >&2; exit 2 ;;
    RATE_LIMITED)
      echo "Rate limited: $message" >&2; exit 3 ;;
    INTERNAL_SERVER_ERROR)
      echo "Server error: $message" >&2; exit 4 ;;
    *)
      echo "GraphQL error: $message" >&2; exit 5 ;;
  esac
fi

jq '.data' "$resp_file"
rm -f "$resp_file"
```

### Python Client

```python
import logging

class GraphQLError(Exception):
  def __init__(self, message, code=None):
    self.message = message
    self.code = code
    super().__init__(self.message)

def handle_graphql_response(response):
  if 'errors' in response:
    error = response['errors'][0]
    message = error.get('message', 'Unknown error')
    code = error.get('extensions', {}).get('code')

    if code == 'UNAUTHENTICATED':
      raise GraphQLError(f"Auth failed: {message}", code)
    elif code == 'RATE_LIMITED':
      raise GraphQLError(f"Rate limited: {message}", code)
    elif code == 'INTERNAL_SERVER_ERROR':
      raise GraphQLError(f"Server error: {message}", code)
    else:
      raise GraphQLError(message, code)

  return response.get('data')
```

### JavaScript Client

```javascript
async function executeGraphQLSafely(query, variables) {
  try {
    const response = await fetch('https://api.nudgebee.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      const error = data.errors[0];
      const code = error.extensions?.code;

      switch (code) {
        case 'UNAUTHENTICATED':
          throw new AuthError(error.message);
        case 'RATE_LIMITED':
          throw new RateLimitError(error.message);
        case 'INTERNAL_SERVER_ERROR':
          throw new ServerError(error.message);
        default:
          throw new GraphQLError(error.message);
      }
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
}
```

---

## Error Handling Strategies

### 1. Always Use Try-Catch

```python
try:
  result = client.execute_graphql(query)
except GraphQLError as e:
  logger.error(f"GraphQL error: {e.message}")
except RateLimitError:
  logger.info("Rate limited, retrying...")
except Exception as e:
  logger.error(f"Unexpected error: {e}")
```

### 2. Log Errors With Context

```bash
printf "GraphQL Error - Query: %s, Error: %s, Code: %s\n" "$query" "$err_msg" "$code"
```

### 3. Distinguish Error Types

```javascript
if (error instanceof AuthError) {
  // Request new token
} else if (error instanceof RateLimitError) {
  // Implement backoff
} else if (error instanceof ValidationError) {
  // Fix query and retry
} else {
  // Generic error handling
}
```

### 4. Implement Circuit Breaker

```python
class CircuitBreaker:
  def __init__(self, failure_threshold=5, timeout=60):
    self.failure_count = 0
    self.failure_threshold = failure_threshold
    self.timeout = timeout
    self.last_failure_time = None

  def call(self, fn):
    if self.is_open():
      raise CircuitBreakerOpen("Service temporarily unavailable")

    try:
      return fn()
    except Exception as e:
      self.record_failure()
      raise
```

---

## Best Practices

✅ **Do:**
- Log all errors with timestamps and context
- Implement exponential backoff for retries
- Use proper error types/classes
- Return meaningful error messages
- Monitor error rates

❌ **Don't:**
- Ignore all errors silently
- Retry infinitely without backoff
- Expose sensitive data in error messages
- Fail the entire operation on one error
- Log tokens or secrets

---

## Debugging Tips

1. **Enable Verbose Logging:** See full request/response details
2. **Use GraphQL Playground:** Test queries interactively
3. **Check Token Expiry:** Tokens expire after 1 hour
4. **Validate JSON:** Ensure request body is valid JSON
5. **Check Rate Limits:** Monitor your request frequency

---

## Support

If you need help:
1. Check this guide for common errors
2. Review [Query Patterns](./query-patterns.md) for correct syntax
3. Check [Authentication](./authentication.md) for token issues
4. Enable verbose logging for detailed error info
5. Contact Nudgebee support with error details
