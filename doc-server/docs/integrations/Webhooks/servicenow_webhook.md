---
sidebar_position: 9
---
# ServiceNow Webhook

Receive ServiceNow incident notifications directly into NudgeBee. When an incident is created or updated in ServiceNow, NudgeBee automatically creates an event enriched with incident details.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **ServiceNow Webhook** card.

![ServiceNow Webhook in Webhooks tab](../../../static/img/servicenow_webhook_card.png)

3. Fill in the configuration:
   - **Account** — select the NudgeBee account to receive events.
   - **Integration Config Name** — a descriptive name for this webhook (e.g., `Production Incidents`).

![ServiceNow Webhook configuration form](../../../static/img/servicenow_webhook_form.png)

4. Click **Save**. NudgeBee generates a unique webhook URL.

5. **Copy the webhook URL** from the dialog. It follows this format:

```
https://<your-nudgebee-domain>/api/webhooks/servicenow?token=<generated-token>
```

![ServiceNow Webhook URL dialog](../../../static/img/servicenow_webhook_url.png)

Keep this URL — you will configure it in ServiceNow in the next step.

---

## Step 2: Configure ServiceNow Outbound REST Message

1. In ServiceNow, navigate to **System Web Services** > **Outbound** > **REST Message**.
2. Click **New** to create a new REST message.
3. Configure the REST message:
   - **Name**: enter a descriptive name (e.g., `NudgeBee Webhook`).
   - **Endpoint**: paste the NudgeBee webhook URL from Step 1.
4. Under **HTTP Methods**, create a new **POST** method:
   - **Name**: `POST`
   - **Endpoint**: paste the same NudgeBee webhook URL.
   - **HTTP Headers**: add `Content-Type: application/json`.
5. Click **Save**.

---

## Step 3: Create a Business Rule to Trigger the Webhook

1. In ServiceNow, navigate to **System Definition** > **Business Rules**.
2. Click **New** to create a new business rule.
3. Configure the business rule:
   - **Name**: enter a descriptive name (e.g., `NudgeBee Incident Webhook`).
   - **Table**: select `Incident [incident]`.
   - **When to run**: select **after** insert and/or update, depending on when you want to notify NudgeBee.
4. Check **Advanced**, and in the **Advanced** tab add a script that calls the REST message created in Step 2 with the incident details as the JSON payload. For example:

   ```javascript
   (function executeRule(current, previous) {
       var r = new sn_ws.RESTMessageV2('NudgeBee Webhook', 'POST');
       r.setRequestBody(JSON.stringify({
           sys_id: current.getValue('sys_id'),
           number: current.getValue('number'),
           short_description: current.getValue('short_description'),
           description: current.getValue('description'),
           incident_state: current.getDisplayValue('incident_state'),
           priority: current.getDisplayValue('priority'),
           urgency: current.getDisplayValue('urgency'),
           impact: current.getDisplayValue('impact'),
           correlation_id: current.getValue('correlation_id'),
           cmdb_ci_display: current.getDisplayValue('cmdb_ci')
       }));
       r.executeAsync();
   })(current, previous);
   ```

   Replace `NudgeBee Webhook` with the name of your REST message. The `number` field tells NudgeBee this is an incident payload; `short_description` becomes the event title. Both raw codes (`3`) and display values (`3 - Moderate`) are accepted.
5. Click **Save**.

> For more details on ServiceNow outbound integrations, see [ServiceNow's REST Message documentation](https://docs.servicenow.com/bundle/latest/page/integrate/outbound-rest/concept/c_OutboundRESTMessage.html).

---

## How It Works

When ServiceNow sends a webhook payload to NudgeBee, the following processing occurs:

### State Mapping

| ServiceNow State | NudgeBee Status |
|------------------|-----------------|
| `New`, `In Progress`, `On Hold` | **Firing** |
| `Resolved` | **Resolved** |
| `Closed`, `Canceled` | **Closed** |

### Priority Mapping

Priority (1-5) is used when the payload has it:

| ServiceNow Priority | NudgeBee Priority |
|---------------------|-------------------|
| 1 - Critical, 2 - High | High |
| 3 - Moderate | Medium |
| 4 - Low, 5 - Planning | Low |

Without a priority, urgency is used, then impact:

| ServiceNow Urgency / Impact | NudgeBee Priority |
|---------------------|-------------------|
| 1 - High | High |
| 2 - Medium | Medium |
| 3 - Low | Low |

If none of these is set, the priority is Medium.

### Event Deduplication

Events are deduplicated using a fingerprint derived from the incident `correlation_id`, or its `sys_id` when there is no correlation ID. Repeated webhook calls for the same incident update the existing event instead of creating duplicates.

---

## Verify the Integration

1. In ServiceNow, create or update a test incident that matches the business rule criteria.
2. In NudgeBee, navigate to **Troubleshoot** > **All Events** and verify the incident appears with:
   - Correct title and priority
   - Incident details evidence attached

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns HTTP `400` with `webhook validation failed` | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing at all | Check that the ServiceNow business rule is active and the REST message endpoint URL is correct. |
| Duplicate events | Expected behavior — NudgeBee deduplicates by `correlation_id`, or `sys_id` when it is empty. State updates (e.g., In Progress → Resolved) update the existing event. |
