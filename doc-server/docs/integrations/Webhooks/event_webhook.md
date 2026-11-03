---
sidebar_position: 18
---
# Event Webhook

Send alerts into NudgeBee from any tool that can POST JSON — a monitoring tool without a dedicated integration, a script, or a CI job. You shape the request to NudgeBee's documented format, and NudgeBee creates, updates and resolves events from it.

The Event Webhook is not the [Automation Webhook](./automation_webhook.md). The Event Webhook creates **events**; the Automation Webhook triggers a **workflow**.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Admin** > **Integrations** > **Webhooks** tab.
2. Click the **Event Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Site24x7 Alerts`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/event?token=<generated-token>
```

Copy the URL exactly as the integration shows it. The path segment is `event` — lowercase, no `_webhook` suffix, and nothing may follow it. A URL that does not match the route above is answered by the NudgeBee web app with a 404 and never reaches the alert pipeline.

5. **Copy the webhook URL**. The token in it is a credential; treat it like a password. To keep it out of the URL, send it as an `Authorization: Bearer <token>` header instead.

---

## Step 2: Send Alerts

POST a JSON body to the URL with `Content-Type: application/json`. The body is either **one alert**:

```json
{
  "id": "evt-4411",
  "fingerprint": "site24x7:dc01.example.com:cpu",
  "status": "firing",
  "title": "CPU above 85% on dc01",
  "rule_name": "cpu_high",
  "severity": "high",
  "starts_at": "2026-09-29T10:00:00Z",
  "subject": { "name": "dc01.example.com", "type": "host" },
  "source_tool": "Site24x7",
  "labels": { "client": "example-school" }
}
```

or a batch of **up to 100** alerts wrapped in `events`:

```json
{ "events": [ { ... }, { ... } ] }
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Identifies **one occurrence** of the alert. Send the same `id` on the resolve. Max 256 characters. |
| `fingerprint` | Yes | Identifies **the alert across occurrences** — the same on every firing of the same problem. Max 256 characters. |
| `status` | Yes | `firing` or `resolved`. |
| `title` | Yes | Event title. |
| `rule_name` | Yes | Name of the rule or check that raised the alert. Max 256 characters. |
| `severity` | No | `critical`, `high`, `medium`, `low` or `info`. Defaults to `medium`. |
| `description` | No | Event description. |
| `starts_at` / `ends_at` | No | RFC 3339 with a timezone, e.g. `2026-09-29T10:00:00Z`. `ends_at` must not be before `starts_at`. When `starts_at` is omitted, the time NudgeBee receives the alert is used. |
| `subject` | No | The resource the alert is about: `name`, `type` (e.g. `host`, `deployment`), `namespace`. |
| `source_tool` | No | Name of the sending tool. Stored as the `source_tool` label. |
| `url` | No | Link back to the alert in the source tool. Must be `http` or `https`. |
| `labels` | No | Extra key/value labels. Values must be strings. Keys starting with `nb_` are reserved. |

`id`, `fingerprint` and `rule_name` must not contain control characters.

### Example

```bash
curl -X POST 'https://<your-nudgebee-domain>/api/webhooks/event' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"id":"evt-1","fingerprint":"demo:cpu","status":"firing","title":"Demo alert","rule_name":"demo"}'
```

To resolve it, send the same `id`, `fingerprint` and `labels` with `"status": "resolved"`.

---

## How It Works

### Validation

NudgeBee validates the request before accepting it. If **any** alert in the request is invalid, the **whole** request is rejected with HTTP `400` and a list of reasons, so the sender can fix it:

```json
{
  "message": "invalid payload",
  "errors": [
    { "index": 0, "field": "status", "reason": "must be \"firing\" or \"resolved\"" }
  ]
}
```

`index` is the position in `events` (`-1` for an error with the request as a whole).

### State Mapping

| `status` | NudgeBee Status |
|----------|-----------------|
| `firing` | **Firing** |
| `resolved` | **Resolved** |

### Priority Mapping

| `severity` | NudgeBee Priority |
|------------|-------------------|
| `critical`, `high` | High |
| `medium` (default) | Medium |
| `low`, `info` | Low |

### Event Identity

- `id` names one occurrence. A `resolved` alert closes the event with the same `id`.
- `fingerprint` groups occurrences. When an alert fires again after resolving, send a **new** `id` with the **same** `fingerprint`: NudgeBee creates a new event and links it to the earlier ones in the alert's history.

Both are scoped to this integration, so two Event Webhooks can't collide even if they send the same values.

### Resource Detection

If you send `subject.name`, NudgeBee uses it as-is for the event's resource — it does not try to match it to a different workload. If you leave `subject` out, NudgeBee works out the resource from the alert's title, description and labels.

---

## Account Mapping (Advanced)

If you use multiple NudgeBee accounts and want to route alerts to different accounts based on their labels, edit the saved integration and use the **Account Mapping (Optional)** section:

1. Click **+ Add rule**.
2. Under **WHEN**, enter a **Label name** (for example `client`) and its **Label value(s)**. Separate several values with commas to match any of them. Conditions inside one rule must all match.
3. Under **THEN use account**, pick the **Account**.

Rules are checked top to bottom and the first match wins. If no rule matches, the alert goes to the account selected on the form. Because mapping uses labels, a resolve must carry the same `labels` as its firing to reach the same account.

---

## Verify the Integration

1. Send the `curl` example above. Expect HTTP `200`.
2. In NudgeBee, navigate to **Troubleshoot** > **All Events** and verify **Demo alert** appears with **Medium** priority.
3. Send the same body with `"status":"resolved"` and confirm the event changes to **Resolved**.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| HTTP `400` with `"message": "invalid payload"` | The body failed validation. The `errors` list names the alert (`index`), the `field` and the `reason`. Fix those fields and resend. |
| HTTP `400` with `webhook validation failed` | Verify the token — in the `token` query parameter or the `Authorization: Bearer` header — is correct. Regenerate the integration if needed. |
| Webhook URL returns a 404 HTML page | The path is wrong. The correct path is `/api/webhooks/event`. Copy the URL directly from the integration. |
| Resolve doesn't close the event | The resolve must use the same `id` as the firing, and the same `labels` if you use Account Mapping. |
| Every re-fire updates one old event | Send a new `id` for each occurrence; keep only `fingerprint` the same. |
| `labels.<key>` rejected | Label values must be strings (quote numbers and booleans), and keys must not start with `nb_`. |
