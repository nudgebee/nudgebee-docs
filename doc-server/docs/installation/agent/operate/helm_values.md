---
sidebar_position: 1
---

# Helm Chart Values

The values you are likely to set, grouped by what you are trying to do. Anything not listed here is an internal default or a passthrough to a subchart.

The chart is open source at [`nudgebee/k8s-agent`](https://github.com/nudgebee/k8s-agent). If this page and [`values.yaml`](https://github.com/nudgebee/k8s-agent/blob/main/charts/nudgebee-agent/values.yaml) disagree, the chart is right.

## Subcharts

| Repository | Name | Version | Condition |
|---|---|---|---|
| https://charts.bitnami.com/bitnami | clickhouse | 3.1.* | `opentelemetry-collector.enabled` |
| https://open-telemetry.github.io/opentelemetry-helm-charts | opentelemetry-collector | 0.165.0 | `opentelemetry-collector.enabled` |

---

## Required

| Key | Type | Default | Description |
|---|---|---|---|
| `runner.nudgebee.auth_secret_key` | string | `""` | Agent auth key from **Admin → Integrations → Kubernetes Clusters**. The backend derives the account and cluster from this key. |
| `runner.nudgebee.endpoint` | string | `https://collector.nudgebee.com` | Collector URL. Self-hosted: `https://collector.yourcompany.com`. |
| `runner.relay_address` | string | `wss://relay.nudgebee.com/register` | Relay WebSocket URL. Self-hosted: `wss://relay.yourcompany.com/register`. |
| `globalConfig.prometheus_url` | string | `""` | Prometheus/Thanos/VictoriaMetrics query URL. Empty = auto-discover in-cluster. |

### Auth key from an existing Secret

If something else creates the credential — External Secrets, a parent chart, your own pipeline — point the agent at that Secret instead of putting the key in your values. Setting this and `auth_secret_key` together fails the install rather than silently picking one.

```yaml
runner:
  nudgebee:
    authSecretKeyFrom:
      name: my-existing-secret
      key: NUDGEBEE_AUTH_SECRET_KEY
```

---

## Permissions and access mode

A default install can already act on workloads: delete and evict pods, exec into them, cordon nodes, restart rollouts, scale Deployments and ReplicaSets, patch HPAs, manage `PrometheusRule`s, and read Secrets. Two values change that in either direction.

| Key | Type | Default | Description |
|---|---|---|---|
| `runner.enableWritePermissions` | bool | `false` | Adds the cluster-shape permissions the default install leaves out: node delete, Service/Endpoint/ServiceAccount management, Secret update and delete, namespace create and delete, ResourceQuota and LimitRange writes, `statefulsets/scale`, workload creation, Ingress and NetworkPolicy writes, rollout lifecycle. |
| `runner.readOnly` | bool | `false` | Cuts the ClusterRole down to `get`, `list`, `watch`. No Secrets access at all, no `pods/exec`, no eviction, no node patch. The few writes the agent needs to run come from a Role scoped to the release namespace. |
| `runner.mutateEnabled` | bool | `true` | Turns the runner's mutating actions on or off inside the agent itself (`delete_pod`, `cordon`, `rollout_restart`, PrometheusRule CRUD, Alertmanager silences, Loki rules). With `false` they are never registered at startup, whatever RBAC allows. |
| `runner.scannerAutoCopyPullSecrets` | bool | `false` | Lets an image scan copy the scanned pod's `imagePullSecrets` into the scanner namespace so private images can be pulled. Also grants secret update, patch, and delete in the release namespace to clean the copies up afterwards. |
| `runner.customClusterRoleRules` | list | `[]` | Extra rules appended to the runner ClusterRole. |
| `runnerServiceAccount.imagePullSecrets` | list | `[]` | Pull secrets attached to the runner ServiceAccount. |
| `automountServiceAccountToken` | bool | `true` | Mount the ServiceAccount token in agent pods. |

| Capability | Default | `enableWritePermissions` | `readOnly` |
|---|---|---|---|
| Read cluster inventory and metrics | yes | yes | yes |
| Scanner Jobs and script-runner in the release namespace | yes | yes | yes |
| Create and edit `PrometheusRule`s from the UI | yes | yes | release namespace only |
| Exec, terminal, profiling into a pod | yes | yes | release namespace only |
| Read Secrets | yes | yes | no |
| Delete or evict a pod, cordon a node, restart a rollout | yes | yes | no |
| Scale a Deployment or ReplicaSet, apply a rightsizing | yes | yes | no |
| Delete a node | no | yes | no |
| Create a workload or namespace | no | yes | no |
| Write Services, Ingresses, NetworkPolicies, Secrets | no | yes | no |
| Scale a StatefulSet | no | yes | no |

To switch modes on an existing install:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  -n nudgebee-agent --reuse-values \
  --set runner.enableWritePermissions=true   # or runner.readOnly=true
```

`readOnly` cannot be combined with `enableWritePermissions` or `scannerAutoCopyPullSecrets`. The install fails if you set both.

Under `readOnly` the rightsizing recommendations still compute; you just cannot apply them from the UI. If your security review needs to see the exact permissions first, the whole read-only ClusterRole is in one file: [`runner-service-account-readonly.yaml`](https://github.com/nudgebee/k8s-agent/blob/main/charts/nudgebee-agent/templates/runner-service-account-readonly.yaml).

If what you want is for the agent not to act, rather than for its ServiceAccount to lose the permission, `mutateEnabled: false` is the smaller change. The actions are never registered and the RBAC stays as it is.

### Actions triggered from the UI

```yaml
runner:
  nudgebee:
    relay_signing_public_key: "<server SIGNING_PUBLIC_KEY>"
```

This is the relay's Ed25519 public key. The agent uses it to check that a request really came from the relay before running a workload mutation. Leave it empty and those requests are rejected with `401` no matter what RBAC allows. The install command generated by the UI fills it in for you; you only set it by hand when writing your own values file for a self-hosted server.

---

## Metrics backend

| Key | Type | Default | Description |
|---|---|---|---|
| `globalConfig.prometheus_url` | string | `""` | Query URL for Prometheus, Thanos Query, Mimir, VictoriaMetrics, Chronosphere, AMP. |
| `globalConfig.prometheus_headers` | string | `""` | Comma-separated `Header: value` pairs (static auth header). |
| `globalConfig.prometheus_additional_labels` | object | `{}` | Labels appended to every PromQL query, e.g. `{k8s_cluster: aws-prod}`. |
| `runner.prometheus.auth.coralogixToken` | string | `""` | Coralogix token (sent as the `token` header). |
| `runner.prometheus.auth.awsAccessKey` / `awsSecretAccessKey` / `awsRegion` / `awsServiceName` | string | `""` | AWS SigV4 for Amazon Managed Prometheus. `serviceName` defaults to `aps`. |
| `runner.prometheus.auth.azureUseManagedId` / `azureClientId` / `azureClientSecret` / `azureTenantId` / `azureResource` | string | `""` | Azure AD for Azure Monitor managed Prometheus. |

In-cluster Prometheus needs none of the `auth` values. Use them for managed backends that sign requests rather than accepting a static header. If more than one is filled in, AWS wins, then Coralogix, then Azure. Endpoint formats for each backend are in [Prometheus Metrics Integrations](../connect/metrics.md).

---

## Alerts

These values only control the alert rules the chart ships. Getting alerts to the agent is a separate job that happens in your Alertmanager: see [Alert Forwarding](../connect/alertmanager.md).

| Key | Type | Default | Description |
|---|---|---|---|
| `alertmanager.create_nb_default_rules` | bool | `true` | Render NudgeBee's default `PrometheusRule` set. |
| `alertmanager.extra_rule_exclusions` | list | `[]` | Silences the default log-error and API-failure rules for workloads you expect to fail, such as demo or load-test apps. Each term is matched as a substring of `/k8s/<namespace>/<pod>/<container>`, so a namespace name excludes everything in it: `["demo", "nb-bench"]`. |
| `alertmanager.rule_keep_firing_for` | string | `""` | Keeps the flappy rules firing through short dips instead of resolving and re-firing, e.g. `"10m"`. Set it only if every rule evaluator in the cluster understands `keep_firing_for`. Prometheus older than 2.42 rejects the entire rule file when it sees the field, which takes down all the rules in it. |

---

## Logs

| Key | Type | Default | Description |
|---|---|---|---|
| `runner.loki.url` | string | `""` | Loki endpoint. |
| `runner.loki.headers` | string | `""` | Extra headers (e.g. `X-Scope-OrgID: tenant`). |
| `runner.loki.username` / `password` | string | `""` | Optional HTTP basic auth. |
| `runner.es.enabled` | bool | `false` | Elasticsearch is off unless you set both `enabled: true` and `url`, so a leftover `url` never quietly takes over from another logs provider. |
| `runner.es.url` / `apiKey` | string | `""` | Elasticsearch endpoint and API key. |
| `runner.es.headers` | string | `""` | Extra request headers, comma-separated `Key: Value` pairs. For OpenSearch-compatible services that authenticate on a custom header — Logz.io uses `X-API-TOKEN`. |
| `runner.es.sslVerify` | bool | `false` | Verify the ES TLS certificate (https URLs). |
| `runner.signoz.url` | string | `""` | SigNoz endpoint. |
| `runner.signoz.apiKey` / `user` / `password` | string | `""` | `apiKey` takes precedence over user/password. |

See [Logging Integration](../connect/logging/index.md).

---

## Traces

| Key | Type | Default | Description |
|---|---|---|---|
| `opentelemetry-collector.enabled` | bool | `true` | In-cluster OTel collector writing to the bundled ClickHouse. |
| `clickhouse.enabled` | bool | `true` | Bundled ClickHouse for traces/logs storage. |
| `clickhouse.persistence.size` | string | `50Gi` | ClickHouse PVC size. |
| `clickhouse.auth.password` | string | `""` | Empty = the subchart generates one on first install, stored in the `<release>-clickhouse` Secret under `admin-password`. |
| `runner.clickhouse_enabled` | bool | `true` | Runner reads traces from ClickHouse. |
| `runner.clickhouse_secret` | string | `""` | Secret holding the ClickHouse password (key `admin-password`). Empty = the bundled `<release>-clickhouse` Secret. |
| `runner.jaeger.queryUrl` / `token` | string | `""` | In-cluster Jaeger query endpoint for `jaeger_query_*` actions. |
| `runner.chronosphere.url` / `apiKey` | string | `""` | Chronosphere trace queries. |
| `runner.chronosphere.tracesEnabled` | bool | `true` | Report Chronosphere as the traces provider when `url` is set. |
| `runner.chronosphere.tracesUrl` | string | `""` | Explicit traces URL; empty falls back to `prometheus_url` when it points at chronosphere.io. |
| `runner.pinot.url` / `authToken` / `username` / `password` | string | `""` | Apache Pinot broker. |
| `runner.grafana.url` / `username` / `password` / `extra_headers` | string | `""` | Grafana endpoint the agent proxies UI requests to. `extra_headers` is semicolon-separated. |

See [Tracing Integration](../connect/tracing/index.md).

---

## Runner sizing

If the runner is getting OOMKilled, this is the section you want. Its memory is dominated by the informer cache, so it scales with the number of objects in the cluster, not with traffic.

| Key | Type | Default | Description |
|---|---|---|---|
| `runner.resources.requests.cpu` | string | `250m` | |
| `runner.resources.requests.memory` | string | `1000Mi` | |
| `runner.resources.limits.memory` | string | `2000Mi` | Budget roughly 1Gi per 50k watched objects. Under 100 nodes the default is fine; around 500 nodes use `4000Mi`; around 1000 nodes use `6000Mi` or more. |
| `runner.goMemLimitRatio` | float | `0.8` | How much of the memory limit the Go heap may use, with the rest left for non-heap memory. The chart derives `GOMEMLIMIT` from the limit and this ratio, so the GC knows about the ceiling instead of finding it via a SIGKILL. Lower it if the pod still OOMs at a limit you think is generous. |
| `runner.goMemLimit` | string | `""` | Sets `GOMEMLIMIT` directly, e.g. `1600MiB`, and skips the calculation above. |
| `runner.probes.enabled` | bool | `true` | Liveness and readiness probes against `/healthz` on port 5000. |
| `runner.scaling.snapshotBatching` | bool | `true` | Sends the full inventory snapshot in batches rather than one payload. |
| `runner.scaling.batchSize` | int | `1000` | Objects per snapshot batch. |
| `runner.scaling.incrementalBatchSize` | int | `100` | How many informer events are coalesced into one POST. |
| `runner.scaling.emitTombstones` | bool | `true` | Reports deletions so the backend drops objects that no longer exist. |
| `runner.pprof` | bool | `false` | Exposes `net/http/pprof` on the runner. The endpoints are unauthenticated, so turn it on for a debugging session and off again. |
| `runner.tolerations` / `nodeSelector` / `annotations` / `affinity` | | | Standard scheduling controls. |
| `runner.extraVolumes` / `extraVolumeMounts` | list | `[]` | Extra volumes on the runner pod. |
| `runner.additional_env_vars` | list | `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_DB` | Extra environment variables on the runner. Helm replaces lists rather than merging them, so if you set this, re-state the three `CLICKHOUSE_*` entries from the chart. |

---

## Node agent (eBPF)

| Key | Type | Default | Description |
|---|---|---|---|
| `nodeAgent.enabled` | bool | `true` | eBPF DaemonSet for network metrics, logs, and profiles. |
| `nodeAgent.image.repository` | string | `ghcr.io/nudgebee/node-agent` | |
| `nodeAgent.image.tag` | string | `0.1.5` | |
| `nodeAgent.resources.requests` | object | `100m` / `500Mi` | |
| `nodeAgent.resources.limits` | object | `1` / `1Gi` | |
| `nodeAgent.podmonitor.enabled` | bool | `true` | Render a `PodMonitor` so Prometheus scrapes the node agent. |
| `nodeAgent.podmonitor.additionalLabels` | object | `{}` | These have to match your Prometheus CR's `podMonitorSelector`. If they do not, the operator ignores the PodMonitor, no scrape target is created, and network metrics stay empty with nothing reporting an error. Example: `{pod-monitor: pod-monitor}`. |
| `nodeAgent.podmonitor.namespaceSelector` | object | `{}` | Which namespaces Prometheus looks in for the pods. Empty means the PodMonitor's own namespace. Example: `{matchNames: [nudgebee-agent]}` or `{any: true}`. |
| `nodeAgent.podmonitor.azuremanaged` | bool | `false` | Emits the `azmonitoring.coreos.com` PodMonitor that Azure Monitor managed Prometheus reads instead. |
| `nodeAgent.priorityClassName` | string | `""` | |
| `nodeAgent.env` | list | see chart | Includes `SENSITIVE_HEADERS`, the header names the node agent strips from captured traffic. |

Without the prometheus-operator there is no PodMonitor to create. Scrape the node agent with the job from [`kube-prometheus-stack-values.yaml`](https://github.com/nudgebee/k8s-agent/blob/main/kube-prometheus-stack-values.yaml) instead. More detail in [Node Agent Configuration](./node-agent-configs.md).

---

## Event watcher (kubewatch)

| Key | Type | Default | Description |
|---|---|---|---|
| `kubewatch.image.repository` | string | `ghcr.io/nudgebee/kubewatch` | |
| `kubewatch.image.tag` | string | `2.14.1-nb.2` | |
| `kubewatch.config.namespace` | string | `""` | Restrict watching to one namespace. Empty = all. |
| `kubewatch.config.resource.*` | bool | see chart | Per-resource watch toggles. `secret` and `coreevent` are off by default; `replicationcontroller` is unsupported. |
| `kubewatch.resources.requests` | object | `10m` / `512Mi` | |

---

## Platform-specific

| Key | Type | Default | Description |
|---|---|---|---|
| `openshift.enabled` | bool | `false` | Render OpenShift SCCs. |
| `openshift.createScc` | bool | `true` | Baseline SCC. |
| `openshift.createPrivilegedScc` | bool | `false` | Privileged SCC (node agent eBPF). |
| `openshift.sccName` / `privilegedSccName` / `sccPriority` / `privilegedSccPriority` | | `null` | Overrides. |
| `enablePrometheusStack` | bool | `true` | Asserts that the prometheus-operator CRDs (`ServiceMonitor`, `PodMonitor`, `PrometheusRule`) are registered, so those manifests still render during offline templating (Argo CD, Flux). Set `false` on a cluster with no operator. |
| `enableServiceMonitors` | bool | `true` | Render ServiceMonitors for agent components. |
| `nameOverride` / `fullnameOverride` | string | `""` | Resource naming. |
| `globalConfig.custom_annotations` | object | `{}` | Annotations added to all agent pods. |

### Installing where there is no Prometheus operator

The install fails on unregistered CRDs unless you turn off both of these. The ClickHouse subchart also emits `monitoring.coreos.com` resources, and a parent chart can only flip a subchart's values, not add a condition to its templates, so it needs its own flag:

```bash
--set enablePrometheusStack=false \
--set clickhouse.metrics.serviceMonitor.enabled=false
```

---

## Component names

Names come from the release name, which is what you need when writing an Alertmanager receiver URL or tailing logs. For a release named `nudgebee-agent`:

| Component | Kind | Name |
|---|---|---|
| Runner | Deployment / Service | `nudgebee-agent-runner` (Service port 80 → container 5000) |
| Event watcher | Deployment | `nudgebee-agent-forwarder` |
| Node agent | DaemonSet | `nudgebee-agent-node-agent` (pod label `app=nudgebee-node-agent`) |
| ClickHouse | StatefulSet / Service | `nudgebee-agent-clickhouse-shard0` / `nudgebee-agent-clickhouse` |
| OTel collector | Deployment / Service | `nudgebee-agent-opentelemetry-collector` |
