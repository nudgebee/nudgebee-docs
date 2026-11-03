---
sidebar_position: 19
---
# SolarWinds Platform (Orion) Webhook

Receive alerts from a self-hosted **SolarWinds Platform** (formerly Orion — NPM, SAM and the other on-premises modules) directly into NudgeBee. When an Orion alert triggers or resets, NudgeBee creates or resolves the matching event.

For the SaaS product, **SolarWinds Observability**, use the [SolarWinds Webhook](./solarwinds_webhook.md) instead.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Admin** > **Integrations** > **Webhooks** tab.
2. Click the **SolarWinds Platform (Orion) Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Orion Datacenter`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/orion?token=<generated-token>
```

Copy the URL exactly as the integration shows it. The path segment is `orion` — lowercase, no `_webhook` suffix, and nothing may follow it. A URL that does not match the route above is answered by the NudgeBee web app with a 404 and never reaches the alert pipeline.

5. **Copy the webhook URL** — you will configure it in Orion in the next step. The token in it is a credential; treat it like a password.

---

## Step 2: Add the Alert Actions in Orion

Repeat this for each Orion alert you want in NudgeBee. The body is the same for every alert, because every value is an Orion variable.

1. In the SolarWinds Platform web console, navigate to **Alerts & Activity** > **Alerts** > **Manage Alerts**, and edit the alert.
2. On the **Trigger Actions** step, click **Add Action** and choose **Send a GET or POST Request to a Web Server**.
3. Fill in the action:
   - **URL**: paste the NudgeBee webhook URL from Step 1.
   - **Method**: `POST`.
   - **Content type**: `application/json`.
   - **Body**: paste the following:

```json
{
  "status": "firing",
  "alert_def_id": "${N=Alerting;M=AlertDefID}",
  "alert_active_id": "${N=Alerting;M=AlertActiveID}",
  "alert_name": "${N=Alerting;M=AlertName}",
  "object": "${N=SwisEntity;M=Caption}",
  "object_type": "${N=Alerting;M=ObjectType}",
  "object_url": "${N=SwisEntity;M=DetailsUrl}",
  "ip": "${N=SwisEntity;M=IP_Address}",
  "severity": "${N=Alerting;M=Severity}",
  "message": "${N=Alerting;M=AlertMessage}",
  "url": "${N=Alerting;M=AlertDetailsUrl}"
}
```

4. On the **Reset Actions** step, add the same action with the same body, changing only `"status": "firing"` to `"status": "resolved"`. Without it, events stay **Firing**.
5. Save the alert.

:::tip
The **Copy actions to other alerts** option, or **Assign action** in the Action Manager, applies the two actions to many alerts at once.
:::

---

## How It Works

Each request creates or updates **one** event.

### Validation

NudgeBee validates the body before accepting it. An invalid request is rejected with HTTP `400` and the reasons:

```json
{
  "message": "invalid payload",
  "errors": [
    { "index": -1, "field": "alert_def_id", "reason": "is required: ${N=Alerting;M=AlertDefID}" }
  ]
}
```

Required: `status` (`firing` or `resolved`), `alert_def_id`, `alert_name`, and either `object_url` or `object`. `url`, if present, must be `http` or `https`.

A value Orion could not fill in arrives as the literal `${...}` variable. NudgeBee treats it as missing.

### State Mapping

| `status` | NudgeBee Status |
|----------|-----------------|
| `firing` (trigger action) | **Firing** |
| `resolved` (reset action) | **Resolved** |

### Priority Mapping

| Orion severity | NudgeBee Priority |
|----------------|-------------------|
| `Critical`, `Serious` | High |
| `Warning`, or any other value | Medium |
| `Notice` | Low |
| `Informational` | Info |

### Event Fields

| NudgeBee field | Taken from |
|----------------|------------|
| Title | `<alert_name> on <object>` (just `alert_name` when there is no object) |
| Description | `message` |
| Link | `url` |
| Resource | `object` — kind **host** when `object_type` is `Node`, otherwise **other** |

### Labels

| Label | Source |
|-------|--------|
| `source_tool` | always `SolarWinds Platform` |
| `ip` | `ip` |
| `object_type` | `object_type` |
| `orion_object` | `object` |
| `orion_netobject` | the `NetObject` value in `object_url` |
| `orion_alert_def_id` | `alert_def_id` |
| `orion_alert_active_id` | `alert_active_id` |
| `orion_severity` | `severity` |
| `orion_identity` | `caption_fallback` when `object_url` has no `NetObject` |

### Event Deduplication

An alert is identified by its alert definition (`alert_def_id`) plus the object it fired on — the `NetObject` from `object_url`, or the `object` caption when there is none. Each firing is keyed on `alert_active_id`, so the reset closes the event its trigger opened, and a later re-trigger opens a new event linked to the earlier ones.

### Alert Rules

On each trigger, NudgeBee registers the Orion alert as an alert rule on the account with source `orion_webhook`, keyed on `alert_def_id`.

---

## Verify the Integration

1. In the alert's trigger action, click **Simulate** (or **Test**) and pick an object. Orion sends the request with real values.
2. In NudgeBee, navigate to **Troubleshoot** > **All Events** and verify the event appears titled `<alert name> on <object>`.
3. Simulate the reset action and confirm the event changes to **Resolved**.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| HTTP `400` with `"message": "invalid payload"` | The body failed validation. The `errors` list names each `field` and the Orion variable it expects. Check the body matches Step 2 exactly. |
| HTTP `400` with `webhook validation failed` | Verify the `token` query parameter in the URL is correct. Regenerate the integration if needed. |
| Webhook URL returns a 404 HTML page | The path is wrong. The correct path is `/api/webhooks/orion`. Copy the URL directly from the integration. |
| `alert_def_id` or `object_url` rejected as required | Orion could not fill in the variable for this alert's object type. Check the variable in the action's **Insert Variable** picker for that alert. |
| Events never resolve | Add the reset action with `"status": "resolved"` (Step 2, item 4). |
| Events show `orion_identity=caption_fallback` | `object_url` had no `NetObject`, so the alert is keyed on the object's caption. Renaming the object then starts a new alert history. Use `${N=SwisEntity;M=DetailsUrl}` for `object_url`. |
