---
sidebar_position: 2
title: Enable or Disable Agent Modules
---

# Enable or Disable Agent Modules

Start with the smallest agent installation that supports the workflows you use. Change modules in a values file and run `helm upgrade`; avoid relying on a long sequence of `--set` arguments that is difficult to review later.

## Module controls and impact

| Goal | Helm value | What changes |
|---|---|---|
| Stop the eBPF node agent | `nodeAgent.enabled: false` | Removes the node-agent DaemonSet. Network topology, L7 traffic metrics, node-agent logs, and profiles are unavailable. Kubernetes inventory and runner-based actions continue. |
| Stop the bundled trace pipeline | `opentelemetry-collector.enabled: false`, `clickhouse.enabled: false`, and `runner.clickhouse_enabled: false` | Removes the bundled OTel collector and ClickHouse, and stops the runner from expecting the ClickHouse Secret. Configure an external trace provider if trace queries are still required. |
| Stop runner mutations | `runner.mutateEnabled: false` | The runner does not register mutation handlers such as pod deletion, rollout restart, alert-rule changes, Alertmanager silences, and Loki rules. Read and investigation actions remain available. |
| Restrict Kubernetes permissions | `runner.readOnly: true` | Uses the read-only ClusterRole. Recommendations can still compute, but applying remediation to customer workloads is blocked. |
| Stop NudgeBee default alert rules | `alertmanager.create_nb_default_rules: false` | Stops rendering the chart's default `PrometheusRule`. It does not disable alert ingestion from rules managed elsewhere. |
| Stop monitoring CRs from this chart | `enableServiceMonitors: false` | Stops rendering the runner `ServiceMonitor`. The node-agent `PodMonitor` has its own switch. |
| Stop the node-agent `PodMonitor` | `nodeAgent.podmonitor.enabled: false` | Leaves the DaemonSet running but stops creating its Prometheus Operator scrape definition. Provide another scrape configuration or node-agent metrics will be absent. |
| Restrict Kubernetes event watching | `kubewatch.config.namespace` and `kubewatch.config.resource.*` | Limits which namespaces and resource kinds the forwarder watches. The chart has no switch that removes the forwarder Deployment entirely. |

`runner.readOnly`, `runner.enableWritePermissions`, and `runner.scannerAutoCopyPullSecrets` have compatibility rules. Do not combine `readOnly: true` with either of the other two; chart rendering fails deliberately.

## Minimal metrics-only example

This keeps Kubernetes discovery, Prometheus queries, and the relay connection while removing the node agent, bundled traces storage, and chart-managed default rules:

```yaml
nodeAgent:
  enabled: false

opentelemetry-collector:
  enabled: false

clickhouse:
  enabled: false

runner:
  clickhouse_enabled: false
  mutateEnabled: false

alertmanager:
  create_nb_default_rules: false
```

Apply and verify:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  --reuse-values \
  -f agent-overrides.yaml

kubectl get deploy,daemonset,statefulset -n nudgebee-agent
kubectl logs -n nudgebee-agent deploy/nudgebee-agent-runner --tail=100
```

With `--reuse-values`, values saved by an earlier release remain active unless your override changes them. Review the effective values before and after an upgrade:

```bash
helm get values nudgebee-agent -n nudgebee-agent -a
```

## Prometheus Operator resources

`enablePrometheusStack` does not install Prometheus. It tells the chart that Prometheus Operator CRDs are available, including `PrometheusRule`, `ServiceMonitor`, and `PodMonitor`. On a cluster without those CRDs, use:

```yaml
enablePrometheusStack: false
enableServiceMonitors: false

nodeAgent:
  podmonitor:
    enabled: false

clickhouse:
  metrics:
    serviceMonitor:
      enabled: false
```

Disabling these objects only removes automatic scrape and rule discovery. Point `globalConfig.prometheus_url` at a working metrics backend and configure equivalent scrape jobs where required.

## Event watcher controls

The forwarder Deployment is always rendered. Reduce its scope by setting a namespace and disabling resource kinds you do not want watched:

```yaml
kubewatch:
  config:
    namespace: application-team
    resource:
      deployment: true
      replicaset: true
      daemonset: false
      statefulset: true
      services: true
      pod: true
      job: true
      node: false
      hpa: true
      clusterrole: false
      clusterrolebinding: false
      serviceaccount: false
      persistentvolume: false
      namespace: false
      configmap: false
      secret: false
      event: true
      coreevent: false
      ingress: true
      rollout: true
```

The values file is the source of truth for the full resource map. Disabling a watcher stops future events of that kind; it does not remove inventory already stored by the server.

## Before disabling a module

1. Save the current effective values with `helm get values`.
2. Check which NudgeBee workflows depend on the module using the table above.
3. Render the proposed values with `helm template` and confirm which resources disappear.
4. Upgrade the release and inspect **Agent Health**.
5. Keep the saved values for rollback.

See [Helm Chart Values](./helm_values.md) for the complete operator-facing value reference and [Agent Storage and PVCs](./storage-and-pvcs.md) before disabling a stateful component.
