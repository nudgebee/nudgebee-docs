---
sidebar_position: 4
---

# Configuration Reference

Forager is configured via a YAML config file. All fields can also be set via environment variables with the `NB_` prefix (env vars take precedence over the file).

## Config File Location

You can provide the config file in two ways:

1. **Explicit path** — pass `--config /path/to/forager.yaml` when starting Forager
2. **Default location** — if no `--config` flag is given, Forager looks for `forager.yaml` in:
   - Linux: `/etc/nudgebee/` → current directory
   - macOS: `/usr/local/etc/nudgebee/` → current directory
   - Windows: `%ProgramData%\Nudgebee\` → current directory

If no config file is found, Forager still starts using environment variables alone. See [Installation](./installation.md) for how to pass the config file in each deployment mode (Docker, Helm, systemd, etc.).

## Full Example

```yaml
relay_url: "wss://<RELAY_HOST>/register"   # provided in the NudgeBee UI
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

  - name: cloud-sql
    type: postgresql
    host: 10.0.1.60
    port: 5432
    database: appdb
    ssl_mode: require
    credential_source: gcp_sm
    credential_ref: "projects/my-project/secrets/cloudsql-creds/versions/latest"

  - name: cache
    type: redis
    host: 10.0.1.51
    port: 6379

  - name: clickhouse
    type: clickhouse
    host: 10.0.1.70
    port: 9000
    tls_enabled: true
    credentials:
      username: default
      password: <YOUR_PASSWORD>

  # SSH — fixed host
  - name: web-server
    type: ssh
    host: 10.0.1.80
    port: 22
    credential_source: aws_sm
    credential_ref: "prod/ssh-web-server"

  # SSH — dynamic mode (connect to any host in the allowed list)
  - name: ssh-fleet
    type: ssh
    port: 22
    allowed_hosts:
      - "10.0.1.0/24"
      - "10.0.2.0/24"
    credential_source: gcp_sm
    credential_ref: "projects/my-project/secrets/ssh-fleet-creds/versions/latest"
```

## Top-Level Fields

| Field | Env Variable | Required | Description |
|-------|-------------|----------|-------------|
| `relay_url` | `NB_RELAY_URL` | Yes | NudgeBee Relay Server WebSocket URL |
| `access_key` | `NB_ACCESS_KEY` | Yes | Agent access key |
| `access_secret` | `NB_ACCESS_SECRET` | Yes | Agent access secret |
| `data_dir` | `NB_DATA_DIR` | No | Local storage directory (default: `/var/lib/nudgebee` on Linux, `/data` in Docker) |
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
| `type` | Yes | Datasource type (see [supported types](./index.md#supported-datasources)) |
| `host` | Yes* | Hostname or IP address (*optional for SSH dynamic mode — see below) |
| `port` | Yes | Port number |
| `database` | No | Database name (SQL datasources) |
| `ssl_mode` | No | PostgreSQL SSL mode: `disable`, `require`, `verify-ca`, `verify-full` |
| `tls_enabled` | No | Enable TLS for MySQL, MSSQL, ClickHouse (`true`/`false`) |
| `credential_source` | No | `local` (default), `cloud_push`, `aws_sm`, `gcp_sm`, `azure_kv` |
| `credential_ref` | When using cloud source | Secret name/ARN/resource path |
| `credentials` | When `local` | Inline credential key-value pairs |
| `allowed_hosts` | No | List of CIDR ranges or hostnames for SSH dynamic mode (omit `host` to enable) |

## Common Credential Keys

These are the credential keys used by each datasource type:

| Datasource | Keys |
|------------|------|
| `postgresql`, `mysql`, `mssql`, `clickhouse`, `oracle` | `username`, `password` |
| `redis` | `password` (optional) |
| `ssh` | `username`, `private_key` (PEM format); optionally `password` or `passphrase` |

## SSH Datasource Notes

**Static mode** — Set `host` to a fixed server IP/hostname. All SSH commands go to that server.

**Dynamic mode** — Omit `host` and set `allowed_hosts` with CIDR ranges or exact hostnames. NudgeBee specifies the target host at request time, and Forager connects on demand. Connections are pooled and reused for 10 minutes by default.

```yaml
# Dynamic mode example — manages a fleet of servers
- name: ssh-fleet
  type: ssh
  port: 22
  allowed_hosts:
    - "10.0.1.0/24"
    - "10.0.2.0/24"
    - "bastion.example.com"    # exact hostnames also work
  credential_source: gcp_sm
  credential_ref: "projects/my-project/secrets/fleet-ssh-creds/versions/latest"
```

**Authentication** — SSH supports key-based and password-based auth. For key-based auth, the `private_key` credential must contain the **actual key contents** in PEM format (not a file path). If the key has a passphrase, include it as `passphrase`.

```yaml
# Static mode with local private key
- name: web-server
  type: ssh
  host: 10.0.1.80
  port: 22
  credential_source: local
  credentials:
    username: ec2-user
    private_key: |
      -----BEGIN OPENSSH PRIVATE KEY-----
      b3BlbnNzaC1rZXktdjEAAAAABG5vbmUA...
      -----END OPENSSH PRIVATE KEY-----
    passphrase: optional-if-key-is-encrypted
```

**Windows support** — Forager works with Windows OpenSSH Server. Windows uses PowerShell as the default shell, so commands should use `;` instead of `&&` to chain operations.
