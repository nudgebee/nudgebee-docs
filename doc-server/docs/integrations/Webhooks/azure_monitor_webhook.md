---
sidebar_position: 2
---
# Azure Monitor Webhook

Receive Azure Monitor alert notifications directly into NudgeBee via Action Groups. When an alert fires, NudgeBee automatically creates an event enriched with the alert details.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **Azure Monitor Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Azure Production Alerts`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/azuremonitor?token=<generated-token>
```

5. **Copy the webhook URL** — you will configure it in Azure in the next step.

---

## Step 2: Configure Azure Monitor Action Group

1. In the [Azure Portal](https://portal.azure.com), navigate to **Monitor** > **Alerts** > **Action groups**.
2. Click **Create** to create a new action group (or edit an existing one).
3. Fill in the **Basics** tab:
   - **Resource group**: select the appropriate resource group.
   - **Action group name**: e.g., `NudgeBee Alerts`.
   - **Display name**: e.g., `NudgeBee`.
4. Go to the **Actions** tab and click **Add action**:
   - **Action type**: select **Webhook**.
   - **Name**: e.g., `NudgeBee Webhook`.
   - **URI**: paste the NudgeBee webhook URL from Step 1.
   - **Enable the common alert schema**: set to **Yes** (recommended).
5. Click **OK** and then **Review + create** to save the action group.

### Attach the Action Group to an Alert Rule

1. Navigate to **Monitor** > **Alerts** > **Alert rules**.
2. Open an existing alert rule or create a new one.
3. Under **Actions**, click **Select action groups** and add the action group created above.
4. Save the alert rule.

---

## How It Works

### State Mapping (Common Alert Schema)

| Azure Monitor Signal | NudgeBee Status |
|----------------------|-----------------|
| `Fired` | **Firing** |
| `Resolved` | **Resolved** |

### Supported Alert Types

NudgeBee processes alerts from Azure Monitor using the [Common Alert Schema](https://learn.microsoft.com/en-us/azure/azure-monitor/alerts/alerts-common-schema), which covers:

- **Metric alerts** — threshold breaches on Azure metrics.
- **Log alerts** — query-based alerts on Log Analytics.
- **Activity log alerts** — Azure resource health and service health events.
- **Smart detection alerts** — Application Insights anomaly detection.

### Event Deduplication

Events are deduplicated using the alert rule ID and firing time. If Azure Monitor sends a resolution notification, the existing NudgeBee event is updated to **Resolved**.

---

## Verify the Integration

1. Trigger a test alert in Azure Monitor using the **Test action group** feature on the action group page.
2. In NudgeBee, navigate to **Events** and confirm the alert appears with the correct title, status, and details.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns 401 | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing | Ensure the Action Group is attached to an active alert rule and the common alert schema is enabled. |
| Test event not received | Check that the NudgeBee webhook URL is accessible from Azure (no firewall blocking outbound requests). |
