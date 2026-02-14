# Authentication

The Nudgebee authentication flow uses a short-lived access token for GraphQL requests. The typical pattern is:

1. Exchange your long-lived API secret (created in the UI) for a short-lived access token via the token endpoint hosted on the web app domain (`https://app.nudgebee.com/api/auth/token`).
2. Call the GraphQL API at `https://api.nudgebee.com/graphql` using the returned access token in the `Authorization: Bearer` header.


## Two-Step Authentication Flow

### Step 1: Generate an Access Token
Call the token endpoint with your API credentials to get a short-lived access token.

### Step 2: Use the Token for Requests
Include the access token in the `Authorization: Bearer` header for all GraphQL API calls.

---

## Step 1: Generate Token

**Token Endpoint:** `POST /api/auth/token`
**Token Base URL:** `https://app.nudgebee.com` (or your custom instance)

**GraphQL Endpoint:** `https://api.nudgebee.com/graphql`

### Request

Send your email/username and API secret:

```json
{
  "email": "your-email@example.com",
  "secret": "YOUR_API_TOKEN"
}
```

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiry": 3600
}
```

- **token**: Your access token (valid for 1 hour)
- **expiry**: Seconds until token expires

### Example with cURL

```bash
curl -X POST https://app.nudgebee.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "secret": "YOUR_API_TOKEN"
  }'
```

---

## Step 2: Use Token in API Requests

Include the token in the Authorization header:

```bash
curl -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { account_env_type(limit: 10) { value } }"}'
```

---

## Implementation Examples

### cURL examples

Below are simple `curl` examples showing the two-step flow: exchange your API secret for a short-lived access token, then call the GraphQL endpoint.

#### Exchange API secret for access token

```bash
curl -s -X POST https://app.nudgebee.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","secret":"YOUR_API_TOKEN"}' | jq .
```

Sample response:

```json
{
  "token": "YOUR_ACCESS_TOKEN",
  "expiry": 3600
}
```

#### Call GraphQL with the access token

```bash
curl -s -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { account_env_type(limit: 10) { value } }"}' | jq .
```

#### Example shell snippet (cache token in env)

```bash
# Fetch and cache token (valid for $expiry seconds)
resp=$(curl -s -X POST https://app.nudgebee.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","secret":"YOUR_API_TOKEN"}')
export NUDGEBEE_TOKEN=$(echo "$resp" | jq -r .token)
export NUDGEBEE_TOKEN_EXPIRY=$(($(date +%s) + $(echo "$resp" | jq -r .expiry) - 10))

# Use token
curl -s -X POST https://api.nudgebee.com/graphql \
  -H "Authorization: Bearer $NUDGEBEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { agent(limit: 5) { id name } }"}' | jq .
```

### JavaScript/Node.js

Promise-based implementation:

```javascript
const https = require('https');

