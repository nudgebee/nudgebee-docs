---
sidebar_position: 5
---
# ServiceNow Webhook

Receive ServiceNow incident notifications directly into NudgeBee. When an incident is created or updated in ServiceNow, NudgeBee automatically creates or updates the corresponding event.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Integrations** > **Webhooks** tab.
2. Click the **ServiceNow Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `ServiceNow Production`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/servicenow?token=<generated-token>
```

5. **Copy the webhook URL** — you will configure it in ServiceNow in the next step.

---

## Step 2: Configure ServiceNow Business Rule

1. In ServiceNow, navigate to **System Definition** > **Business Rules**.
2. Click **New** to create a new business rule.
3. Configure the rule:
   - **Name**: `NudgeBee Webhook Notification`
   - **Table**: `Incident [incident]`
   - **When**: `after`
   - **Insert**: checked
   - **Update**: checked
4. Under **Advanced**, add the following script:

```javascript
(function executeRule(current, previous) {
    var request = new sn_ws.RESTMessageV2();
    request.setEndpoint('<your-nudgebee-webhook-url>');
    request.setHttpMethod('POST');
    request.setRequestHeader('Content-Type', 'application/json');

    var payload = {
        'sys_id': current.sys_id.toString(),
        'number': current.number.toString(),
        'short_description': current.short_description.toString(),
        'description': current.description.toString(),
        'state': current.state.toString(),
        'priority': current.priority.toString(),
        'urgency': current.urgency.toString(),
        'category': current.category.toString(),
        'caller_id': current.caller_id.getDisplayValue(),
        'assigned_to': current.assigned_to.getDisplayValue(),
        'opened_at': current.opened_at.toString(),
        'resolved_at': current.resolved_at.toString(),
        'closed_at': current.closed_at.toString()
    };

    request.setRequestBody(JSON.stringify(payload));
    request.execute();
})(current, previous);
```

5. Replace `<your-nudgebee-webhook-url>` with the URL copied from Step 1.
6. Click **Submit** to save the business rule.

---

## How It Works

### State Mapping

| ServiceNow State | NudgeBee Status |
|------------------|-----------------|
| `1` (New) | **Firing** |
| `2` (In Progress) | **Acknowledged** |
| `6` (Resolved) | **Resolved** |
| `7` (Closed) | **Resolved** |

### Priority Mapping

| ServiceNow Priority | NudgeBee Priority |
|---------------------|-------------------|
| `1` (Critical) | High |
| `2` (High) | High |
| `3` (Moderate) | Medium |
| `4` (Low) | Low |
| `5` (Planning) | Low |

### Event Deduplication

Events are deduplicated using the ServiceNow incident `sys_id`. Subsequent webhook calls for the same incident update the existing NudgeBee event.

---

## Verify the Integration

1. Create or update an incident in ServiceNow.
2. In NudgeBee, navigate to **Events** and confirm the incident appears with the correct title, status, and priority.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns 401 | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Events not appearing | Check the ServiceNow Business Rule is active and the script has no errors (check **System Log** > **All**). |
| Status not updating | Ensure the Business Rule triggers on updates (`Update` checkbox is checked). |
