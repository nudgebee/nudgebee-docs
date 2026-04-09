---
sidebar_position: 3
---

# Installation

## Prerequisites

- Network access to your NudgeBee Relay Server on port 443 (the relay URL is provided in the NudgeBee UI when you create a Proxy Agent account)
- Network access from the agent to each datasource you want to monitor
- Access key and secret from the NudgeBee UI (Admin → Integrations → Servers → Proxy Agent)

Replace `<RELAY_URL>`, `<ACCESS_KEY>`, and `<ACCESS_SECRET>` in the commands below with the values from the UI.

## Option 1: Linux Install Script

Downloads and installs Forager as a **systemd** service on Linux. Requires root / sudo.

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_RELAY_URL=<RELAY_URL> \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

After installation:

| Path | Description |
|------|-------------|
| `/usr/local/bin/nudgebee-forager` | Binary |
| `/etc/nudgebee/forager.yaml` | Config file |
| `/var/lib/nudgebee/` | Data directory |
| `nudgebee-forager` | systemd service name |

**Service management:**
```bash
systemctl status nudgebee-forager   # check status
journalctl -u nudgebee-forager -f   # stream logs
systemctl restart nudgebee-forager  # restart
```

**Using a local config file:** The installer creates `/etc/nudgebee/forager.yaml` with your access credentials. To add datasources, edit that file and restart:

```bash
sudo nano /etc/nudgebee/forager.yaml
# Add your datasources (see Configuration Reference), then restart:
sudo systemctl restart nudgebee-forager
```

## Option 2: Windows Install Script

Downloads and installs Forager as a **Windows Service** that starts automatically on boot. Must be run in an **Administrator** PowerShell session.

```powershell
$env:NB_RELAY_URL="<RELAY_URL>"
$env:NB_ACCESS_KEY="<ACCESS_KEY>"
$env:NB_ACCESS_SECRET="<ACCESS_SECRET>"
Set-ExecutionPolicy Bypass -Scope Process -Force
iwr -useb https://registry.nudgebee.com/downloads/forager/latest/install.ps1 | iex
```

After installation:

| Path | Description |
|------|-------------|
| `C:\Program Files\Nudgebee\nudgebee-forager.exe` | Binary |
| `C:\ProgramData\Nudgebee\forager.yaml` | Config file |
| `C:\ProgramData\Nudgebee\` | Data directory |
| `NudgebeeForager` | Windows Service name |

**Service management:**
```powershell
Get-Service NudgebeeForager                  # check status
Restart-Service NudgebeeForager              # restart
Stop-Service NudgebeeForager                 # stop
```

**Using a local config file:** The installer creates `C:\ProgramData\Nudgebee\forager.yaml` with your access credentials. To add datasources, edit that file and restart the service:

```powershell
notepad C:\ProgramData\Nudgebee\forager.yaml
# Add your datasources (see Configuration Reference), then restart:
Restart-Service NudgebeeForager
```

**Upgrading:** Re-run the install script. It stops the existing service, replaces the binary, and starts the service again. Your existing config file is preserved.

## Option 3: Docker

```bash
docker run -d --name nudgebee-forager \
  -e NB_RELAY_URL=<RELAY_URL> \
  -e NB_ACCESS_KEY=<ACCESS_KEY> \
  -e NB_ACCESS_SECRET=<ACCESS_SECRET> \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

**Using a local config file:** Mount your config file into the container at `/etc/nudgebee/forager.yaml`. Forager automatically looks for it there — no extra flags needed:

```bash
docker run -d --name nudgebee-forager \
  -v /path/to/forager.yaml:/etc/nudgebee/forager.yaml:ro \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

When using a config file, you can put `relay_url`, `access_key`, and `access_secret` in the YAML instead of passing them as env vars.

## Option 4: Docker Compose

```yaml
# docker-compose.yaml
services:
  forager:
    image: registry.nudgebee.com/nudgebee-forager:latest
    restart: unless-stopped
    environment:
      - NB_RELAY_URL=<RELAY_URL>
      - NB_ACCESS_KEY=<ACCESS_KEY>
      - NB_ACCESS_SECRET=<ACCESS_SECRET>
    volumes:
      - forager-data:/data

volumes:
  forager-data:
