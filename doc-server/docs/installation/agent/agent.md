---
sidebar_position: 2
---

# Agent

## Architecture

Nugdebee Agent runs on customer Kuberetes cluster. Main component is Runner which works as central controller which collects data from different components and communicates with Nudgebee Server over HTTP and Websocket

![Agent Architecture](/img/nb_agent_architecture.png)

## Components

### [Event Watcher](https://github.com/robusta-dev/kubewatch)​ - Watch for K8s events and Forward to Runner​
- Monitors Kubernetes events using the Kubernetes API server.
- Filters and processes events based on predefined criteria.
- Forwards relevant events to the Runner component.

### [Node Agent](https://github.com/nudgebee/node-agent) - Network Metrics Collection using eBPF
The Node Agent is responsible for collecting network metrics on each Kubernetes node using eBPF (Extended Berkeley Packet Filter) and publishing them to Prometheus for further analysis.

*eBPF Probe​*
- Attaches eBPF probes to key networking events, such as packet transmissions and receptions.
- Captures relevant metrics, including latency, throughput, and error rates.

*Metric Publisher​*
- Aggregates collected metrics.
- Publishes metrics to Prometheus for centralised monitoring.
- Checks for Application Errors(Logs/Apis) and publishes to prometheus

### [Runner](https://github.com/nudgebee/nudgebee-agent) - Discovery and Communication with Nudgebee Server​
The Runner component facilitates the discovery of Kubernetes cluster workloads and communicates with the Nudgebee server for workload synchronisation.

Workload Discovery​
- Utilises Kubernetes API to discover running workloads within the cluster.
- Periodically updates the list of workloads.

Communication with Nudgebee​
- Establishes a secure connection with the Nudgebee server.
- Sends information about discovered workloads to the Nudgebee server for further processing.

### [CostModel](https://github.com/opencost/opencost) - Cost Collection
Nudgebee Currently uses OpenCost for calculating cost metrics for Pods/Workloads etc.

### Recommendation Jobs
Nudgebee runs the following container Images on a scheduled basis as K8s Jobs for generating specific recommendations.

[Security Recommendation](https://github.com/aquasecurity/trivy)
Nudgebee Currently uses Trivy for Generating Docker Image Vulnerability related security Recommendations

[Usage Recommendation](https://github.com/robusta-dev/krr)
Nudgebee Currently uses Krr for Generating Usage related recommendation

[Best Practices Recommendation](https://github.com/derailed/popeye)
Nudgebee Currently uses Popeye for generating Best Practices related recommendation

[Prometheus](https://github.com/prometheus/prometheus) (Or [VictoriaMetrics](https://victoriametrics.com/)) - Metrics Collection and alerting
