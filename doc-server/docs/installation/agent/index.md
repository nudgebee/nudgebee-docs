---
sidebar_position: 1
sidebar_label: Cluster Collector
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Cluster Collector

The NudgeBee Cluster Collector is a lightweight software component that runs inside your Kubernetes cluster. It collects data about workloads, performance, cost, and security, and sends it to the NudgeBee server — feeding the [Semantic Knowledge Graph](../../features/knowledge-graph.md) that powers NudgeBee's Cloud-Ops Intelligence. You need to install a collector in every cluster that you want NudgeBee to monitor. The collector supports AWS, Azure, GCP, and on-premises Kubernetes environments.

:::info
**Both Cloud SaaS and self-hosted users** need to install the collector. This is how NudgeBee gets visibility into your Kubernetes clusters, regardless of your deployment model.
:::

:::tip
If you connected a cloud account (AWS, Azure, or GCP), NudgeBee can auto-discover your Kubernetes clusters. You may still need to install the collector for deep monitoring, but cluster discovery happens automatically.
:::

:::note[Previously called the "NudgeBee Agent"]
The Cluster Collector is the component this documentation used to call the **NudgeBee Agent** or
**K8s Agent**. Only the name changed — it is passive data collection, not an autonomous AI agent
(that is [NuBi](../../features/ai/index.md)).

Nothing you type changes. The Helm repo, chart, release, and namespace are still `nudgebee-agent`,
the pods are still `nudgebee-agent-runner` and `nudgebee-agent-node-agent`, and the console still
labels the status card **Agent Health**.

