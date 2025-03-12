---
sidebar_position: 2
---

# Agent

The Nudgebee agent is a software component that runs within a customer's Kubernetes cluster. It collects data about performance bottlenecks, and security, and sends it back to the Nudgebee server for analysis. This agent needs to be installed in every cluster that needs to be monitored.

## Architecture

The Nudgebee Agent runs within the customer's Kubernetes cluster. The main component is the Runner, which acts as a central controller, collecting data from various components and communicating with the Nudgebee Server over HTTP and Websocket.

![Agent Architecture](/img/nb_agent_architecture.png)

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

### [Runner](https://github.com/nudgebee/nudgebee-agent) - Discovery and Communication with Nudgebee Server
The Runner component facilitates the discovery of Kubernetes cluster workloads and communicates with the Nudgebee server for workload synchronization.

- Workload Discovery
  - Uses the Kubernetes API to discover running workloads within the cluster.
  - Periodically updates the list of workloads.

- Communication with Nudgebee
  - Establishes a secure connection with the Nudgebee server.
  - Sends information about discovered workloads to the Nudgebee server for further processing.

### [CostModel](https://github.com/opencost/opencost) - Cost Collection
Nudgebee uses OpenCost for calculating cost metrics for Pods/Workloads etc.

### Recommendation Jobs
Nudgebee runs the following container Images on a scheduled basis as K8s Jobs for generating specific recommendations.

[Security Recommendation](https://github.com/aquasecurity/trivy)
Nudgebee Currently uses Trivy for Generating Docker Image Vulnerability related security Recommendations

[Usage Recommendation](https://github.com/robusta-dev/krr)
Nudgebee Currently uses Krr for Generating Usage related Recommendations

[Best Practices Recommendation](https://github.com/derailed/popeye)
Nudgebee Currently uses Popeye for Generating Best Practices related Recommendations

[Prometheus](https://github.com/prometheus/prometheus) (Or [VictoriaMetrics](https://victoriametrics.com/)) - Metrics Collection and alerting