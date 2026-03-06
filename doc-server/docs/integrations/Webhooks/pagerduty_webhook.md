---
sidebar_position: 4
---
# PagerDuty Webhook

Receive PagerDuty incident events directly into NudgeBee. When an incident is triggered, acknowledged, or resolved in PagerDuty, NudgeBee automatically creates or updates the corresponding event and triggers troubleshooting workflows.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **PagerDuty Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `PagerDuty Production`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/pagerduty?token=<generated-token>
```

5. **Copy the webhook URL** — you will configure it in PagerDuty in the next step.

---

## Step 2: Configure PagerDuty Webhook Subscription

1. In PagerDuty, go to **Integrations** > **Generic Webhooks (V3)**.
2. Click **New Webhook**.
3. Fill in the webhook details:
   - **Webhook URL**: paste the NudgeBee webhook URL from Step 1.
   - **Scope Type**: select **Account** (to receive all incident events) or **Service** (to filter by service).
   - **Events to Send**: select at minimum:
     - `incident.triggered`
     - `incident.acknowledged`
     - `incident.resolved`
4. Click **Add Webhook**.
5. Use the **Send Test Event** button to verify the connection.

---

## How It Works

### Event Mapping

| PagerDuty Event | NudgeBee Status |
|-----------------|-----------------|
| `incident.triggered` | **Firing** |
| `incident.acknowledged` | **Acknowledged** |
| `incident.resolved` | **Resolved** |

### Event Deduplication

Events are deduplicated using the PagerDuty incident ID. Subsequent webhook calls for the same incident (e.g., acknowledgment, resolution) update the existing NudgeBee event rather than creating duplicates.

---

## Verify the Integration

1. Trigger a test incident in PagerDuty or use the **Send Test Event** button on the webhook subscription.
2. In NudgeBee, navigate to **Events** and confirm the incident appears with the correct title, status, and details.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns 401 | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing | Ensure the PagerDuty webhook subscription is active and the scope matches your services. |
| Status not updating | Confirm that `incident.acknowledged` and `incident.resolved` event types are included in the webhook subscription. |
