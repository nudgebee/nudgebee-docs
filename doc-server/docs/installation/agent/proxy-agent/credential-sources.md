---
sidebar_position: 3
---

# Credential Sources

Forager supports five ways to provide datasource credentials. Set `credential_source` on each datasource to choose the method.

## Local

Credentials specified inline in the config file. This is the default when `credential_source` is omitted.

```yaml
datasources:
  - name: my-postgres
    type: postgresql
    host: db.internal
    port: 5432
    credentials:
      username: admin
      password: <YOUR_PASSWORD>
```

## Cloud Push

Credentials managed in the NudgeBee UI and pushed to the agent over WebSocket at runtime. No credentials are stored in the config file.

```yaml
datasources:
  - name: my-postgres
    type: postgresql
    host: db.internal
    port: 5432
    credential_source: cloud_push
```

## AWS Secrets Manager

Credentials fetched from AWS Secrets Manager at agent startup.

**Config:**

```yaml
aws:
  region: us-east-1

datasources:
  - name: my-postgres
    type: postgresql
    host: db.internal
    port: 5432
    credential_source: aws_sm
    credential_ref: "prod/myapp/postgres"
```

**Secret format** — the secret value must be a flat JSON object:

```json
{
  "username": "admin",
  "password": "<YOUR_PASSWORD>"
}
```

**Authentication** — uses the standard AWS credential chain:
- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- EC2 instance profile
- ECS task role
- IRSA (EKS)

## GCP Secret Manager

Credentials fetched from GCP Secret Manager at agent startup.

**Config:**

```yaml
gcp:
  project_id: my-gcp-project
  credentials_file: /path/to/sa-key.json  # optional, uses ADC if omitted

datasources:
  - name: my-postgres
    type: postgresql
    host: db.internal
    port: 5432
    credential_source: gcp_sm
    credential_ref: "projects/my-gcp-project/secrets/postgres-creds/versions/latest"
```

**Secret format** — same flat JSON object as AWS.

**Authentication:**
- Application Default Credentials (ADC)
- GKE Workload Identity
- Explicit service account key file via `credentials_file`

## Azure Key Vault

Credentials fetched from Azure Key Vault at agent startup.

**Config:**

```yaml
azure:
  vault_url: https://myvault.vault.azure.net
  tenant_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # optional
  client_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # optional, for user-assigned managed identity

datasources:
  - name: my-postgres
    type: postgresql
    host: db.internal
    port: 5432
    credential_source: azure_kv
    credential_ref: "my-postgres-secret"
```

`credential_ref` is the secret name in the vault. The latest version is always used.

**Secret format** — same flat JSON object as AWS.

**Authentication:**
- `DefaultAzureCredential` (environment variables, managed identity, Azure CLI)
- If `client_id` is set, uses user-assigned managed identity directly
