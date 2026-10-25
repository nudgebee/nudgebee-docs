---
sidebar_position: 4
---

# Configuration Reference

Forager is configured via a YAML config file. The top-level and cloud provider fields can also be set via environment variables with the `NB_` prefix (env vars take precedence over the file). Datasources can only be set in the file.

## Config File Location

You can provide the config file in two ways:

1. **Explicit path** — pass `--config /path/to/forager.yaml` when starting Forager
2. **Default location** — if no `--config` flag is given, Forager looks for `forager.yaml` in:
   - Linux: `/etc/nudgebee/` → current directory
   - macOS: `/usr/local/etc/nudgebee/` → current directory
   - Windows: `%ProgramData%\NudgeBee\` → current directory

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

  - name: orders-mongo
    type: mongodb
    host: 10.0.1.90
    port: 27017
    database: orders
    tls_enabled: true
    credentials:
      username: nudgebee
      password: <YOUR_PASSWORD>

  - name: events-kafka
    type: kafka
    brokers: 10.0.1.100:9092,10.0.1.101:9092
    tls_enabled: true

  - name: internal-prometheus
    type: prometheus          # or http
    url: http://prometheus.internal:9090
    credentials:
      auth_type: bearer
      bearer_token: <YOUR_TOKEN>

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

  # MCP — local stdio server (Forager spawns the process)
  - name: fetch-mcp
    type: mcp
    transport: stdio
    command: /usr/local/bin/docker
    args: "run --rm -i mcp/fetch"
    credential_source: local

  # MCP — HTTP server reachable from inside the network
  - name: internal-mcp
    type: mcp
    transport: http
    url: http://10.0.1.42:8000/mcp
    credential_source: local
    credentials:
      auth_type: bearer
      bearer_token: "<token>"
```

## Top-Level Fields

| Field | Env Variable | Required | Description |
|-------|-------------|----------|-------------|
| `relay_url` | `NB_RELAY_URL` | Yes | NudgeBee Relay Server WebSocket URL |
| `access_key` | `NB_ACCESS_KEY` | Yes | Agent access key |
| `access_secret` | `NB_ACCESS_SECRET` | Yes | Agent access secret |
| `signing_public_key` | `NB_SIGNING_PUBLIC_KEY` | Recommended | Public key used to verify commands signed by NudgeBee. Shown with the install command in the UI; Helm value `forager.signingPublicKey`. |
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

The `type` names below are the config-file types. The integration types in the NudgeBee UI (for example `mongodb_proxy`, `kafka_proxy`, `http_proxy`) differ, and MongoDB replica sets and Kafka SASL are only available through integrations configured in the UI.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier |
| `type` | Yes | Datasource type. In this file use `postgresql`, `mysql`, `mssql`, `clickhouse`, `oracle`, `mongodb`, `redis`, `kafka`, `http`, `prometheus`, `ssh`, `discovery` or `mcp`. Any other type is skipped with an `unsupported local datasource type` warning in the log. |
| `host` | Yes* | Hostname or IP address (*optional for SSH dynamic mode — see below) |
| `port` | Yes | Port number |
| `database` | No | Database name (SQL datasources) |
| `ssl_mode` | No | PostgreSQL SSL mode: `disable`, `require`, `verify-ca`, `verify-full` |
| `tls_enabled` | No | Enable TLS for MySQL, MSSQL, ClickHouse (`true`/`false`) |
| `credential_source` | No | `local` (default), `cloud_push`, `aws_sm`, `gcp_sm`, `azure_kv` |
| `credential_ref` | When using cloud source | Secret name/ARN/resource path |
| `credentials` | When `local` | Inline credential key-value pairs |
| `allowed_hosts` | No | List of CIDR ranges or hostnames for SSH dynamic mode (omit `host` to enable) |
| `brokers` | Yes (Kafka) | Comma-separated list of broker addresses (`host:port`) |
| `url` | Yes (HTTP, Prometheus) | Base URL of the endpoint, e.g. `http://prometheus.internal:9090` |
| `credentials.auth_type` | No | HTTP auth method: `none` (default), `basic`, `bearer`, `custom_header`. Set it inside `credentials`. |
| `tls_skip_verify` | No | HTTP only. Skip TLS certificate verification. Not recommended outside a lab |
| `transport` | MCP only | `http` or `stdio` |
| `url` | MCP HTTP | URL of the MCP server (Forager-reachable) |
| `command` | MCP stdio | Absolute path to executable Forager runs |
| `args` | MCP stdio | Space-separated arguments (not shell-parsed). For pipes, redirects, or arguments containing spaces, use a shell-script wrapper. |
| `working_dir` | MCP stdio | Working directory for the spawned process |
| `env` | MCP stdio | Map of environment variables to set on the spawned process |

## Common Credential Keys

These are the credential keys used by each datasource type. Any key can instead be given as `<key>_file` (for example `private_key_file` or `password_file`) holding a path; Forager reads the file and uses its contents. Setting both `<key>` and `<key>_file` is an error.

| Datasource | Keys |
|------------|------|
| `postgresql`, `mysql`, `mssql`, `clickhouse`, `oracle` | `username`, `password` |
| `redis` | `password` (optional) |
| `mongodb` | `username`, `password` (authenticates against the `admin` database) |
| `kafka` | None. SASL is not configurable in this file, so Forager connects without SASL. |
| `http`, `prometheus` | Depends on `auth_type`: `username`/`password` for basic, `bearer_token` for bearer, `custom_header_name`/`custom_header_value` for a custom header |
| `ssh` | `username`, `private_key` (PEM format); optionally `password` or `passphrase` |
| `mcp` (HTTP) | `auth_type` (`bearer`/`basic`/`api_key`/`custom_header`/`oauth2`) plus the matching auth fields: `bearer_token`, `username`/`password`, `custom_header_name`/`custom_header_value`, or `oauth_token_url`/`oauth_client_id`/`oauth_client_secret`/`oauth_scope`/`oauth_audience`. See the [MCP integration guide](../../integrations/MCP/index.md) for the full matrix. |

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

**Authentication** — SSH supports key-based and password-based auth. For key-based auth, the `private_key` credential must contain the **actual key contents** in PEM format. To keep the key in a file instead, set `private_key_file` to its path. If the key has a passphrase, include it as `passphrase`.

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

**Host key verification** — Forager does not verify the server host key for SSH datasources defined in this file, which leaves the connection unprotected against man-in-the-middle attacks, and logs a warning at startup. `known_hosts` and `host_key` are not read from this file. Restrict `allowed_hosts` to the hosts you need and keep the network path between Forager and the servers trusted.

**Windows support** — Forager works with Windows OpenSSH Server. Windows uses PowerShell as the default shell, so commands should use `;` instead of `&&` to chain operations.
