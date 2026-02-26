---
sidebar_position: 1
---
# Kubernetes

## Overview

NudgeBee provides deep Kubernetes integration that gives you full visibility into your clusters, workloads, and infrastructure. The NudgeBee Agent runs inside your cluster to collect metrics, events, and topology data — enabling intelligent troubleshooting, cost optimization, and automated remediation.

---

## Video Walkthrough

<div style={{position: "relative", paddingBottom: "56.25%", height: 0}}><iframe src="https://www.loom.com/embed/1f9b4652c98c4d5a957ab5a3e8f9f33c?sid=b1378ad1-6e56-43f4-8935-213d197c8f86" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## What You Get

### Resource Visibility
- **Cluster overview** — nodes, namespaces, workloads at a glance
- **Pod-level metrics** — CPU, memory, network, and disk usage
- **Event stream** — Kubernetes events (warnings, errors, scaling events) surfaced in NudgeBee
- **Service map** — visualize dependencies between services

### Intelligent Troubleshooting
- **AI-powered root cause analysis** — correlate K8s events with logs, metrics, and traces
- **Anomaly detection** — automatic detection of resource spikes, CrashLoopBackOff, OOMKills, and other issues
- **Natural language queries** — ask questions like "Why is my pod restarting?" and get AI-driven answers

### Cost Optimization
- **Right-sizing recommendations** — identify over-provisioned or under-provisioned workloads
- **Resource utilization analysis** — track actual vs. requested CPU and memory across namespaces

### Automated Remediation
- **Autopilot runbooks** — define automated responses to common Kubernetes issues
- **Scaling actions** — automated or recommended scaling based on utilization patterns

---

## Supported Versions

- **Kubernetes**: v1.27 or newer
- **Linux Kernel**: 4.2+ (required for eBPF support in the Node Agent)

---

## Getting Started

To set up Kubernetes monitoring, deploy the NudgeBee Agent into your cluster using Helm.

See the full installation guide: **[Agent Installation](/installation/agent/installation/installation.md)**

### Quick Start

```bash
helm repo add nudgebee https://registry.nudgebee.com/chartrepo/nudgebee
helm repo update
helm install nudgebee-agent nudgebee/nudgebee-agent \
  --namespace nudgebee \
  --create-namespace \
  --set apiKey=<YOUR_API_KEY>
```

For detailed configuration options, Helm values, and advanced setups, refer to the [installation guide](/installation/agent/installation/installation.md).

---

## Observability Integrations

The NudgeBee Agent can connect to your existing observability stack to enrich Kubernetes data with logs, metrics, and traces:

- **[Prometheus](/integrations/Observability/prometheus.md)** — pull metrics from your Prometheus instance
- **[Loki](/integrations/Observability/loki.md)** — query logs from Grafana Loki
- **[Elasticsearch](/integrations/Observability/elasticsearch.md)** — search logs from Elasticsearch / ELK Stack
- **[Jaeger](/integrations/Observability/jaeger.md)** — correlate traces from Jaeger

See [Observability Integrations](/integrations/Observability/Observability.md) for the full list of supported platforms.

---

## Related Pages

- [Agent Installation](/installation/agent/installation/installation.md) — deploy the NudgeBee Agent
- [Metrics Configuration](/installation/agent/installation/metrics.md) — configure Prometheus metrics collection
- [Logging Configuration](/installation/agent/installation/logging/logging.md) — set up log collection
- [Helm Values Reference](/installation/agent/installation/helm_values.md) — all available Helm chart values
- [Autopilot](/features/autopilot/autopilot.md) — automated remediation for Kubernetes issues