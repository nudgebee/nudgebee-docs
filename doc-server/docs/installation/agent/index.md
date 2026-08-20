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
            RUNNER["<b>NudgeBee Runner</b> (Deployment)<br/><small>• Aggregates telemetry<br/>• Executes in-cluster diagnostic & remediation tasks<br/>• Outbound WSS tunnel</small>"]:::runner
            KUBEWATCH["<b>Event Watcher / Kubewatch</b><br/><small>Streams resource changes & pod events</small>"]:::collector
            NODE_AGENT["<b>Node Agent</b> (DaemonSet)<br/><small>eBPF network metrics, latency, packet telemetry</small>"]:::collector
            OPENCOST["<b>OpenCost Subchart</b><br/><small>Real-time pod/node cost allocation</small>"]:::collector
            PROM["<b>Prometheus / KSM</b> (Optional Bundled)<br/><small>Scrapes metrics & ServiceMonitors</small>"]:::collector
        end
    end

    subgraph BACKEND["NudgeBee Server Control Plane"]
        RELAY["<b>Relay Server</b> (:8080)<br/><small>wss://relay.nudgebee.com/register</small>"]:::server
        COLLECTOR["<b>Collector Server</b><br/><small>https://collector.nudgebee.com</small>"]:::server
    end

    API_SERVER -->|Watch Events| KUBEWATCH
    KUBEWATCH -->|Forward Events| RUNNER
    NODE_AGENT -->|eBPF Metrics| PROM
    PROM -->|Query Metrics| RUNNER
    OPENCOST -->|Cost Allocation| RUNNER

    RUNNER -->|Outbound WSS :443| RELAY
    RUNNER -->|HTTPS Telemetry :443| COLLECTOR
```

## Components

### [Event Watcher (Forwarder)](https://github.com/robusta-dev/kubewatch) - Watch for K8s events and Forward to Runner
- Monitors Kubernetes events using the Kubernetes API server.
- Filters and processes events based on predefined criteria.
- Forwards relevant events to the Runner component.

### [Node Agent](https://github.com/nudgebee/node-agent) - Network Metrics Collection using eBPF
The Node Agent is responsible for collecting network metrics on each Kubernetes node using eBPF (Extended Berkeley Packet Filter) and publishing them to Prometheus for further analysis.

- eBPF Probe
  - Attaches eBPF probes to key networking events, such as packet transmissions and receptions.
  - Captures relevant metrics, including latency, throughput, and error rates.

- Metric Publisher
  - Aggregates collected metrics.
  - Publishes metrics to Prometheus for centralized monitoring.
  - Detects Application Errors (Logs and API Errors) and publishes these metrics to Prometheus.

### [Runner](https://github.com/nudgebee/nudgebee-agent) - Discovery and Communication with NudgeBee Server
The Runner component facilitates the discovery of Kubernetes cluster workloads and communicates with the NudgeBee server for workload synchronization.

- Workload Discovery
  - Uses the Kubernetes API to discover running workloads within the cluster.
  - Periodically updates the list of workloads.

- Communication with NudgeBee
  - Establishes a secure connection with the NudgeBee server.
  - Sends information about discovered workloads to the NudgeBee server for further processing.

### [CostModel](https://github.com/opencost/opencost) - Cost Collection
NudgeBee uses OpenCost for calculating cost metrics for Pods/Workloads etc.

### Recommendation Jobs
NudgeBee runs the following container Images on a scheduled basis as K8s Jobs for generating specific recommendations.

[Security Recommendation](https://github.com/aquasecurity/trivy)
NudgeBee Currently uses Trivy for Generating Docker Image Vulnerability related security Recommendations

[Usage Recommendation](https://github.com/robusta-dev/krr)
NudgeBee Currently uses Krr for Generating Usage related Recommendations

[Best Practices Recommendation](https://github.com/derailed/popeye)
NudgeBee Currently uses Popeye for Generating Best Practices related Recommendations

[Prometheus](https://github.com/prometheus/prometheus) (Or [VictoriaMetrics](https://victoriametrics.com/)) - Metrics Collection and alerting