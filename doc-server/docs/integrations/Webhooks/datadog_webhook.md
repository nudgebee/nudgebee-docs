---
sidebar_position: 6
---
# Datadog Webhook

Receive Datadog monitor alert notifications directly into NudgeBee. When a monitor alert fires or recovers, NudgeBee automatically creates or updates the corresponding event.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **Datadog Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Datadog Production Alerts`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/datadog?token=<generated-token>
```

5. **Copy the webhook URL** — you will configure it in Datadog in the next step.

---

## Step 2: Configure the Datadog Webhook Integration

1. In Datadog, navigate to **Integrations** > **Integrations** and search for **Webhooks**.
2. Click the **Webhooks** integration tile and go to the **Configuration** tab.
3. Scroll to **Webhooks** and click **New**.
4. Fill in the webhook details:
   - **Name**: e.g., `nudgebee`
   - **URL**: paste the NudgeBee webhook URL from Step 1.
   - **Payload**: use the default Datadog payload or the custom payload below.
5. Click **Save**.

### Custom Payload (Optional)

For richer event data, use the following custom JSON payload:

```json
{
  "id": "$ID",
  "title": "$EVENT_TITLE",
  "message": "$TEXT_ONLY_MSG",
  "priority": "$PRIORITY",
  "alert_type": "$ALERT_TYPE",
  "alert_transition": "$ALERT_TRANSITION",
  "alert_status": "$ALERT_STATUS",
  "date": "$DATE",
  "org_id": "$ORG_ID",
  "org_name": "$ORG_NAME",
  "monitor_id": "$MONITOR_ID",
  "monitor_name": "$MONITOR_NAME",
  "tags": "$TAGS",
  "hostname": "$HOSTNAME",
  "link": "$LINK",
  "snapshot": "$SNAPSHOT"
}
```

### Attach Webhook to a Monitor

1. In Datadog, open any **Monitor**.
2. Under **Notify your team**, add `@webhook-nudgebee` (using the webhook name from above).
3. Save the monitor.

Alternatively, to send all monitor alerts to NudgeBee, add `@webhook-nudgebee` to a shared notification template.

---

## How It Works

### Alert Type Mapping

| Datadog Alert Type | NudgeBee Status |
|--------------------|-----------------|
| `error`, `warning` | **Firing** |
| `info` | **Firing** |
| `success` (recovery) | **Resolved** |

### Event Deduplication

Events are deduplicated using the Datadog monitor ID and event ID. Recovery notifications update the existing NudgeBee event to **Resolved**.

---

## Verify the Integration

1. Trigger a test alert on a Datadog monitor that includes `@webhook-nudgebee` in its notification.
2. In NudgeBee, navigate to **Events** and confirm the alert appears with the correct title and status.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns 401 | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing | Ensure the monitor notification includes `@webhook-nudgebee` and the webhook integration is saved in Datadog. |
| Recovery not updating event | Confirm the monitor's recovery message also includes `@webhook-nudgebee`. |
