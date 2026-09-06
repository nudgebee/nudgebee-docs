---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upgrade NudgeBee Server

Upgrading your NudgeBee Server control plane ensures you benefit from the latest features, security patches, database optimizations, and agent compatibility updates.

This guide provides code-grounded operational procedures for upgrading NudgeBee Server via Helm, inspecting manifest diffs, troubleshooting database migration hooks, diagnosing StatefulSet/PVC storage issues, and executing rollback runbooks.

:::tip[Edition reminder]
The chart location and image registry differ by edition (see [Editions & Capabilities](../../editions.md)):
- **Community** <Community/> — `oci://ghcr.io/nudgebee/charts/nudgebee`, no registry credentials required.
- **Enterprise** <Enterprise/> — `oci://registry.nudgebee.com/nudgebee`, requires registry authentication using your license key.
:::

---

## 1. Upgrade Planning & Pre-Flight Checks

### Version Pinning Invariant
In production environments, **always pin explicit chart versions** using `--version <TARGET_VERSION>`. Never run unbounded upgrades against `latest`, which can pull unverified dependencies or major database schema changes without preparation.

Review the [Server Release Notes](../../releases/server/index.md) before upgrading to check for breaking schema migrations, minimum agent version requirements, or deprecated Helm values.

### Export Active Configuration & Stored Values
Helm merges your supplied `-f values.yaml` with values stored in the Helm release secret from the previous deployment. Stored values can carry obsolete parameters across major chart revisions.

Before upgrading, export both your user-supplied overrides and the full computed release state:

```bash
# 1. Export user-supplied values (what you explicitly passed in previous releases)
helm get values nudgebee --namespace nudgebee > user-values.yaml

# 2. Export the full computed values tree (includes default chart values from the running release)
helm get values nudgebee --namespace nudgebee --all > computed-active-values.yaml
```

:::warning[Preserve the Encryption Key]
Check `user-values.yaml` to ensure `nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY` is preserved and recorded in your secure secrets vault. 

This 32-byte hexadecimal key encrypts all integration credentials, OAuth secrets, and private tokens stored in PostgreSQL. **Never regenerate or lose this key across upgrades.** If changed, existing encrypted records in PostgreSQL become permanently unreadable.
:::

### Database Pre-Upgrade Backup
NudgeBee database schema migrations run automatically during upgrades and are typically forward-only. Always create a verified database snapshot before applying upgrades:

```bash
# For bundled PostgreSQL (use -i without -t to prevent TTY character corruption on piped stdout):
# Uses pg_dumpall to capture all databases (application state, temporal, and temporal_visibility).
# Note: Target the postgresql container explicitly (-c postgresql) as the pod contains the postgres-exporter metrics sidecar.
kubectl exec -i nudgebee-postgresql-0 --namespace nudgebee -c postgresql -- \
  pg_dumpall -U postgres | gzip > "nudgebee-postgres-preupgrade-$(date +%Y%m%d%H%M%S).sql.gz"

# For AWS RDS (Single Instance):
aws rds create-db-snapshot \
  --db-instance-identifier <your-rds-instance-id> \
  --db-snapshot-identifier "nudgebee-preupgrade-$(date +%Y%m%d%H%M%S)"

# For AWS Aurora PostgreSQL (Cluster):
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier <your-aurora-cluster-id> \
  --db-snapshot-identifier "nudgebee-preupgrade-$(date +%Y%m%d%H%M%S)"
```

---

## 2. Set Edition & Chart Environment

Select your edition to set the chart repository, target version, and registry authentication before inspecting manifests or executing the upgrade:

<Tabs groupId="edition">
<TabItem value="community" label="Community (free)">

Set the chart reference to the public GitHub Container Registry:

```bash
export NUDGEBEE_CHART="oci://ghcr.io/nudgebee/charts/nudgebee"
export TARGET_VERSION="0.2.0" # Set to target version
```

</TabItem>
<TabItem value="enterprise" label="Enterprise">

Log in to the NudgeBee Enterprise registry using your license key:

