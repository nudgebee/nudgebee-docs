---
sidebar_position: 4
---
# PagerDuty Webhook

Receive PagerDuty incident notifications directly into NudgeBee. When an incident is triggered or resolved in PagerDuty, NudgeBee automatically creates or updates the corresponding event and triggers troubleshooting workflows.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **PagerDuty Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `PagerDuty Production`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/pagerduty_webhook?token=<generated-token>
```

5. **Copy the webhook URL** — you will configure it in PagerDuty in the next step.

---

## Step 2: Configure PagerDuty Webhook Subscription

1. In PagerDuty, navigate to **Integrations** > **Generic Webhooks (V3)**.
2. Click **New Webhook**.
3. Fill in the webhook details:
   - **Webhook URL**: paste the NudgeBee webhook URL from Step 1.
   - **Scope Type**: select **Account** (to receive all incident events) or **Service** (to filter by specific services).
   - **Events to Send**: select the following event types:
     - `incident.triggered`
     - `incident.resolved`
4. Click **Add Webhook**.
5. Use the **Send Test Event** button to verify the connection.

:::note
NudgeBee only processes `incident.triggered` and `incident.resolved` events. Other event types (e.g., `incident.acknowledged`, `incident.annotated`) are silently ignored.
:::

---

## How It Works

When PagerDuty sends a webhook payload to NudgeBee, the following processing occurs:

### State Mapping

| PagerDuty Event Type | NudgeBee Status |
|----------------------|-----------------|
| `incident.triggered` | **Firing** |
| `incident.resolved` | **Resolved** |

### Priority Mapping

NudgeBee reads the incident `priority` field first, falling back to `urgency` if priority is not set:

| PagerDuty Priority / Urgency | NudgeBee Priority |
|------------------------------|-------------------|
| `P1`, `critical`, `high` | High |
| `P2`, `P3`, `medium` | Medium |
| `P4`, `P5`, `low` | Low |

### Automatic Enrichment

If a [PagerDuty ticket integration](../Tickets/pagerduty.md) is also configured for the same account, NudgeBee automatically enriches each alert event with:

1. **Incident Details** — title, description, service name, escalation policy, and assignments fetched from the PagerDuty API.
2. **Alert Labels** — custom fields and CEF payload labels extracted from the incident body (supports Alertmanager, Grafana, SigNoz, Chronosphere, and Last9 alert sources).
3. **Dedup Key** — extracted from the alert body for accurate event fingerprinting.

### Event Deduplication

Events are deduplicated using the PagerDuty webhook event ID (`event.id`). If PagerDuty sends a resolution webhook for the same incident, the existing NudgeBee event is updated to **Resolved** instead of creating a duplicate.

---

## Account Mapping (Advanced)

If you use multiple NudgeBee accounts and want to route PagerDuty incidents to different accounts based on alert labels, configure the **Account Mapping** field as a JSON object:

```json
{
  "labelName": "env",
  "production": "<nudgebee-account-id-1>",
  "staging": "<nudgebee-account-id-2>"
}
```

In this example, incidents with the label `env=production` are routed to account 1, and `env=staging` to account 2. The `labelName` field defaults to `env` if not specified.

---

## Verify the Integration

1. In PagerDuty, use the **Send Test Event** button on the webhook subscription, or trigger a real incident on a monitored service.
2. In NudgeBee, navigate to **Events** and verify the incident appears with:
   - Correct title and priority
   - Incident details evidence attached
   - Service name and labels populated (if PagerDuty ticket integration is configured)

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns 401 | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing | Ensure the PagerDuty webhook subscription is active and includes `incident.triggered` in the event types. |
| Enrichment labels missing | Ensure a [PagerDuty ticket integration](../Tickets/pagerduty.md) is configured for the same NudgeBee account — this is required for API-based enrichment. |
| Acknowledged events not updating | Expected behavior — NudgeBee only processes `triggered` and `resolved` events. Acknowledgements do not update the NudgeBee event status. |
