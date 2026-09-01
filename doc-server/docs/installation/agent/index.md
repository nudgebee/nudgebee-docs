---
sidebar_position: 1
sidebar_label: K8s Agent
---

# K8s Agent

The NudgeBee Agent is a lightweight software component that runs inside your Kubernetes cluster. It collects data about workloads, performance, cost, and security, and sends it to the NudgeBee server — feeding the [Semantic Knowledge Graph](../../features/knowledge-graph.md) that powers NudgeBee's Cloud-Ops Intelligence. You need to install an agent in every cluster that you want NudgeBee to monitor. The agent supports AWS, Azure, GCP, and on-premises Kubernetes environments.

:::info
**Both Cloud SaaS and self-hosted users** need to install the agent. This is how NudgeBee gets visibility into your Kubernetes clusters, regardless of your deployment model.
:::

:::tip
If you connected a cloud account (AWS, Azure, or GCP), NudgeBee can auto-discover your Kubernetes clusters. You may still need to install the agent for deep monitoring, but cluster discovery happens automatically.
:::

### What You Will Find in This Section

**Install** — getting the agent running, 5–10 minutes per cluster.

- **[Install the agent](./installation/)** — prerequisites, Helm install, and how to verify it connected.
- **[Kubernetes providers](./installation/k8s-provider/)** — extra steps for GKE and AKS.
- **[Upgrade](./installation/upgrade.md)** — moving an existing agent to a newer version.

**Connect data sources** — what the agent reads once it is running.

- **[Alert forwarding](./connect/alertmanager.md)** — point your Alertmanager at the agent. Without this NudgeBee never sees an alert.
- **[Metrics](./connect/metrics.md)** — Prometheus, Thanos, VictoriaMetrics, Chronosphere, and other backends.
- **[Why is Prometheus Disconnected?](./connect/prometheus-troubleshooting.md)** — 10-step decision tree for debugging metrics connectivity and authentication.
- **[Logs](./connect/logging/)** — Loki, Elasticsearch, SigNoz, Last9.
- **[Traces](./connect/tracing/)** — the bundled OTel collector and ClickHouse, or Google Cloud Trace.
- **[Grafana](./connect/grafana.md)** and **[multi-tenant Prometheus](./connect/multi_tenant_metrics.md)**.

**Operate & Troubleshoot** — tuning, health monitoring, and diagnostics for a running agent.

- **[Troubleshoot Agent Connectivity](./operate/troubleshoot-agent-connectivity.md)** — diagnose disconnected agents, heartbeat staleness (60s tick / 3m timeout), flapping, and safe log bundles.
- **[Agent Health & Subsystem Probes](./operate/agent-health.md)** — field-by-field reference for Relay, Prometheus, Logs, Traces, OpenCost, and Node Agent probes.
- **[Helm values](./operate/helm_values.md)** — every value you are likely to set, including access modes and sizing.
- **[Node agent configuration](./operate/node-agent-configs.md)** — eBPF collector tuning.
- **[Cluster autoscaler](./operate/cluster-autoscaler/)** — Karpenter support.

**Other environments**

- **[Proxy Agent](../proxy-agent/)** — deploy through a proxy for restricted or air-gapped networks.
- **[Local setup](./local-setup.md)** — run against a local KinD cluster.
- **[On-prem setup](./onprem-setup.md)** — values for a self-hosted server.

## Architecture

The NudgeBee Agent runs within your Kubernetes cluster. The main component is the Runner, which acts as a central controller — it coordinates data collection from cluster components and maintains a secure, outbound-only WebSocket connection to the NudgeBee Server.

```mermaid
flowchart TB
    classDef runner fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af,rx:6,ry:6;
    classDef collector fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#14532d,rx:6,ry:6;
    classDef k8s fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#92400e,rx:6,ry:6;
    classDef server fill:#f5f3ff,stroke:#8b5cf6,stroke-width:2px,color:#5b21b6,rx:6,ry:6;

    subgraph MONITORED["Monitored Kubernetes Cluster"]
        API_SERVER["<b>Kubernetes API Server</b><br/><small>Cluster state, Pods, Deployments</small>"]:::k8s

        subgraph AGENT["NudgeBee Agent Namespace (nudgebee-agent)"]
            RUNNER["<b>NudgeBee Runner</b> (Deployment)<br/><small>• Aggregates telemetry signals<br/>• Executes in-cluster diagnostic & remediation tasks<br/>• Outbound WSS tunnel</small>"]:::runner
            KUBEWATCH["<b>Event Watcher (Kubewatch)</b><br/><small>Streams resource changes & pod events</small>"]:::collector
            NODE_AGENT["<b>Node Agent</b> (DaemonSet)<br/><small>eBPF network metrics, latency & packet telemetry</small>"]:::collector
            OTEL["<b>OTel Collector + ClickHouse</b><br/><small>Installed by the chart, stores eBPF spans</small>"]:::collector
        end

        PROM["<b>Prometheus / VictoriaMetrics</b><br/><small>Yours, not installed by the agent</small>"]:::k8s
        AM["<b>Alertmanager</b><br/><small>Yours — needs a receiver pointing at the agent</small>"]:::k8s
        LOGS["<b>Log store</b><br/><small>Loki • Elasticsearch • SigNoz</small>"]:::k8s
    end

    subgraph BACKEND["NudgeBee Server Control Plane"]
        RELAY["<b>Relay Server</b> (:8080)<br/><small>wss://relay.nudgebee.com/register</small>"]:::server
        COLLECTOR["<b>Collector Server</b><br/><small>https://collector.nudgebee.com</small>"]:::server
    end

    API_SERVER -->|Watch Events| KUBEWATCH
    KUBEWATCH -->|Forward Events| RUNNER
    NODE_AGENT -->|Scraped by| PROM
    NODE_AGENT -->|OTLP Spans| OTEL
    AM -->|"POST /api/alerts"| RUNNER

    RUNNER -->|Query Metrics| PROM
    RUNNER -->|Query Logs| LOGS
    RUNNER -->|Query Traces| OTEL

    RUNNER -->|"Outbound WSS :443"| RELAY
    RUNNER -->|"HTTPS Telemetry :443"| COLLECTOR
```

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