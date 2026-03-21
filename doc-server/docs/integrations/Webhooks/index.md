---
sidebar_position: 1
---
# Webhooks

NudgeBee supports **inbound webhooks** that allow external monitoring and alerting tools to push events directly into NudgeBee. When an alert fires, NudgeBee automatically creates an enriched event.

---

## Supported Webhook Integrations

| Integration | Description |
|-------------|-------------|
| [Datadog Webhook](./datadog_webhook.md) | Receive Datadog monitor alert notifications enriched with related telemetry data. |
| [New Relic Webhook](./newrelic_webhook.md) | Receive New Relic alert notifications enriched with logs, traces, and entity details. |
| [PagerDuty Webhook](./pagerduty_webhook.md) | Receive PagerDuty incident notifications and trigger NudgeBee troubleshooting workflows. |
| [ServiceNow Webhook](./servicenow_webhook.md) | Receive ServiceNow incident notifications into NudgeBee. |
| [GCP Cloud Monitoring Webhook](./gcp_monitoring_webhook.md) | Receive GCP Cloud Monitoring alert notifications with metric details and resource context. |

---

## How It Works

1. **Create the webhook integration** in NudgeBee under **Integrations** > **Webhooks**.
2. **Copy the generated webhook URL** and configure it in your external tool.
3. When your external tool fires an alert, it sends a payload to the NudgeBee webhook URL.
4. NudgeBee parses the payload, creates an event, and enriches it with related telemetry data.