```bash
export NUDGEBEE_LICENSE_KEY="<your-license-key>"
export NUDGEBEE_CHART="oci://registry.nudgebee.com/nudgebee"
export TARGET_VERSION="0.2.0" # Set to target version

# Authenticate to the OCI registry
helm registry login registry.nudgebee.com \
  --username nudgebee \
  --password "$NUDGEBEE_LICENSE_KEY"
```

</TabItem>
</Tabs>

---

## 3. Pre-Flight Manifest Comparison

Before modifying resources in the cluster, preview the exact Kubernetes manifests that Helm will create, modify, or delete using the chart variables configured above.

### Option A: Using `helm-diff` (Recommended)
The `helm-diff` plugin renders colorized diffs between the active release and the proposed target release:

```bash
# Install helm-diff plugin (one-time setup)
helm plugin install https://github.com/databus23/helm-diff

# Run diff against target version
helm diff upgrade nudgebee $NUDGEBEE_CHART \
  --version $TARGET_VERSION \
  --namespace nudgebee \
  -f user-values.yaml
```

### Option B: Native Manifest Comparison
If you cannot install plugins, compare the active release manifest against the rendered target template using native tools:

```bash
# 1. Capture currently active release manifests
helm get manifest nudgebee --namespace nudgebee > active-manifests.yaml

# 2. Render target manifests from the new chart
helm template nudgebee $NUDGEBEE_CHART \
  --version $TARGET_VERSION \
  --namespace nudgebee \
  -f user-values.yaml > target-manifests.yaml

# 3. Compare the diffs
diff -u active-manifests.yaml target-manifests.yaml | less
```

