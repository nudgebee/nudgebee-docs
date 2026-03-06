---
sidebar_position: 1
---
# Nudgebee GraphQL API

Nudgebee exposes a GraphQL API that lets you programmatically query and manage your cloud infrastructure, Kubernetes clusters, events, recommendations, tickets, and more.

## API Endpoint

All GraphQL requests are sent to a single endpoint:

```
POST https://<your-nudgebee-domain>/api/graphql
```

For example, if you are using the Nudgebee SaaS platform:

```
POST https://app.nudgebee.com/api/graphql
```

## Authentication

The Nudgebee GraphQL API requires a valid JWT token for authentication. To obtain one, you need an **API Token** (see [Generate API Token](./api-tokens.md)).

### Obtain a JWT Token

Exchange your API token for a temporary JWT by calling the authentication endpoint:

```bash
curl https://app.nudgebee.com/api/auth/token \
  --data '{"email":"your@email.com", "secret":"YOUR_API_TOKEN"}' \
  -H 'content-type: application/json'
```

| Field | Description |
|-------|-------------|
| `email` | Your Nudgebee account email address |
| `secret` | The API token you generated from the UI |

The response will include a JWT token that you use for subsequent API calls.

### Make Authenticated Requests

Include the JWT token as a Bearer token in the `Authorization` header:

```bash
curl https://app.nudgebee.com/api/graphql \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  --data '{"query": "{ ... }", "variables": {}}'
```

## Request Format

All requests must be `POST` with `content-type: application/json`. The request body follows the standard GraphQL format:

```json
{
  "query": "query or mutation string",
  "variables": {
    "key": "value"
  }
}
```

## Example: List Cloud Accounts

```bash
curl https://app.nudgebee.com/api/graphql \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  --data '{
    "query": "query GetCloudAccounts { cloud_accounts: get_cloud_accounts_v2(where: {status:{_eq:\"active\"}}) { rows { id account_name cloud_provider } } }"
  }'
```

**Response:**

```json
{
  "data": {
    "cloud_accounts": {
      "rows": [
        {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "account_name": "Production AWS",
          "cloud_provider": "aws"
        }
      ]
    }
  }
}
```

## Example: List Kubernetes Namespaces

```bash
curl https://app.nudgebee.com/api/graphql \
  -H 'content-type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  --data '{
    "query": "query GetNamespaces { k8s_namespaces: k8s_namespaces_v2(where: {is_active:{_eq:true}}, limit: 100) { rows { name account_id } } }"
  }'
```

## Error Handling

If the request fails, the response will contain an `errors` array:

```json
{
  "errors": [
    {
      "message": "invalid-jwt",
      "extensions": {
        "code": "invalid-jwt"
      }
    }
  ]
}
```

Common error codes:

| Error | Cause | Resolution |
|-------|-------|------------|
| `invalid-jwt` | JWT token is expired or invalid | Generate a new JWT token using your API token |
| `access-denied` | Insufficient permissions | Check your user role and account permissions |
| `validation-failed` | Invalid query or variables | Verify your GraphQL query syntax and variable types |

## Rate Limits

API requests are subject to rate limiting. If you receive a `429` status code, wait before retrying.

## Notes

- The API token is **not** used directly in API calls. It is only used to obtain a JWT token via the `/api/auth/token` endpoint.
- JWT tokens are temporary and will expire. When expired, generate a new one using your API token.
- For self-hosted or on-premise deployments, replace `app.nudgebee.com` with your instance's domain.
- All queries follow the [GraphQL specification](https://graphql.org/learn/).
