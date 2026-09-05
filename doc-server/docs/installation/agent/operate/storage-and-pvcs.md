---
sidebar_position: 3
title: Agent Storage, ClickHouse & OpenTelemetry Collector
---

# Agent Storage, ClickHouse & OpenTelemetry Collector

The agent runner, event watcher, and node-agent DaemonSet do not require persistent volumes. A default chart installation creates persistent storage for bundled **ClickHouse**, which stores trace and telemetry data received by the bundled **OpenTelemetry Collector**.

When ClickHouse or the OpenTelemetry Collector crashloop, restart, or fail to start, follow this guide to identify the root cause and remediate it.

---

## 1. Storage Configuration and PVCs

### Use the Default StorageClass

Leave `global.storageClass` empty to use the cluster's default StorageClass:

```yaml
global:
  storageClass: ""

clickhouse:
  persistence:
    size: 50Gi
```

Confirm that your cluster has an active default StorageClass:

```bash
kubectl get storageclass
```

The default class carries the annotation `storageclass.kubernetes.io/is-default-class=true`.

### Use a Non-Default StorageClass

Specify a StorageClass when the cluster has no default or when ClickHouse requires a specific performance tier (e.g., `gp3` on AWS, `premium-rwo` on AKS, or `pd-ssd` on GKE):

```yaml
global:
  storageClass: gp3

clickhouse:
  persistence:
    size: 100Gi
```

`global.storageClass` takes precedence over `clickhouse.persistence.storageClass`. Prefer the global value so storage policy is centrally managed.

---

## 2. Troubleshooting ClickHouse Restart & Crash Loops

If the ClickHouse pod (`nudgebee-agent-clickhouse-0`) is in `CrashLoopBackOff`, `Pending`, or restarting frequently, inspect the pod status:

```bash
kubectl get pods -n nudgebee-agent -l app.kubernetes.io/name=clickhouse
kubectl describe pod -n nudgebee-agent nudgebee-agent-clickhouse-0
kubectl logs -n nudgebee-agent nudgebee-agent-clickhouse-0 -c clickhouse --tail=100
```

### Failure 1: OOMKilled (Exit Code 137)

- **Symptom**: Pod restarts repeatedly. `kubectl describe pod` reports `Last State: Terminated, Reason: OOMKilled, Exit Code: 137`.
- **Cause**: The default memory limit for ClickHouse is `2000Mi`. In clusters with high trace volumes or complex aggregation queries, memory consumption exceeds 2Gi.
- **Remediation**: Increase ClickHouse memory requests and limits:
  ```yaml
  clickhouse:
    resources:
      requests:
        cpu: 200m
        memory: 2Gi
      limits:
        memory: 4Gi # Increase to 8Gi for high-throughput production clusters
  ```

### Failure 2: PVC Remains Pending

- **Symptom**: ClickHouse pod sits in `Pending` state. `kubectl describe pvc` shows `Waiting for a volume to be created`.
- **Diagnosis**:
  ```bash
  kubectl get pvc -n nudgebee-agent
  kubectl describe pvc -n nudgebee-agent data-nudgebee-agent-clickhouse-0
  kubectl get events -n nudgebee-agent --sort-by=.lastTimestamp | tail -30
  ```
- **Common Causes**:
  - **No default StorageClass**: `global.storageClass` is empty and no cluster default is marked. Set `global.storageClass: <your-class>`.
  - **Single-Zone Cloud Disk Pinning (EBS / GPD)**: The PVC is bound to an EBS volume in zone `us-east-1a`, but the node scheduler placed the pod in `us-east-1b`. Cloud volumes cannot cross Availability Zones.
  - **`WaitForFirstConsumer`**: The storage class delays provisioning until the pod is scheduled. If pod scheduling is blocked by node taints or insufficient CPU/memory, volume binding will never trigger.

### Failure 3: Disk Full (100% Volume Usage)

- **Symptom**: ClickHouse locks into read-only mode. The OpenTelemetry Collector fails to write traces with:
  `Code: 243. DB::Exception: Cannot write to file ... No space left on device`
- **Cause**: The default volume size is `50Gi` and trace retention TTL defaults to `168h` (7 days). High-volume clusters can fill 50Gi well before 7 days expire.
- **Remediation**:
  1. Check disk utilization:
     ```bash
     kubectl exec -n nudgebee-agent nudgebee-agent-clickhouse-0 -c clickhouse -- df -h /bitnami/clickhouse
     ```
  2. Verify that your StorageClass allows dynamic expansion:
     ```bash
     kubectl get storageclass <class-name> -o jsonpath='{.allowVolumeExpansion}{"\n"}'
     ```
  3. If `true`, increase `clickhouse.persistence.size` and upgrade the chart:
     ```yaml
     clickhouse:
       persistence:
         size: 100Gi
     ```
  4. Tune trace retention and sampling to control disk growth:
     ```yaml
     opentelemetry-collector:
       config:
         exporters:
           clickhouse:
             ttl: 72h # Reduce retention from 7 days to 3 days
     ```

