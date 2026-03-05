---
sidebar_position: 2
---

# Installation

## Prerequisites

- Network access to `relay.nudgebee.com` on port 443
- Network access from the agent to each datasource you want to monitor
- Access key and secret from the NudgeBee UI (Settings > Integrations)

Replace `<ACCESS_KEY>` and `<ACCESS_SECRET>` in the commands below with the values from the UI.

## Option 1: Install Script

The quickest way to get started. Downloads and installs Forager as a systemd service.

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

## Option 2: Docker

```bash
docker run -d --name nudgebee-forager \
  -e NB_ACCESS_KEY=<ACCESS_KEY> \
  -e NB_ACCESS_SECRET=<ACCESS_SECRET> \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

## Option 3: Docker Compose

```yaml
# docker-compose.yaml
services:
  forager:
    image: registry.nudgebee.com/nudgebee-forager:latest
    restart: unless-stopped
    environment:
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

## Option 4: Helm

```bash
helm install nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
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
  relayURL: wss://relay.nudgebee.com/register
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

Once running, you should see in the logs:

```
{"level":"INFO","msg":"starting forager"}
{"level":"INFO","msg":"connected to relay, greeting sent"}
{"level":"INFO","msg":"sent datasource inventory for auto-registration"}
```

Configured datasources will appear automatically in the NudgeBee UI under your account.
