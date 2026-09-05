---
sidebar_position: 3
title: Agent Storage and PVCs
---

# Agent Storage and PVCs

The agent runner, event watcher, and node-agent DaemonSet do not require persistent volumes. A default chart installation creates persistent storage for bundled ClickHouse, which stores data received by the bundled OpenTelemetry collector.

## Use the default StorageClass

Leave `global.storageClass` empty to use the cluster's default StorageClass:

```yaml
global:
  storageClass: ""

clickhouse:
  persistence:
    size: 50Gi
```

Confirm that the cluster has a default before installing:

```bash
kubectl get storageclass
```

The default class has the annotation `storageclass.kubernetes.io/is-default-class=true`.

## Use a non-default StorageClass

Set the class explicitly when the cluster has no default or when ClickHouse must use a particular storage tier:

```yaml
global:
  storageClass: gp3

clickhouse:
  persistence:
    size: 100Gi
```

`global.storageClass` takes precedence over `clickhouse.persistence.storageClass`. Prefer the global value so the effective storage policy is visible in one place.

Render before applying:

```bash
helm template nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  -f agent-overrides.yaml | grep -A18 -B3 'volumeClaimTemplates:'
```

## A PVC remains Pending

Start with the claim and its events:

```bash
kubectl get pvc -n nudgebee-agent
kubectl describe pvc -n nudgebee-agent <claim-name>
kubectl get storageclass <storage-class> -o yaml
kubectl get events -n nudgebee-agent --sort-by=.lastTimestamp | tail -30
```

Common causes are:

- The named StorageClass does not exist.
- No StorageClass is marked as the default while `global.storageClass` is empty.
- The provisioner cannot create a volume in the node's zone.
- The class uses `WaitForFirstConsumer` and the ClickHouse pod cannot be scheduled for another reason.
- The requested size or access mode is unsupported by the provisioner.

Do not delete a bound PVC as a routine troubleshooting step. Verify the reclaim policy and whether the data is still needed first.

## Increase the volume size

Check whether the class allows expansion:

```bash
kubectl get storageclass <storage-class> -o jsonpath='{.allowVolumeExpansion}{"\n"}'
```

If it returns `true`, increase `clickhouse.persistence.size` and run the chart upgrade. Kubernetes does not support shrinking an existing PVC.

```yaml
clickhouse:
  persistence:
    size: 100Gi
```

Then inspect both the claim and filesystem resize state:

```bash
kubectl get pvc -n nudgebee-agent
kubectl describe pvc -n nudgebee-agent <claim-name>
```

## Run without bundled persistent storage

If you do not use the bundled trace pipeline, disable it at the parent dependency switch:

```yaml
opentelemetry-collector:
  enabled: false

runner:
  clickhouse_enabled: false
```

The collector value is the dependency condition for both the bundled collector and ClickHouse. The separate runner value prevents the runner Deployment from referencing the now-absent ClickHouse password Secret. Confirm the rendered output contains neither component nor a `CLICKHOUSE_PASSWORD` reference before upgrading. Disabling them removes the in-cluster trace ingestion and storage path; configure an external supported trace provider if those workflows must continue.
