---
sidebar_position: 4
---

# Configuration Reference

Forager is configured via a YAML file passed with `--config`. All fields can also be set via environment variables with the `NB_` prefix.

## Full Example

```yaml
relay_url: "wss://relay.nudgebee.com/register"
access_key: "your-access-key"
access_secret: "your-access-secret"
data_dir: "/data"
health_check_interval_min: 10

# Cloud provider config (only needed for cloud secret sources)
aws:
  region: us-east-1

gcp:
  project_id: my-project
  credentials_file: ""

azure:
  vault_url: ""
  tenant_id: ""
  client_id: ""

# Datasources to monitor
datasources:
  - name: prod-postgres
    type: postgresql
    host: 10.0.1.50
    port: 5432
    database: appdb
    credential_source: aws_sm
    credential_ref: "prod/postgres"

  - name: cache
    type: redis
    host: 10.0.1.51
    port: 6379

  - name: internal-api
    type: http
    url: https://api.internal.example.com
    credentials:
      auth_type: bearer
      token: my-api-token

  - name: app-kafka
    type: kafka
    brokers: "broker1:9092,broker2:9092"
    credential_source: cloud_push
```

## Top-Level Fields

| Field | Env Variable | Required | Description |
|-------|-------------|----------|-------------|
| `relay_url` | `NB_RELAY_URL` | Yes | NudgeBee Relay Server WebSocket URL |
| `access_key` | `NB_ACCESS_KEY` | Yes | Agent access key |
| `access_secret` | `NB_ACCESS_SECRET` | Yes | Agent access secret |
| `data_dir` | `NB_DATA_DIR` | No | Local storage directory (default: `/data`) |
| `health_check_interval_min` | `NB_HEALTH_CHECK_INTERVAL_MIN` | No | Health check interval in minutes (default: `10`) |

## Cloud Provider Fields

| Field | Env Variable | Description |
|-------|-------------|-------------|
| `aws.region` | `NB_AWS_REGION` | AWS region for Secrets Manager |
| `gcp.project_id` | `NB_GCP_PROJECT_ID` | GCP project ID for Secret Manager |
| `gcp.credentials_file` | `NB_GCP_CREDENTIALS_FILE` | Path to GCP service account key (optional) |
| `azure.vault_url` | `NB_AZURE_VAULT_URL` | Azure Key Vault URL |
| `azure.tenant_id` | `NB_AZURE_TENANT_ID` | Azure AD tenant ID (optional) |
| `azure.client_id` | `NB_AZURE_CLIENT_ID` | User-assigned managed identity client ID (optional) |

## Datasource Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier |
| `type` | Yes | Datasource type (see [supported types](./overview.md#supported-datasources)) |
| `host` | Varies | Hostname (database, SSH, Redis, MongoDB) |
| `port` | Varies | Port number |
| `database` | No | Database name (SQL datasources) |
| `url` | Varies | Base URL (HTTP, Prometheus) |
| `brokers` | Varies | Comma-separated broker list (Kafka) |
| `credential_source` | No | `local` (default), `cloud_push`, `aws_sm`, `gcp_sm`, `azure_kv` |
| `credential_ref` | When using cloud source | Secret name/ARN/resource path |
| `credentials` | When `local` | Inline credential key-value pairs |

## Common Credential Keys

These are the credential keys used by each datasource type:

| Datasource | Keys |
|------------|------|
| `postgresql`, `mysql`, `mssql`, `clickhouse`, `oracle` | `username`, `password` |
| `mongodb` | `username`, `password` |
| `redis` | `password` (optional) |
| `ssh` | `username`, `password` or `private_key` |
| `http` | `auth_type`, `username`, `password`, `token`, `api_key` |
| `kafka` | `username`, `password`, `mechanism` |
