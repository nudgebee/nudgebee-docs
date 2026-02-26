---
sidebar_position: 11
---
# Loki

## Overview

NudgeBee integrates with Grafana Loki to query and analyze logs from your existing Loki deployment. Once connected, NudgeBee can use Loki as a log source for troubleshooting, AI-powered analysis, and correlated incident investigation.

---

## Prerequisites

Before configuring the integration, ensure you have:

- A running **Grafana Loki** instance accessible from your NudgeBee deployment
- The NudgeBee **Agent** installed in your Kubernetes cluster (Loki is typically configured via agent Helm values)

---

## How It Works

Loki integration in NudgeBee works through the **NudgeBee Agent**. When the agent is deployed with Loki logging enabled, it connects to your Loki instance for log collection and querying.

There are two setup paths:

1. **Agent-based (recommended)** — configure the Loki endpoint in the agent's Helm values. The agent handles log shipping and query proxying.
2. **Manual configuration** — if Loki is running outside the cluster, configure the connection details in the agent Helm values.

---

## Agent-Based Setup

When you install the NudgeBee Agent with Loki logging enabled, the agent connects to your Loki instance.

See the full Loki logging setup guide: **[Loki Configuration](/installation/agent/installation/logging/loki.md)**

### Quick Setup

In your Helm values, enable Loki as the logging backend:

```yaml
logging:
  provider: loki
  loki:
    url: http://loki-gateway.monitoring.svc.cluster.local
```

---

## Loki Integration Configuration

Navigate to **Settings** > **Integrations** > **Observability** tab and select **Loki** to open the configuration form.

### Configuration Fields

* **Default Log Provider**
    * Check this box to set Loki as the default log source for the linked account. When enabled, NudgeBee will use Loki for all log queries (search, AI analysis, incident context).

---

## Capabilities

Once connected, NudgeBee uses Loki for:

| Capability | Description |
|-----------|-------------|
| **Log Queries** | Search and filter logs using LogQL |
| **Contextual Logs** | View logs in context alongside Kubernetes events and metrics |
| **AI Troubleshooting** | Include log data in AI-powered root cause analysis |
| **Incident Correlation** | Correlate log entries with alerts and events |

---

## Verify the Integration

1. Ensure the NudgeBee Agent is running and connected to Loki (check agent logs for Loki connection messages).
2. Navigate to any Kubernetes workload in NudgeBee.
3. Open the **Logs** tab and verify that log data is available and searchable.

---

## Notes

- Loki is configured primarily through the NudgeBee Agent Helm values. The integration page in Settings controls whether Loki is set as the default log provider.
- NudgeBee supports Loki's LogQL query language for log searching and filtering.
- For Grafana Cloud Loki, configure the Loki URL with your Grafana Cloud endpoint and appropriate authentication.
- If you have multiple Loki instances, you can configure separate integrations for each and link them to different accounts.