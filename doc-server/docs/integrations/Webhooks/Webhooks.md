---
sidebar_position: 1
---
# Webhooks

NudgeBee supports **inbound webhooks** that allow external monitoring and alerting tools to push events directly into NudgeBee. When an alert fires in your external tool, it sends a webhook payload to NudgeBee, which automatically creates an enriched event.

---

## Supported Webhook Integrations

| Integration | Description |
|-------------|-------------|
| [Azure Monitor Webhook](./azure_monitor_webhook.md) | Receive Azure Monitor alert notifications via Action Groups. |
| [Datadog Webhook](./datadog_webhook.md) | Receive Datadog monitor alert notifications. |
| [New Relic Webhook](./newrelic_webhook.md) | Receive New Relic alert notifications enriched with logs, traces, and entity details. |
| [PagerDuty Webhook](./pagerduty_webhook.md) | Receive PagerDuty incident events for triggering NudgeBee troubleshooting. |
| [ServiceNow Webhook](./servicenow_webhook.md) | Receive ServiceNow incident notifications. |

---

## How It Works

1. **Create the webhook integration** in NudgeBee under **Integrations** > **Webhooks**.
2. **Copy the generated webhook URL** and configure it in your external tool.
3. When your external tool fires an alert, it sends a payload to the NudgeBee webhook URL.
4. NudgeBee parses the payload, creates an event, and enriches it with related telemetry data.