### Failure 4: Password Secret Desynchronization (`Authentication Failed`)

- **Symptom**: OpenTelemetry Collector logs `Code: 516. DB::Exception: default: Authentication failed` or runner cannot query traces.
- **Cause**: The Bitnami ClickHouse subchart auto-generates a random password on first install and saves it in `<release>-clickhouse` Secret (`admin-password`). If the Secret was deleted or regenerated during an upgrade, the password in the secret drifts from the running database credentials.
- **Remediation**: Pin the password explicitly in your values to prevent drift:
  ```yaml
  clickhouse:
    auth:
      password: "YourSecureClickHousePassword"
  ```
  Then upgrade the Helm release.

### Failure 5: Schema Upgrade Job Failures

- **Symptom**: Helm upgrades fail with `Job failed: nudgebee-agent-clickhouse-schema-upgrade`.
- **Diagnosis**:
  ```bash
  kubectl logs -n nudgebee-agent job/nudgebee-agent-clickhouse-schema-upgrade
  ```
- **Cause**: The post-upgrade schema migration job runs before ClickHouse is fully ready or fails authentication due to mismatched passwords. Ensure ClickHouse is running and healthy before re-running `helm upgrade`.

---

## 3. Troubleshooting OpenTelemetry Collector Failures

The OpenTelemetry Collector receives spans from node agents and applications, batches them, and exports them to ClickHouse.

```bash
kubectl get pods -n nudgebee-agent -l app.kubernetes.io/name=opentelemetry-collector
kubectl logs -n nudgebee-agent -l app.kubernetes.io/name=opentelemetry-collector -c opentelemetry-collector --tail=100
```

### Failure 1: Collector OOMKilled Due to Missing `memory_limiter`

- **Symptom**: Collector pod repeatedly restarts with `OOMKilled (Exit Code 137)`.
- **Cause**: **Helm replaces lists instead of merging them.** The collector subchart defines a `memory_limiter` processor. When you override pipeline configurations in `values.yaml` without listing `memory_limiter` as the **first processor**, the collector operates with no admission backpressure. Under traffic spikes, memory grows unbounded until kernel OOM kills the pod.
- **Remediation**: Whenever customizing collector pipelines, ensure `memory_limiter` is the first processor in every pipeline:
  ```yaml
  opentelemetry-collector:
    config:
      service:
        pipelines:
          traces:
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
            receivers: [otlp]
          logs:
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
            receivers: [otlp]
          metrics:
            processors: [memory_limiter, batch]
            exporters: [clickhouse]
            receivers: [otlp]
  ```
  *(Note: If you add custom processors such as namespace filters or sampling, define them under `opentelemetry-collector.config.processors` and place them between `memory_limiter` and `batch`.)*

### Failure 2: Buffer Exhaustion During ClickHouse Restarts

- **Symptom**: Collector restarts or drops spans when ClickHouse is restarting.
- **Cause**: When ClickHouse is unreachable, the collector retries exports with `max_elapsed_time: 300s`. If ClickHouse remains down, in-memory retry queues fill up and trigger `memory_limiter` data drops.
- **Remediation**: Fix the underlying ClickHouse pod issues (storage or memory). The collector will automatically reconnect once ClickHouse accepts TCP connections on port 9000.

### Failure 3: Export Fails with `Connection Refused` on Renamed Services

- **Symptom**: Collector logs `dial tcp: lookup nudgebee-agent-clickhouse: no such host` or `connection refused`.
- **Cause**: If `clickhouse.nameOverride` or `fullnameOverride` was changed, the Kubernetes service name changes, but the hardcoded exporter endpoint in the collector configuration still points to the old service name.
- **Remediation**: Update the exporter endpoint to match the overridden service name:
  ```yaml
  opentelemetry-collector:
    config:
      exporters:
        clickhouse:
          endpoint: "tcp://<custom-clickhouse-service-name>:9000?dial_timeout=10s&compress=lz4"
  ```

---

## 4. Run Without Bundled Persistent Storage & Traces

If you do not use the bundled trace pipeline, disable both components together:

```yaml
opentelemetry-collector:
  enabled: false

clickhouse:
  enabled: false

runner:
  clickhouse_enabled: false
```

- Disabling `opentelemetry-collector` and explicitly setting `clickhouse.enabled: false` removes both the Collector and ClickHouse subcharts, freeing all persistent volume claims and memory.
- Setting `runner.clickhouse_enabled: false` is **mandatory**; it prevents the runner Deployment from attempting to mount the `CLICKHOUSE_PASSWORD` Secret, which will not exist when ClickHouse is disabled.
- Render manifests before upgrading to confirm no `CLICKHOUSE_PASSWORD` reference remains:
  ```bash
  helm template nudgebee-agent nudgebee-agent/nudgebee-agent \
    --namespace nudgebee-agent \
    -f values.yaml | grep -i clickhouse
  ```