class NudgebeeClient {
    constructor(email, secret, baseUrl = 'https://app.nudgebee.com') {
    this.email = email;
    this.secret = secret;
    this.baseUrl = baseUrl;
    this.token = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Return cached token if still valid
    if (this.token && new Date() < this.tokenExpiry) {
      return this.token;
    }

    const payload = JSON.stringify({
      email: this.email,
      secret: this.secret
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: new URL(this.baseUrl).hostname,
        path: '/api/auth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const response = JSON.parse(data);
          this.token = response.token;
          this.tokenExpiry = new Date(Date.now() + response.expiry * 1000 - 10000);
          resolve(this.token);
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  async executeGraphQL(query, variables = {}) {
    const token = await this.getAccessToken();

    const payload = JSON.stringify({
      query,
      variables
    });

    return new Promise((resolve, reject) => {
      const options = {
        hostname: new URL('https://api.nudgebee.com').hostname,
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': payload.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

// Usage:
// const client = new NudgebeeClient('your-email@example.com', 'YOUR_API_TOKEN');
// const result = await client.executeGraphQL('query { agent(limit: 5) { id name } }');
```

### Python

Using the `requests` library:

```python
import requests
from datetime import datetime, timedelta

class NudgebeeClient:
    def __init__(self, email, secret, base_url='https://app.nudgebee.com'):
        self.email = email
        self.secret = secret
        self.base_url = base_url
        self.token = None
        self.token_expiry = None
        self.session = requests.Session()

    def get_access_token(self):
        # Return cached token if still valid
        if self.token and datetime.now() < self.token_expiry:
            return self.token

        token_url = f"{self.base_url}/api/auth/token"
        payload = {
            "email": self.email,
            "secret": self.secret
        }

        response = self.session.post(token_url, json=payload)
        response.raise_for_status()
        data = response.json()

        self.token = data['token']
        self.token_expiry = datetime.now() + timedelta(seconds=data['expiry'] - 10)
        return self.token

    def execute_graphql(self, query, variables=None):
        token = self.get_access_token()

        graphql_url = "https://api.nudgebee.com/graphql"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        payload = {
            'query': query,
            'variables': variables or {}
        }

        response = self.session.post(graphql_url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

# Usage:
# client = NudgebeeClient('your-email@example.com', 'YOUR_API_TOKEN')
# result = client.execute_graphql('query { agent(limit: 5) { id name } }')
```

### Apollo Client (Frontend)

For JavaScript frontend applications:

```javascript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.nudgebee.com/graphql',
    credentials: 'include',
    headers: {
      authorization: `Bearer YOUR_ACCESS_TOKEN`,
    },
  }),
  cache: new InMemoryCache(),
});
```

---

## Token Management Best Practices

### 1. **Cache Tokens**
Store tokens in memory and reuse them until expiry.

### 2. **Proactive Refresh**
Request a new token when current token is within 10 seconds of expiry.

### 3. **Handle 401 Errors**
If you receive a 401 (Unauthorized):
1. Discard the current token
2. Request a new token
3. Retry the request

### 4. **Concurrent Requests**
In multi-threaded environments, use locks to prevent multiple simultaneous token requests:

**Shell / single-process lock (example):**
```bash
# Use a file lock to ensure only one process fetches/refreshes the token
(
  flock -n 9 || exit 1
  if [ -z "$NUDGEBEE_TOKEN" ] || [ "$(date +%s)" -ge "$NUDGEBEE_TOKEN_EXPIRY" ]; then
    resp=$(curl -s -X POST https://app.nudgebee.com/api/auth/token \
      -H "Content-Type: application/json" \
      -d '{"email":"your-email@example.com","secret":"YOUR_API_TOKEN"}')
    export NUDGEBEE_TOKEN=$(echo "$resp" | jq -r .token)
    export NUDGEBEE_TOKEN_EXPIRY=$(($(date +%s) + $(echo "$resp" | jq -r .expiry) - 10))
  fi
) 9>/var/lock/nudgebee_token.lock

```

**Python:**
```python
from threading import Lock
class NudgebeeClient:
  def __init__(self, ...):
    self.lock = Lock()
  def get_access_token(self):
    with self.lock:
      # ... token logic
```

### 5. **Secure Storage**
Never hardcode API tokens in your code:

```bash
# Use environment variables
export NUDGEBEE_EMAIL="your-email@example.com"
export NUDGEBEE_API_TOKEN="your-api-token"

# Access in code:
# Go: os.Getenv("NUDGEBEE_API_TOKEN")
# Python: os.environ.get("NUDGEBEE_API_TOKEN")
# JS: process.env.NUDGEBEE_API_TOKEN
```

---

## Common Issues

### Token Not Working
- Verify email and secret are correct
- Check that token hasn't expired
- Ensure correct format: `Authorization: Bearer TOKEN`

### 401 Unauthorized
- Token may have expired, request a new one
- Verify Bearer token is included in header

### 403 Forbidden
- Your account may not have permission for this operation
- Contact support if you believe this is an error

---

## Security Checklist

- ✅ Never commit tokens to version control
- ✅ Use environment variables for credentials
- ✅ Rotate tokens regularly
- ✅ Use HTTPS/TLS for all requests
- ✅ Implement token expiry handling
- ✅ Log authentication failures
- ✅ Use dedicated service accounts for automation
