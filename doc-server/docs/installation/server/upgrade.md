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

:::caution[Read this before upgrading a deployment installed on an older chart]
Recent charts install the agent alongside the server by default (`agent.enabled: true`). On an upgrade that default applies to your release too, so decide which case you are in:

- **This cluster is already monitored by a separately installed agent** → set `agent.enabled: false` in your `values.yaml`. Otherwise the same cluster registers a second time under a different name and shows up twice in **Kubernetes**.
- **This cluster is not monitored yet** → leave the default on and set `agent.clusterName` to the name you want it to appear under (default `nb-control-plane-k8s`).
- **You deploy with GitOps (Argo CD, Flux) with the agent enabled** → set `agent.accessKey` and `agent.accessSecret` from the live `nudgebee-bootstrap` Secret. Argo CD renders the chart offline and can't read the existing credential, so without them the render fails by design rather than regenerate a credential the database no longer matches. Flux runs a real Helm upgrade, but setting them explicitly is still the safe choice.

`admin.email` is **not** required on upgrade — it is only validated on a fresh install, since an existing deployment already has an admin. See [the bundled agent](./index.md#bundled-agent) and [`admin.email`](./index.md#admin-email) for the full detail.
:::

---

## 1. Upgrade Planning & Pre-Flight Checks

### Version Pinning Invariant
In production environments, **always pin explicit chart versions** using `--version <TARGET_VERSION>`. Never run unbounded upgrades against `latest`, which can pull unverified dependencies or major database schema changes without preparation.

Review the [Server Release Notes](../../releases/server/index.md) before upgrading to check for breaking schema migrations, minimum agent version requirements, or deprecated Helm values.

### Export Active Configuration & Stored Values
Without `--reuse-values`, `helm upgrade` uses the new chart's defaults plus only what you pass with `-f` — values from the previous release are **not** merged in. Anything you leave out of `-f` is dropped, including `NUDGEBEE_ENCRYPTION_KEY`, so always pass your full values file. (`--reuse-values` does the opposite and can carry obsolete parameters across chart versions.)

Before upgrading, export both your user-supplied overrides and the full computed release state:

```bash
# 1. Export user-supplied values (what you explicitly passed in previous releases)
helm get values nudgebee --namespace nudgebee > user-values.yaml

# 2. Export the full computed values tree (includes default chart values from the running release)
helm get values nudgebee --namespace nudgebee --all > computed-active-values.yaml
```

#### Preserve the encryption key {#encryption-key}

:::warning[Preserve the Encryption Key]
Check `user-values.yaml` to ensure `nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY` is preserved and recorded in your secure secrets vault.

If it isn't there, your install used the chart's **old built-in default**, and the new chart refuses to render (`[ERROR] NUDGEBEE_ENCRYPTION_KEY is required`). Set it to that old default so existing data stays readable:

```yaml
nudgebee_secret:
  NUDGEBEE_ENCRYPTION_KEY: "3030303030303030303030303030303030303030303030303030303030303030"
```


This 32-byte hexadecimal key encrypts all integration credentials, OAuth secrets, and private tokens stored in PostgreSQL. **Never regenerate or lose this key across upgrades.** If changed, existing encrypted records in PostgreSQL become permanently unreadable.
:::

### Database Pre-Upgrade Backup
NudgeBee database schema migrations run automatically during upgrades and are typically forward-only. Always create a verified database snapshot before applying upgrades:

```bash
# For bundled PostgreSQL (use -i without -t to prevent TTY character corruption on piped stdout):
# Uses pg_dumpall to capture all databases (application state, temporal, and temporal_visibility).
# Note: Target the postgresql container explicitly (-c postgresql) as the pod contains the postgres-exporter metrics sidecar.
kubectl exec -i postgresql-0 --namespace nudgebee -c postgresql -- \
  sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dumpall -U postgres' | gzip > "nudgebee-postgres-preupgrade-$(date +%Y%m%d%H%M%S).sql.gz"

# For AWS RDS (Single Instance):
aws rds create-db-snapshot \
  --db-instance-identifier <your-rds-instance-id> \
  --db-snapshot-identifier "nudgebee-preupgrade-$(date +%Y%m%d%H%M%S)"

# For AWS Aurora PostgreSQL (Cluster):
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier <your-aurora-cluster-id> \
  --db-cluster-snapshot-identifier "nudgebee-preupgrade-$(date +%Y%m%d%H%M%S)"
```

---

## 2. Set Edition & Chart Environment

Select your edition to set the chart repository, target version, and registry authentication before inspecting manifests or executing the upgrade:

<Tabs groupId="edition">
<TabItem value="community" label="Community (free)">

Set the chart reference to the public GitHub Container Registry:

```bash
export NUDGEBEE_CHART="oci://ghcr.io/nudgebee/charts/nudgebee"
export TARGET_VERSION="<version>" # A release tag, see the Server Releases page
```

</TabItem>
<TabItem value="enterprise" label="Enterprise">

Log in to the NudgeBee Enterprise registry using your license key:

```bash
export NUDGEBEE_LICENSE_KEY="<your-license-key>"
export NUDGEBEE_CHART="oci://registry.nudgebee.com/nudgebee"
export TARGET_VERSION="<version>" # A release tag, see the Server Releases page

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
  --timeout 20m
```

:::tip[Avoiding Stale Values]
Avoid using `--reuse-values` when upgrading across minor or major versions. `--reuse-values` retains outdated default parameters from old chart versions and merges them on top of new chart definitions, which can suppress new features and required configuration updates. Always maintain your own version-controlled `user-values.yaml` containing only your explicit overrides.
:::

---

## 5. Database Migration Lifecycle & Diagnostics

NudgeBee relies on two automated database migration mechanisms during upgrades: the PostgreSQL schema migration job and Temporal schema setup.

:::note[Resource Naming Convention]
The chart sets a fixed name for every component, so resources are **not** prefixed with the release name: `app`, `services-server`, `postgresql-0`, `rabbitmq-0`, `temporal-frontend`, the migration Job `postgres-migration-job`, and so on. The commands on this page use those names.
:::

```mermaid
sequenceDiagram
    autonumber
    participant Helm as Helm Upgrade
    participant Init as Init (db-check)
    participant PG as PostgreSQL
    participant Mig as postgres-migration-job
    participant Apps as Core Microservices (app, services-server...)

    Helm->>Init: Spawn pre-upgrade hook (weight: -5)
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
- **Hook Trigger**: `"helm.sh/hook": post-install,pre-upgrade` — on a fresh install it runs after the release (the bundled database has to exist first); on an upgrade it runs and completes before application pods are rolled out
- **Hook Weight**: `"-5"`
- **Retry Policy**: `spec.backoffLimit: 0` and `restartPolicy: Never`
- **Delete Policy**: `"helm.sh/hook-delete-policy": before-hook-creation`

Because `backoffLimit: 0` is enforced, any migration failure stops the job without retrying. On an upgrade, Helm then marks the upgrade failed and the **previous version keeps running** on the old schema.

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
   - The init container parses `APP_DATABASE_URL` to poll `pg_isready`. Make sure the URL includes an explicit port (`host:5432`).
   - Verify PostgreSQL is running: `kubectl get pods --namespace nudgebee -l app.kubernetes.io/name=postgresql`.
   - If using external PostgreSQL, verify that security groups, firewalls, and DNS allow egress from the Kubernetes worker nodes.
2. **DDL Lock Timeout on Large Tables**:
   - Long-running queries from active worker pods can block `ALTER TABLE` locks.
   - Scale down background workers temporarily:
     ```bash
     kubectl scale deployment k8s-collector cloud-collector-server --namespace nudgebee --replicas=0
     ```
3. **Clearing a Failed Job for Re-Run**:
   - The chart specifies `before-hook-creation`, so re-running `helm upgrade` will automatically clean up the old job.
   - To clean up immediately for manual testing:
     ```bash
     kubectl delete job postgres-migration-job --namespace nudgebee
     ```

### Temporal Schema Migrations
Temporal persistence runs against its own PostgreSQL databases (`temporal` and `temporal_visibility`).
- The NudgeBee chart sets `temporal.schema.useHelmHooks: false` on purpose, so Temporal's schema Job runs as a normal Kubernetes Job alongside PostgreSQL instead of a Helm hook. This avoids a deadlock when PostgreSQL is bundled in the same release. The schema setup and update are idempotent and run on every deploy.
- **Invariant**: The shard count `temporal.server.config.persistence.numHistoryShards` is pinned to **`512`**. **Do not modify this value.** Changing shard counts corrupts existing workflow execution history.

---

## 6. StatefulSet & PVC Storage Diagnostics

Bundled stateful services (PostgreSQL, RabbitMQ, Redis, Qdrant) use Kubernetes `StatefulSet` resources with PersistentVolumeClaims (PVCs).

### PVC Volume Expansion
The default bundled PostgreSQL PVC request is `50Gi` (`postgresql.primary.persistence.size: 50Gi`).

Changing `postgresql.primary.persistence.size` in your values alone fails: Kubernetes doesn't allow a StatefulSet's volume template to change. To grow the volume:

1. Check that your `StorageClass` allows volume expansion:
   ```bash
   kubectl get storageclass -o custom-columns=NAME:.metadata.name,ALLOWEXPANSION:.allowVolumeExpansion
   ```
   If `ALLOWEXPANSION` is `false`, expansion isn't possible on that StorageClass without changing it (`kubectl patch storageclass <name> -p '{"allowVolumeExpansion": true}'`, if your storage supports it).
2. Resize the existing volume:
   ```bash
   kubectl patch pvc data-postgresql-0 -n nudgebee -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
   ```
3. Remove the StatefulSet object without touching its pod or volume:
   ```bash
   kubectl delete sts postgresql -n nudgebee --cascade=orphan
   ```
4. Set the same size in your values file and run `helm upgrade`, which recreates the StatefulSet:
   ```yaml
   postgresql:
     primary:
       persistence:
         size: 100Gi
   ```

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
kubectl delete pod postgresql-0 --namespace nudgebee --grace-period=0 --force
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
kubectl delete statefulset postgresql --namespace nudgebee --cascade=orphan

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
    SVC -->|"RABBIT_MQ_HOST / PORT / USERNAME / PASSWORD"| MQ
    SVC -->|"REDIS_SERVER_HOST / PORT / USER_NAME / USER_PASSWORD"| REDIS
    SVC -.->|"Traces & Logs"| CH
```

To switch from bundled services to external managed infrastructure during an upgrade, provide the following overrides in your `user-values.yaml`:

```yaml
# 1. Disable bundled PostgreSQL and point to External RDS / Cloud SQL
postgresql:
  enabled: false

nudgebee_secret:
  APP_DATABASE_URL: "postgresql://nb_user:YourSecretPass@rds-postgres.internal.net:5432/nudgebee?sslmode=require"
  TEMPORAL_DB_PASSWORD: "YourSecretPass"   # Temporal reads its password from the `nudgebee-temporal` Secret
  # External RabbitMQ and Redis (see 2 and 3 below)
  RABBIT_MQ_HOST: "rabbitmq.internal.net"
  RABBIT_MQ_PORT: "5672"
  RABBIT_MQ_USERNAME: "nb_user"
  RABBIT_MQ_PASSWORD: "YourRabbitPass"
  CACHE_PROVIDER: "redis"                # required, or services use an in-memory cache
  REDIS_SERVER_HOST: "redis.internal.net"
  REDIS_SERVER_PORT: "6379"
  REDIS_USER_NAME: "default"
  REDIS_USER_PASSWORD: "YourRedisPass"

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
              pluginName: postgres12          # keep the chart's plugin
              connectAddr: "rds-postgres.internal.net:5432"
              databaseName: "temporal"
              user: "nb_user"
              existingSecret: nudgebee-temporal  # password = TEMPORAL_DB_PASSWORD
              # tls:
              #   enabled: true
          visibility:
            sql:
              pluginName: postgres12
              connectAddr: "rds-postgres.internal.net:5432"
              databaseName: "temporal_visibility"
              user: "nb_user"
              existingSecret: nudgebee-temporal
              # tls:
              #   enabled: true

# 2. Disable bundled RabbitMQ (set the RABBIT_MQ_* keys above)
rabbitmq:
  enabled: false

# 3. Disable bundled Redis (set CACHE_PROVIDER and the REDIS_SERVER_* / REDIS_USER_* keys above)
redis:
  enabled: false

# 4. ClickHouse (Tracing / Events)
clickhouse:
  enabled: false # Keep false if using external ClickHouse or if tracing is handled out-of-cluster
```

:::caution[Pre-Create External Databases]
Before running `helm upgrade` with external databases:
- The target PostgreSQL instance must have your application database (the one in `APP_DATABASE_URL`). The chart creates `temporal` and `temporal_visibility` if the database user has `CREATEDB`; otherwise pre-create them.
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

### Step 2: Evaluate Migration Impact (Additive vs. Destructive)

Helm rollback automatically reverts Kubernetes Deployments, ConfigMaps, Secrets, and container images to the previous revision. However, **Helm cannot automatically roll back database schema changes**. Determine the nature of the migration failure before proceeding:

1. **Additive Migrations (Non-Breaking)**:
   If the failed release only added new tables or nullable columns, the older application code will run safely without schema restoration. Proceed directly to **Scenario A (Direct Helm Rollback)**.
2. **Destructive Migrations (Schema Restore Required)**:
   If the failed release modified existing column types, renamed tables, or dropped constraints incompatibly, **do not run Helm rollback immediately**. Running Helm rollback first would cause older application pods to start up and connect to an incompatible database schema, risking crash-loops or data corruption. Instead, follow **Scenario B (Database Restore Prior to Workload Rollback)**.

---

### Step 3: Rollback Procedures

#### Scenario A: Direct Rollback for Additive (Non-Breaking) Upgrades
Simply roll back the Helm release to the target revision (e.g. revision 1):

```bash
helm rollback nudgebee <REVISION> --namespace nudgebee --wait --timeout 20m
```

Verify service recovery:
```bash
kubectl logs -n nudgebee -l app.kubernetes.io/name=services-server --tail=100
```

#### Scenario B: Rollback for Destructive Migrations

##### Option 1: Bundled PostgreSQL Restoration
For installations running the bundled PostgreSQL StatefulSet. The bundled application data lives in the `postgres` database, so restore onto a **fresh volume** rather than dropping databases in place:

```bash
# 1. Stop everything that writes to the database
kubectl scale deployment --all --namespace nudgebee --replicas=0

# 2. Replace the PostgreSQL volume with an empty one (this deletes current data — only with a verified backup)
kubectl scale statefulset postgresql --namespace nudgebee --replicas=0
kubectl get pvc --namespace nudgebee            # find the PostgreSQL volume, for example data-postgresql-0
kubectl delete pvc <postgresql-pvc-name> --namespace nudgebee
kubectl scale statefulset postgresql --namespace nudgebee --replicas=1
kubectl wait --for=condition=ready pod/postgresql-0 --namespace nudgebee --timeout=5m

# 3. Restore the pre-upgrade backup (pg_dumpall recreates the postgres, temporal and temporal_visibility databases)
gunzip -c nudgebee-postgres-preupgrade-<TIMESTAMP>.sql.gz | \
  kubectl exec -i postgresql-0 --namespace nudgebee -c postgresql -- sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U postgres'

# 4. Roll back Kubernetes resources via Helm (this also scales the Deployments back up)
helm rollback nudgebee <REVISION> --namespace nudgebee --wait --timeout 20m
```

:::note[Benign Errors During pg_dumpall Restore]
When restoring a `pg_dumpall` backup, PostgreSQL will attempt to recreate default roles (such as `postgres`) and the system `postgres` database. This will produce several `already exists` errors in the console (e.g., `ERROR: role "postgres" already exists`). These errors are expected, harmless, and can be safely ignored.
:::

##### Option 2: External Managed PostgreSQL (AWS RDS / Aurora) Restoration
For installations backed by external managed cloud databases:

```bash
# 1. Scale down application microservices, collectors, and Temporal pods to cut off active traffic
kubectl scale deployment --all --namespace nudgebee --replicas=0

# 2. Restore database from your pre-upgrade snapshot
# AWS RDS (Single Instance):
# Note: Include --db-subnet-group-name and --vpc-security-group-ids to preserve cluster network connectivity
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier <restored-rds-instance-id> \
  --db-snapshot-identifier "nudgebee-preupgrade-<timestamp>" \
  --db-subnet-group-name <your-db-subnet-group> \
  --vpc-security-group-ids <your-security-group-ids>

# AWS Aurora PostgreSQL (Cluster):
# Note: Include --db-subnet-group-name and --vpc-security-group-ids to preserve cluster network connectivity
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier <restored-aurora-cluster-id> \
  --snapshot-identifier "nudgebee-preupgrade-<timestamp>" \
  --engine aurora-postgresql \
  --db-subnet-group-name <your-db-subnet-group> \
  --vpc-security-group-ids <your-security-group-ids>

# Note: Aurora cluster restore provisions the shared storage volume only. Create an instance to make it accessible:
aws rds create-db-instance \
  --db-cluster-identifier <restored-aurora-cluster-id> \
  --db-instance-identifier <restored-aurora-instance-id> \
  --db-instance-class <instance-class> \
  --engine aurora-postgresql

# 3. Roll back Kubernetes resources. `helm rollback` reuses the old revision's stored
# values, so it ignores any edits in user-values.yaml. Either:
#  a) restore the snapshot under the ORIGINAL instance/cluster identifier (so the
#     endpoint in your values is unchanged) and run:
helm rollback nudgebee <REVISION> --namespace nudgebee --wait --timeout 20m
#  b) or, if the restored database has a new endpoint, update APP_DATABASE_URL and the
#     Temporal datastores in user-values.yaml and redeploy the old version instead:
helm upgrade nudgebee $NUDGEBEE_CHART --version <previous-version> -f user-values.yaml \
  --namespace nudgebee --wait --timeout 20m
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
  -sS http://services-server.nudgebee.svc.cluster.local:8000/health

# 4. Verify connected agents can reach relay-server
kubectl get pods --namespace nudgebee -l app.kubernetes.io/name=relay-server   # should be Running and Ready
```

For general installation setup, refer to the [Server Installation Guide](./index.md) and [Helm Values Reference](./helm_values.md).

## Related

- [Server Installation](./index.md)
- [Configuration Options](./secret_configs.md)
- [Helm Values Reference](./helm_values.md)