```

```bash
docker compose up -d
```

**Using a local config file:** Mount the file at `/etc/nudgebee/forager.yaml`:

```yaml
# docker-compose.yaml
services:
  forager:
    image: registry.nudgebee.com/nudgebee-forager:latest
    restart: unless-stopped
    volumes:
      - ./forager.yaml:/etc/nudgebee/forager.yaml:ro
      - forager-data:/data

volumes:
  forager-data:
```

Place your `forager.yaml` in the same directory as `docker-compose.yaml`, then run `docker compose up -d`.

## Option 5: Helm

```bash
helm install nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  --set forager.relayURL=<RELAY_URL> \
  --set forager.accessKey=<ACCESS_KEY> \
  --set forager.accessSecret=<ACCESS_SECRET>
```

### Helm Values Reference

Create a `values.yaml` to customize the deployment:

```yaml
replicaCount: 1

image:
  repository: registry.nudgebee.com/nudgebee-forager
  pullPolicy: IfNotPresent
  tag: "latest"

forager:
  relayURL: wss://<RELAY_HOST>/register   # provided in the NudgeBee UI
  accessKey: ""
  accessSecret: ""
  dataDir: /data

  # Cloud secret provider config (only needed for cloud credential sources)
  gcp:
    projectID: my-gcp-project
    credentialsFile: ""  # optional, uses ADC if omitted

  aws:
    region: us-east-1

  azure:
    vaultURL: https://myvault.vault.azure.net
    tenantID: ""
    clientID: ""

  datasources:
    - name: my-postgres
      type: postgresql
      host: postgres.default
      port: 5432
      database: mydb
      credential_source: gcp_sm
      credential_ref: projects/my-project/secrets/pg-creds/versions/latest

    - name: cloud-sql
      type: postgresql
      host: 10.0.1.60
      port: 5432
      database: appdb
      ssl_mode: require
      credential_source: gcp_sm
      credential_ref: projects/my-project/secrets/cloudsql-creds/versions/latest

    - name: cache
      type: redis
      host: redis-master.default
      port: 6379
      credential_source: gcp_sm
      credential_ref: projects/my-project/secrets/redis-creds/versions/latest

resources:
  limits:
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi

serviceAccount:
  create: true
  annotations: {}

# Additional environment variables
extraEnv: []

# Additional volume mounts for the forager container
extraVolumeMounts: []

# Additional volumes for the pod
extraVolumes: []
```

Datasources listed under `forager.datasources` are rendered into a ConfigMap and mounted as `/etc/nudgebee/forager.yaml` inside the pod automatically — no extra volume setup needed.

Then install with:

```bash
helm install nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  -f values.yaml
```

### GKE with GCP Secret Manager

When running on GKE without Workload Identity, mount a GCP service account key:

```yaml
serviceAccount:
  create: true
  annotations:
    iam.gke.io/gcp-service-account: forager@my-project.iam.gserviceaccount.com

extraEnv:
  - name: GOOGLE_APPLICATION_CREDENTIALS
    value: /var/secrets/gcp/key.json

extraVolumeMounts:
  - name: gcp-sa-key
    mountPath: /var/secrets/gcp
    readOnly: true

extraVolumes:
  - name: gcp-sa-key
    secret:
      secretName: forager-gcp-sa-key
```

Create the Kubernetes secret with the SA key:

```bash
kubectl create secret generic forager-gcp-sa-key \
  --from-file=key.json=/path/to/sa-key.json
```

If Workload Identity is enabled, you only need the service account annotation — no key file or extra volumes required.

### EKS with AWS Secrets Manager

On EKS, use IRSA (IAM Roles for Service Accounts):

```yaml
serviceAccount:
  create: true
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/forager-role
```

No extra volumes needed — the AWS SDK picks up credentials from the IRSA token automatically.

### AKS with Azure Key Vault

On AKS, use pod-managed identity or workload identity:

```yaml
serviceAccount:
  create: true
  annotations:
    azure.workload.identity/client-id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Verify

Check that the service is running:

**Linux:**
```bash
systemctl status nudgebee-forager
journalctl -u nudgebee-forager -f
```

**Windows:**
```powershell
Get-Service NudgebeeForager
```

**Docker / Helm:**
```bash
docker logs nudgebee-forager --tail 50
# or
kubectl logs <forager-pod> --tail 50
```

You should see:
```
{"level":"INFO","msg":"starting forager"}
{"level":"INFO","msg":"connected to relay, greeting sent"}
{"level":"INFO","msg":"sent datasource inventory for auto-registration"}
```

Configured datasources will appear automatically in the NudgeBee UI under your account.