### What to Look for in the Diff:
- **StatefulSet Spec Changes**: Kubernetes rejects in-place modifications to StatefulSet `volumeClaimTemplates` and pod selectors (see [StatefulSet Troubleshooting](#6-statefulset--pvc-storage-diagnostics)).
- **Database Hook Updates**: Changes in migration image tags or environment variables for `postgres-migration-job`.
- **Resource Limits & Probes**: New CPU/memory allocations or probe timing changes that could impact pod scheduling.

---

## 4. Execute the Upgrade

Execute the upgrade against your cluster:

```bash
helm upgrade nudgebee $NUDGEBEE_CHART \
  --version $TARGET_VERSION \
  --namespace nudgebee \
  -f user-values.yaml \
  --wait \
  --timeout 15m
```

:::tip[Avoiding Stale Values]
Avoid using `--reuse-values` when upgrading across minor or major versions. `--reuse-values` retains outdated default parameters from old chart versions and merges them on top of new chart definitions, which can suppress new features and required configuration updates. Always maintain your own version-controlled `user-values.yaml` containing only your explicit overrides.
:::

---

## 5. Database Migration Lifecycle & Diagnostics

NudgeBee relies on two automated database migration mechanisms during upgrades: the PostgreSQL schema migration job and Temporal schema setup.

:::note[Resource Naming Convention]
In standard Helm installations without custom overrides, Kubernetes workloads are prefixed with the release name (e.g., `nudgebee-app`, `nudgebee-postgresql-0`, `nudgebee-services-server`). If your `values.yaml` specifies `fullnameOverride` (the default in some bundled configurations), the prefix is omitted (e.g., `app`, `postgresql-0`, `services-server`). Adjust the command-line resource names according to your deployment.
:::

```mermaid
sequenceDiagram
    autonumber
    participant Helm as Helm Upgrade
    participant Init as Init (db-check)
    participant PG as PostgreSQL
    participant Mig as postgres-migration-job
    participant Apps as Core Microservices (app, services-server...)

    Helm->>Init: Spawn post-upgrade hook (weight: -5)
    loop Poll DB Ready
        Init->>PG: pg_isready -h postgresql -U postgres
        PG-->>Init: 0 (Accepting connections)
    end
    Init->>Mig: Start main container (run-migrations.sh)
    Mig->>PG: Run forward SQL migrations / DDL locks
    alt Migrations Successful
        Mig-->>Helm: Pod Completed (Exit 0)
        Helm->>Apps: Rolling update Deployments (app, services-server)
        Apps-->>Helm: Ready
    else Migration Failed / Deadlock
        Mig-->>Helm: Pod Error (Exit 1, backoffLimit: 0)
        Note over Helm: Upgrade blocks & times out (Status: FAILED)
    end
```

### PostgreSQL Migration Hook (`postgres-migration-job`)
The primary schema migration is defined as a Helm hook:
- **Hook Trigger**: `"helm.sh/hook": post-install,post-upgrade`
- **Hook Weight**: `"-5"` (runs before main application pods roll over)
- **Retry Policy**: `spec.backoffLimit: 0` and `restartPolicy: Never`
- **Delete Policy**: `"helm.sh/hook-delete-policy": before-hook-creation`

Because `backoffLimit: 0` is enforced, any migration SQL failure immediately halts the job without retrying, preventing infinite crash loops while keeping Helm waiting until timeout.

#### Diagnostic Runbook for Failed Migrations:
If `helm upgrade` times out or fails at the hook stage, inspect the migration pods:

```bash
# 1. Locate the migration job pod
kubectl get pods --namespace nudgebee -l app.kubernetes.io/instance=nudgebee

# 2. Inspect the database readiness init container
kubectl logs --namespace nudgebee job/postgres-migration-job -c db-check

# 3. Inspect the migration execution logs
kubectl logs --namespace nudgebee job/postgres-migration-job -c postgres-migration-job
```

#### Common Root Causes & Remediations:
1. **Init Container Deadlock (`Waiting for PostgreSQL to be ready...`)**:
   - The init container parses `APP_DATABASE_URL` to poll `pg_isready`.
   - Verify PostgreSQL is running: `kubectl get pods --namespace nudgebee -l app.kubernetes.io/name=postgresql`.
   - If using external PostgreSQL, verify that security groups, firewalls, and DNS allow egress from the Kubernetes worker nodes.
2. **DDL Lock Timeout on Large Tables**:
   - Long-running queries from active worker pods can block `ALTER TABLE` locks.
   - Scale down background workers temporarily:
     ```bash
     kubectl scale deployment nudgebee-k8s-collector nudgebee-cloud-collector-server --namespace nudgebee --replicas=0
     ```
3. **Clearing a Failed Job for Re-Run**:
   - The chart specifies `before-hook-creation`, so re-running `helm upgrade` will automatically clean up the old job.
   - To clean up immediately for manual testing:
     ```bash
     kubectl delete job postgres-migration-job --namespace nudgebee
     ```

### Temporal Schema Migrations
Temporal persistence runs against its own PostgreSQL databases (`temporal` and `temporal_visibility`).
- In the NudgeBee umbrella chart (pinning Temporal Helm chart 1.6.0), `temporal.schema.useHelmHooks: false` is configured intentionally (disabling both setup and update hooks; in legacy Helm chart releases this was split across `temporal.schema.setup.useHelmHooks` and `temporal.schema.update.useHelmHooks`). This ensures the schema migration job runs as a standard Kubernetes Job alongside PostgreSQL rather than a pre-install hook, eliminating bootstrap deadlocks when PostgreSQL is bundled in the same release.
- **Invariant**: The shard count `temporal.server.config.persistence.numHistoryShards` is pinned to **`512`**. **Do not modify this value.** Changing shard counts corrupts existing workflow execution history.

---

## 6. StatefulSet & PVC Storage Diagnostics

Bundled stateful services (PostgreSQL, RabbitMQ, Redis, Qdrant) use Kubernetes `StatefulSet` resources with PersistentVolumeClaims (PVCs).

### PVC Volume Expansion
The default bundled PostgreSQL PVC request is `50Gi` (`postgresql.primary.persistence.size: 50Gi`).

To increase volume size during an upgrade:
1. Verify your cluster's `StorageClass` has volume expansion enabled:
   ```bash
   kubectl get storageclass -o custom-columns=NAME:.metadata.name,ALLOWEXPANSION:.allowVolumeExpansion
   ```
   If `ALLOWEXPANSION` is `false`, you must enable it first (`kubectl patch storageclass <name> -p '{"allowVolumeExpansion": true}'`).
2. Update the size in your `user-values.yaml`:
   ```yaml
   postgresql:
     primary:
       persistence:
         size: 100Gi
   ```
3. Apply the upgrade. Kubernetes will expand the PVC metadata. Once the PostgreSQL pod restarts, the underlying filesystem is expanded online.

### ReadWriteOnce (RWO) Multi-Attach Errors
During rolling upgrades on cloud block storage (AWS EBS, Azure Disk, GCP Persistent Disk), a rescheduled stateful pod may become stuck in `ContainerCreating`:

```text
Warning  FailedAttachVolume  Multi-Attach error for volume "pvc-xxxx" Volume is already exclusively attached to one node and can't be attached to another
```

#### Diagnostic & Fix:
```bash
# 1. Identify which node still holds the volume attachment
kubectl get volumeattachment | grep <pv-name>

# 2. Check the status of the previous node
kubectl get node <old-node-name>

# 3. If the old pod is lingering in Terminating on the old node, force-terminate:
kubectl delete pod nudgebee-postgresql-0 --namespace nudgebee --grace-period=0 --force
```

### StatefulSet Immutable Field Violations
Kubernetes forbids updates to StatefulSet specs for fields other than `replicas`, `ordinals`, `template`, and `updateStrategy`. If a chart update modifies `volumeClaimTemplates` or match labels, Helm will fail with:

```text
Error: UPGRADE FAILED: cannot patch "postgresql" with kind StatefulSet: StatefulSet.apps "postgresql" is invalid: spec: Forbidden: updates to statefulset spec for fields other than 'replicas', 'ordinals', 'template', and 'updateStrategy' are forbidden
```

#### Safe Non-Destructive Resolution:
Delete the StatefulSet definition **without deleting the running pods or PVCs** using `--cascade=orphan`, then re-apply the upgrade:

```bash
# 1. Delete the StatefulSet object, leaving pods and underlying PVCs untouched
kubectl delete statefulset nudgebee-postgresql --namespace nudgebee --cascade=orphan

# 2. Re-run the helm upgrade to recreate the StatefulSet with the new specification
helm upgrade nudgebee $NUDGEBEE_CHART --version $TARGET_VERSION -f user-values.yaml --namespace nudgebee
```

---

## 7. Bundled vs. External Infrastructure Topology

For production-grade scalability and managed failover, NudgeBee allows disabling bundled subcharts and connecting to external managed services.

```mermaid
graph TD
    subgraph K8s["Kubernetes (nudgebee namespace)"]
        SVC["NudgeBee Microservices<br/>(app, services-server, workflow-server...)"]
    end
    
    subgraph Managed["Managed Cloud Services"]
        RDS[("AWS RDS / Aurora PostgreSQL")]
        MQ[("CloudAMQP / Managed RabbitMQ")]
        REDIS[("AWS ElastiCache Redis")]
        CH[("ClickHouse Cloud / External Cluster")]
    end

    SVC -->|"APP_DATABASE_URL"| RDS
    SVC -->|"temporal default/visibility datastores"| RDS
    SVC -->|"AMQP_URL"| MQ
    SVC -->|"REDIS_HOST / Secret"| REDIS
    SVC -.->|"Traces & Logs"| CH
```

To switch from bundled services to external managed infrastructure during an upgrade, provide the following overrides in your `user-values.yaml`:

```yaml
# 1. Disable bundled PostgreSQL and point to External RDS / Cloud SQL
postgresql:
  enabled: false

nudgebee_secret:
  APP_DATABASE_URL: "postgresql://nb_user:YourSecretPass@rds-postgres.internal.net:5432/nudgebee?sslmode=require"

# Ensure Temporal persistence points to the same external database host
# Note: Temporal chart 1.x (bundled in NudgeBee) nests stores under 'datastores' with 'defaultStore' / 'visibilityStore'.
# (In legacy pre-1.0 Temporal charts, stores were defined directly under 'persistence').
temporal:
  server:
    config:
      persistence:
        defaultStore: default
        visibilityStore: visibility
        datastores:
          default:
            sql:
              connectAddr: "rds-postgres.internal.net:5432"
              databaseName: "temporal"
              user: "nb_user"
              password: "YourSecretPass"
          visibility:
            sql:
              connectAddr: "rds-postgres.internal.net:5432"
              databaseName: "temporal_visibility"
              user: "nb_user"
              password: "YourSecretPass"

# 2. Disable bundled RabbitMQ
rabbitmq:
  enabled: false

# 3. Disable bundled Redis
redis:
  enabled: false

# 4. ClickHouse (Tracing / Events)
clickhouse:
  enabled: false # Keep false if using external ClickHouse or if tracing is handled out-of-cluster
```

:::caution[Pre-Create External Databases]
Before running `helm upgrade` with external databases:
- The target PostgreSQL instance must have the `nudgebee`, `temporal`, and `temporal_visibility` databases pre-created.
- The connecting user must have `CREATE TABLE`, `CREATE INDEX`, and schema migration privileges.
:::

---

## 8. Rollback & Recovery Runbook

If an upgrade encounters unrecoverable errors or service disruptions, execute this rollback procedure.

### Step 1: Inspect Helm Release History
List previous deployment revisions and identify the last known healthy revision:

```bash
helm history nudgebee --namespace nudgebee
```

Example output:
```text
REVISION  UPDATED                   STATUS    CHART           APP VERSION  DESCRIPTION
1         Sun Sep 01 10:00:00 2026  superseded nudgebee-0.1.0  0.1.0        Install complete
2         Sun Sep 06 14:00:00 2026  failed    nudgebee-0.2.0  0.2.0        Upgrade "nudgebee" failed: timed out
```

### Step 2: Roll Back Kubernetes Resources via Helm
Roll back to the previous stable revision (e.g. revision 1):

```bash
helm rollback nudgebee 1 --namespace nudgebee --wait --timeout 10m
```

### Step 3: Database Rollback Considerations
Helm rollback reverts Kubernetes Deployments, ConfigMaps, Secrets, and container images. However, **Helm cannot automatically roll back database schema changes**.

1. **Additive Migrations (Non-Breaking)**:
   If the new release only added columns or tables, older application code usually runs without issue. Verify by checking pod logs:
   ```bash
   kubectl logs -n nudgebee -l app.kubernetes.io/name=services-server --tail=100
   ```
2. **Destructive Migrations (Schema Restore Required)**:
   If a migration altered columns or dropped constraints incompatibly:
   ```bash
   # 1. Scale down application microservices to avoid write conflicts
   kubectl scale deployment nudgebee-app nudgebee-services-server nudgebee-workflow-server nudgebee-notifications \
     --namespace nudgebee --replicas=0

   # 2. Terminate active connections and drop existing databases to prevent duplicate key/relation conflicts during restore
   kubectl exec -i nudgebee-postgresql-0 --namespace nudgebee -c postgresql -- psql -U postgres -c \
     "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('nudgebee', 'temporal', 'temporal_visibility') AND pid <> pg_backend_pid(); DROP DATABASE IF EXISTS nudgebee; DROP DATABASE IF EXISTS temporal; DROP DATABASE IF EXISTS temporal_visibility;"

   # 3. Restore PostgreSQL database from the pre-upgrade backup snapshot
   # (pg_dumpall includes database creation and connection directives)
   gunzip -c nudgebee-postgres-preupgrade-*.sql.gz | \
     kubectl exec -i nudgebee-postgresql-0 --namespace nudgebee -c postgresql -- psql -U postgres

   # 4. Scale application pods back up
   kubectl scale deployment nudgebee-app nudgebee-services-server nudgebee-workflow-server nudgebee-notifications \
     --namespace nudgebee --replicas=1
   ```

---

## 9. Post-Upgrade Verification

After the upgrade completes, verify system health across all layers:

```bash
# 1. Verify all pods are Running and Ready
kubectl get pods --namespace nudgebee -o wide

# 2. Confirm no pods are stuck in CrashLoopBackOff or restarting
kubectl get pods --namespace nudgebee --field-selector=status.phase!=Running

# 3. Verify core API readiness endpoint
kubectl run curl-test --rm -it --image=curlimages/curl --restart=Never -- \
  curl -sS http://nudgebee-services-server.nudgebee.svc.cluster.local:8080/healthz

# 4. Verify connected agents can reach relay-server
kubectl logs --namespace nudgebee -l app.kubernetes.io/name=relay-server --tail=50 | grep -i "handshake"
```

For general installation setup, refer to the [Server Installation Guide](./index.md) and [Helm Values Reference](./helm_values.md).
