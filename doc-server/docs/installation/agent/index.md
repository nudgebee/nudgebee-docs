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

- **[Installation](./installation/)** — Step-by-step guide to deploy the agent using Helm, including prerequisites and system requirements. Typically takes 5–10 minutes per cluster.
- **[Helm Values](./installation/helm_values.md)** — Complete reference for agent Helm chart configuration values.
- **[Upgrade](./installation/upgrade.md)** — How to upgrade an existing agent to a newer version.
- **[Kubernetes Provider Setup](./installation/k8s-provider/)** — Provider-specific instructions for GKE, AKS, and other managed Kubernetes services.
- **[Logging Integration](./installation/logging/)** — Connect log sources (ELK, Loki, SignalFx, etc.) to the agent.
- **[Tracing Integration](./installation/tracing/)** — Connect tracing backends (ClickHouse, GCP) for distributed tracing.
- **[Proxy Agent](../proxy-agent/)** — Deploy agents through a proxy for restricted or air-gapped environments.
- **[Local Setup](./local-setup.md)** — Run NudgeBee locally for development and testing.
- **[On-Prem Setup](./onprem-setup.md)** — Additional configuration for air-gapped or on-premises environments.

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
            PROM["<b>Metrics Engine (Prometheus / KSM)</b><br/><small>Scrapes workload metrics & ServiceMonitors</small>"]:::collector
            LOGS["<b>Logs Engine</b><br/><small>Loki • OpenObserve • Elasticsearch • Fluentbit</small>"]:::collector
            TRACES["<b>Distributed Tracing (OTel Collector)</b><br/><small>OTLP spans • ClickHouse • Jaeger • Tempo</small>"]:::collector
        end
    end

    subgraph BACKEND["NudgeBee Server Control Plane"]
        RELAY["<b>Relay Server</b> (:8080)<br/><small>wss://relay.nudgebee.com/register</small>"]:::server
        COLLECTOR["<b>Collector Server</b><br/><small>https://collector.nudgebee.com</small>"]:::server
    end

    API_SERVER -->|Watch Events| KUBEWATCH
    KUBEWATCH -->|Forward Events| RUNNER
    NODE_AGENT -->|eBPF Metrics| PROM
    NODE_AGENT -->|OTLP Spans| TRACES

    RUNNER -->|Query Metrics| PROM
    RUNNER -->|Query Logs| LOGS
    RUNNER -->|Query Traces| TRACES

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

### [Logging Integration](./installation/logging/) - Log Stream Collection
Collects and aggregates application, system, and container logs from Loki, OpenObserve, Elasticsearch, CloudWatch, or Fluent Bit for AI-driven root cause analysis and anomaly detection.

### [Tracing Integration](./installation/tracing/) - Distributed Tracing & APM
Leverages the OpenTelemetry Collector and backends (ClickHouse, Jaeger, Tempo, GCP Cloud Trace) to capture distributed transaction traces, map service dependencies, and pinpoint latency bottlenecks.

### Recommendation & Diagnostic Jobs
NudgeBee runs scheduled container jobs for specialized analysis:
- **[Security Vulnerabilities](https://github.com/aquasecurity/trivy)**: Scans container images for CVEs using Trivy.
- **[Workload Rightsizing](https://github.com/robusta-dev/krr)**: Analyzes CPU and memory usage patterns for FinOps recommendations.
- **[Cluster Best Practices](https://github.com/derailed/popeye)**: Inspects Kubernetes configurations for misconfigurations and anti-patterns.
- **[Prometheus](https://github.com/prometheus/prometheus)** (or VictoriaMetrics): Scrapes and indexes real-time workload metrics.