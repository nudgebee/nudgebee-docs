---
sidebar_position: 10
---
# Prometheus

## Overview

NudgeBee integrates with Prometheus to ingest and query metrics from your existing Prometheus deployment. Once connected, NudgeBee can use Prometheus as a metrics source for dashboards, alerting, anomaly detection, and AI-powered troubleshooting.

---

## Prerequisites

Before configuring the integration, ensure you have:

- A running **Prometheus** instance accessible from your NudgeBee deployment
- The NudgeBee **Agent** installed in your Kubernetes cluster (Prometheus is typically auto-discovered by the agent)

---

## How It Works

Prometheus integration in NudgeBee works through the **NudgeBee Agent**. When the agent is deployed in your cluster, it discovers your Prometheus instance and connects to it for metrics collection.

There are two setup paths:

1. **Agent-based (recommended)** — the NudgeBee Agent auto-discovers Prometheus in your cluster. No manual configuration is needed beyond deploying the agent.
2. **Manual configuration** — if Prometheus is running outside the cluster or needs custom settings, configure the connection via Helm values.

---

## Agent-Based Setup

When you install the NudgeBee Agent with Prometheus metrics enabled, the agent automatically connects to Prometheus.

See the full metrics setup guide: **[Metrics Configuration](/installation/agent/installation/metrics.md)**

### Quick Setup

In your Helm values, ensure Prometheus metrics collection is enabled:

```yaml
prometheus:
  enabled: true
```

The agent will discover and connect to Prometheus automatically.

---

## Prometheus Integration Configuration

Navigate to **Settings** > **Integrations** > **Observability** tab and select **Prometheus** to open the configuration form.

### Configuration Fields

* **Default Metrics Provider**
    * Check this box to set Prometheus as the default metrics source for the linked account. When enabled, NudgeBee will use Prometheus for all metrics queries (dashboards, alerts, AI analysis).

---

## Capabilities

Once connected, NudgeBee uses Prometheus for:

| Capability | Description |
|-----------|-------------|
| **Metrics Queries** | Query any Prometheus metric using PromQL |
| **Dashboards** | Visualize Prometheus metrics in NudgeBee dashboards |
| **Anomaly Detection** | Detect anomalies in Prometheus time series data |
| **AI Troubleshooting** | Include Prometheus metrics context in AI-powered root cause analysis |
| **Alerting** | Trigger NudgeBee alerts based on Prometheus metric thresholds |

---

## Verify the Integration

1. Ensure the NudgeBee Agent is running and connected to Prometheus (check agent logs for Prometheus discovery messages).
2. Navigate to any Kubernetes workload in NudgeBee.
3. Verify that metrics (CPU, memory, network) are populated from Prometheus data.

---

## Notes

- Prometheus is typically deployed alongside the NudgeBee Agent and auto-discovered. Manual URL configuration is only needed for non-standard setups.
- If you have multiple Prometheus instances, you can configure separate integrations for each and link them to different accounts.
- For Grafana Cloud Prometheus (Mimir), use the standard Prometheus integration — NudgeBee supports PromQL-compatible endpoints.