Two other components keep the word "agent" and are *not* the Cluster Collector: the
**[Node Agent](https://github.com/nudgebee/node-agent)**, the eBPF DaemonSet that ships inside the
collector, and the **[Proxy Agent](../proxy-agent/)**, a separate binary for datasources outside
Kubernetes.
:::

### What You Will Find in This Section

**Install** — getting the collector running, 5–10 minutes per cluster.

- **[Install the collector](./installation/)** — prerequisites, Helm install, and how to verify it connected.
- **[Kubernetes providers](./installation/k8s-provider/)** — extra steps for GKE and AKS.
- **[Upgrade](./installation/upgrade.md)** — moving an existing collector to a newer version.

**Connect data sources** — what the collector reads once it is running.

- **[Alert forwarding](./connect/alertmanager.md)** — point your Alertmanager at the collector. Without this NudgeBee never sees an alert.
- **[Metrics](./connect/metrics.md)** — Prometheus, Thanos, VictoriaMetrics, Chronosphere, and other backends.
- **[Why is Prometheus Disconnected?](./connect/prometheus-troubleshooting.md)** — 10-step decision tree for debugging metrics connectivity and authentication.
- **[Logs](./connect/logging/)** — Loki, Elasticsearch, SigNoz, Last9.
- **[Traces](./connect/tracing/)** — the bundled OTel collector and ClickHouse, or Google Cloud Trace.
- **[Grafana](./connect/grafana.md)** and **[multi-tenant Prometheus](./connect/multi_tenant_metrics.md)**.

**Operate & Troubleshoot** — tuning, health monitoring, and diagnostics for a running collector.

- **[Troubleshoot Collector Connectivity](./operate/troubleshoot-agent-connectivity.md)** — diagnose disconnected collectors, periodic heartbeat staleness, flapping, and safe log bundles.
- **[Agent Health & Subsystem Probes](./operate/agent-health.md)** — field-by-field reference for Relay, Prometheus, Logs, Traces, and Node Agent probes.
- **[Enable or Disable Collector Modules](./operate/module-configuration.md)** — module switches, feature impact, and verification steps.
- **[Collector Storage and PVCs](./operate/storage-and-pvcs.md)** — default and custom StorageClasses, pending claims, expansion, and disabling bundled trace storage.
- **[Helm values](./operate/helm_values.md)** — every value you are likely to set, including access modes and sizing.
- **[Node agent configuration](./operate/node-agent-configs.md)** — eBPF collector tuning.
- **[Cluster autoscaler](./operate/cluster-autoscaler/)** — Karpenter support.

**Other environments**

- **[Proxy Agent](../proxy-agent/)** — deploy through a proxy for restricted or air-gapped networks.
- **[Local setup](./local-setup.md)** — run against a local KinD cluster.
- **[On-prem setup](./onprem-setup.md)** — values for a self-hosted server.

## Architecture

The NudgeBee Cluster Collector runs within your Kubernetes cluster. The main component is the Runner, which acts as a central controller — it coordinates data collection from cluster components and maintains a secure, outbound-only WebSocket connection to the NudgeBee Server.

<figure style={{margin: '0 0 1.5rem'}}>
  <ThemedImage
    alt="The Cluster Collector inside a monitored Kubernetes cluster. The Kubernetes API Server and Alertmanager push events and alerts into the collector; the Runner queries Prometheus, your log store and the bundled trace store in place; the Node Agent exports eBPF spans to the OTel Collector and is scraped by Prometheus. A single outbound connection on 443 reaches the NudgeBee Relay and Collector servers — no inbound port is opened."
    sources={{
      light: useBaseUrl('/img/architecture/cluster-collector-light.svg'),
      dark: useBaseUrl('/img/architecture/cluster-collector-dark.svg'),
    }}
  />
  <figcaption style={{fontSize: '0.85rem', opacity: 0.75, textAlign: 'center', marginTop: '0.5rem'}}>
    The Runner is the only component that talks to NudgeBee, and it only ever dials out.
  </figcaption>
</figure>

## Components

### [Event Watcher (Forwarder)](https://github.com/robusta-dev/kubewatch) - Watch for K8s Events
- Monitors Kubernetes events using the Kubernetes API server.
- Filters and processes events based on predefined criteria.
- Forwards relevant events to the Runner component for incident triage.

### [Node Agent](https://github.com/nudgebee/node-agent) - Network & eBPF Telemetry
The Node Agent collects low-overhead network metrics and distributed trace signals on each Kubernetes node using eBPF:
- **eBPF Probes**: Attaches to socket connections and packet lifecycle events to capture latency, throughput, and connection resets.
- **Metric & Signal Publisher**: Publishes network performance signals to Prometheus and forwards distributed traces to the OpenTelemetry collector.

### [Runner](https://github.com/nudgebee/k8s-agent) - Discovery & In-Cluster Controller
The Runner facilitates workload discovery, coordinates data aggregation from metrics/logs/traces, and communicates securely with the NudgeBee Server:
- Discovers running workloads, pods, and services via Kubernetes API.
- Maintains an outbound-only WebSocket connection to the Relay Server.
- Executes diagnostic runbooks and remediation commands safely inside the cluster.

### [Logs](./connect/logging/) - Read From Your Existing Log Store
The runner queries logs where they already are rather than shipping a second copy. Supported backends are Loki (including Last9, which exposes Loki APIs), Elasticsearch and OpenSearch-compatible services, SigNoz, and Google Cloud Logging.

### [Traces](./connect/tracing/) - Distributed Tracing
The node agent produces spans from eBPF and sends them to the OpenTelemetry collector the chart installs, which writes to the bundled ClickHouse. The runner can also read traces from Jaeger, Chronosphere, Apache Pinot, or Google Cloud Trace via BigQuery instead.

### Metrics
Metrics come from a Prometheus-compatible backend you already run — Prometheus, Thanos, VictoriaMetrics, Grafana Mimir, Chronosphere, Amazon Managed Prometheus, Azure Monitor. The chart does not install one; the quick-install script will add kube-prometheus-stack if the cluster has none.

### Recommendation & Diagnostic Jobs
The runner launches short-lived Jobs for analysis that needs its own tooling:
- **[Trivy](https://github.com/aquasecurity/trivy)**: scans container images for CVEs.
- **[KRR](https://github.com/robusta-dev/krr)**: analyses CPU and memory usage for rightsizing recommendations.
- **[Popeye](https://github.com/derailed/popeye)**: inspects cluster configuration for misconfigurations and anti-patterns.

## Component failure boundaries

Use this table before changing several components at once:

| Symptom | Most likely boundary | What can still work |
|---|---|---|
| Entire collector is disconnected | Runner-to-collector authentication or network path | In-cluster node-agent and forwarder pods may still be running. |
| Live queries fail but telemetry heartbeat is current | Relay connection, request signing, or datasource configuration | Periodic inventory and health telemetry can continue. |
| Workloads appear but no alert-driven events arrive | Alertmanager route and webhook delivery to `/api/alerts` | Prometheus queries and Kubernetes discovery continue. |
| Prometheus is connected but node-agent count is zero | PodMonitor/scrape selection or node-agent target health | Other Prometheus queries can succeed. |
| Kubernetes resource changes stop appearing | Forwarder configuration, RBAC, or runner event intake | Prometheus, logs, and traces queries can continue. |
| Traces disappear | Node-agent trace export, OTel collector, ClickHouse, or external trace provider | Metrics, inventory, alerts, and logs continue. |

See [Agent Health](./operate/agent-health.md) for the reported fields and [Troubleshoot Collector Connectivity](./operate/troubleshoot-agent-connectivity.md) for the runner-to-server path.
