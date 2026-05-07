---
sidebar_position: 10
sidebar_label: Integration Tasks
---

# Integration Tasks

Connect to external services via HTTP or SSH.

## `integrations.http`

**Display Name:** HTTP Request

Make an HTTP request to any REST API or web endpoint. Supports multiple authentication methods including Bearer, Basic, API Key, and OAuth 2.0.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `url` | string | Yes | Request URL. |
| `method` | string | No | HTTP method. Options: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`. Default: `GET`. |
| `headers` | object | No | Request headers (key-value map). |
| `body` | string | No | Request body (for POST, PUT, PATCH). |
| `auth_type` | string | No | Authentication type. Options: `""` (none), `bearer`, `basic`, `api_key`, `oauth2`. |
| `bearer_token` | string | No | Bearer token. Visible when `auth_type` is `bearer`. |
| `basic_auth_username` | string | No | Username for Basic auth. Visible when `auth_type` is `basic`. |
| `basic_auth_password` | string | No | Password for Basic auth (encrypted). Visible when `auth_type` is `basic`. |
| `api_key` | string | No | API key value (encrypted). Visible when `auth_type` is `api_key`. |
| `api_header_name` | string | No | Header name for API key. Default: `Authorization`. Visible when `auth_type` is `api_key`. |
| `oauth_token_url` | string | No | OAuth 2.0 token endpoint. Visible when `auth_type` is `oauth2`. |
| `oauth_client_id` | string | No | OAuth 2.0 client ID. Visible when `auth_type` is `oauth2`. |
| `oauth_client_secret` | string | No | OAuth 2.0 client secret (encrypted). Visible when `auth_type` is `oauth2`. |
| `oauth_scope` | string | No | OAuth 2.0 scope. Visible when `auth_type` is `oauth2`. |
| `oauth_audience` | string | No | OAuth 2.0 audience. Visible when `auth_type` is `oauth2`. |
| `timeout` | string | No | Request timeout. Default: `30s`. |
| `insecure_skip_verify` | boolean | No | Skip TLS certificate verification. Default: `false`. |
| `proxy_url` | string | No | Proxy URL for the request. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `status_code` | number | HTTP status code. |
| `headers` | object | Response headers. |
| `body` | any | Parsed JSON body (if applicable) or raw string. |

---

## `integrations.ssh`

**Display Name:** SSH Request

Run commands on a remote server via SSH using a configured integration.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | SSH integration ID (contains host, credentials). |
| `command` | string | Yes | Command to execute on the remote server. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command output. |

