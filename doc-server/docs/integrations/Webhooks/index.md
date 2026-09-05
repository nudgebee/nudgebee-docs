---
sidebar_position: 1
---
# Webhooks

NudgeBee supports **inbound webhooks** that allow external monitoring, alerting and automation tools to push events directly into NudgeBee. When an alert fires, NudgeBee automatically creates an enriched event.

---

## Supported Webhook Integrations

Create any of these from **Admin** > **Integrations** > **Webhooks**.

### Documented

| Integration | Description |
|-------------|-------------|
| [Datadog Webhook](./datadog_webhook.md) | Receive Datadog monitor alert notifications enriched with related telemetry data. |
| [Dynatrace Webhook](./dynatrace_webhook.md) | Receive Dynatrace problem notifications enriched with related logs and traces. |
| [New Relic Webhook](./newrelic_webhook.md) | Receive New Relic alert notifications enriched with logs, traces, and entity details. |
| [SolarWinds Webhook](./solarwinds_webhook.md) | Receive SolarWinds alert notifications into NudgeBee. |
| [PagerDuty Webhook](./pagerduty_webhook.md) | Receive PagerDuty incident notifications and trigger NudgeBee troubleshooting workflows. |
| [ServiceNow Webhook](./servicenow_webhook.md) | Receive ServiceNow incident notifications into NudgeBee. |
| [GCP Cloud Monitoring Webhook](./gcp_monitoring_webhook.md) | Receive GCP Cloud Monitoring alert notifications with metric details and resource context. |

### Also Available

These webhook types exist in the product and are configured the same way. Dedicated setup guides are not published yet — the configuration form documents each field inline.

| Integration | Description |
|-------------|-------------|
| Prometheus Alertmanager Webhook | Receive alerts forwarded from Alertmanager. See [Alert forwarding](../../installation/agent/connect/alertmanager.md) for the Alertmanager-side configuration. |
| Azure Monitor Webhook | Receive Azure Monitor alert notifications with resource and metric context. |
| Grafana Webhook | Receive Grafana alerting notifications. See [Connect Grafana](../../installation/agent/connect/grafana.md) for the Grafana-side setup. |
| Zenduty Webhook | Receive Zenduty incident notifications into NudgeBee. |
| Elasticsearch Webhook | Receive alerts raised by Elasticsearch/Kibana watchers and rules. |
| Automation Webhook | Trigger a NudgeBee [workflow](../../features/workflow-builder/) from any external system that can send an HTTP POST. See [workflow triggers](../../features/workflow-builder/triggers.md). |
| OpenObserve Webhook | Receive OpenObserve alert notifications into NudgeBee. |
| Splunk Webhook | Receive Splunk alert notifications into NudgeBee. |

---

## How It Works

1. **Create the webhook integration** in NudgeBee under **Admin** > **Integrations** > **Webhooks**.
2. **Copy the generated webhook URL** and configure it in your external tool.
3. When your external tool fires an alert, it sends a payload to the NudgeBee webhook URL.
4. NudgeBee parses the payload, creates an event, and enriches it with related telemetry data.
