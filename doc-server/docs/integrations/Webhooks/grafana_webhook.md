---
sidebar_position: 17
---
# Grafana Webhook

Receive Grafana Alerting notifications directly into NudgeBee. When a Grafana alert fires or resolves, NudgeBee creates or updates the matching event, attaches it to the workload the alert's labels name, and starts troubleshooting.

This page covers sending **alerts** from Grafana. To show Grafana dashboards inside NudgeBee, see [Grafana Integration](../../installation/agent/connect/grafana.md) instead — the two are independent.

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Admin** > **Integrations** > **Webhooks** tab.
2. Click the **Grafana Webhook** card.
3. Fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Grafana Production`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee generates a unique webhook URL in the format:

```
https://<your-nudgebee-domain>/api/webhooks/grafana?token=<generated-token>
```

Copy the URL exactly as the integration shows it. The path segment is `grafana` — lowercase, no `_webhook` suffix, and nothing may follow it. `grafana_webhook` is the integration type NudgeBee stores internally, not a URL you can post to; a URL that does not match the route above is answered by the NudgeBee web app with a 404 and never reaches the alert pipeline.

5. **Copy the webhook URL** — you will configure it in Grafana in the next step. The token in it is a credential; treat it like a password.

You can append your own query parameters to the URL (for example `&env=prod`, or `?env=prod` on a URL without `?token=`). Every event delivered through it is tagged with them in NudgeBee. `token` and `authorization` are reserved and stripped.

---

## Step 2: Configure a Grafana Contact Point

1. In Grafana, navigate to **Alerting** > **Contact points**.
2. Click **+ Add contact point**.
3. Fill in the details:
   - **Name**: e.g., `NudgeBee`.
   - **Integration**: select **Webhook**.
   - **URL**: paste the NudgeBee webhook URL from Step 1.
   - **HTTP Method**: `POST`.
4. Leave **Optional Webhook settings** > **Custom Payload** / **Message** unset. NudgeBee expects Grafana's default webhook body.
5. Make sure **Disable resolved message** is **off**, so NudgeBee is told when an alert clears. Otherwise events stay **Firing**.
6. Click **Save contact point**.
7. Route alerts to it: in **Alerting** > **Notification policies**, set the contact point on the default policy, or add a child policy that matches the alerts you want NudgeBee to receive.

**Recommended — keep the token out of the URL:** use the URL without `?token=` (`https://<your-nudgebee-domain>/api/webhooks/grafana`), and under **Optional Webhook settings** set the **Authorization Header** **Scheme** to `Bearer` and **Credentials** to the token. Grafana can write the webhook URL into its own logs when a delivery fails, but not its headers, so a token in a header stays out of those logs. The URL with `?token=` from Step 1 also works, and existing setups that use it keep delivering. Reopening the integration in NudgeBee shows both the URL and the token to copy.

---

## How It Works

Grafana groups alerts into one notification. NudgeBee splits it and creates **one event per alert** in the `alerts[]` array. An alert without a `fingerprint` is skipped.

### State Mapping

| Grafana `status` | NudgeBee Status |
|------------------|-----------------|
| `firing` | **Firing** |
| `resolved` | **Resolved** |

### Priority Mapping

NudgeBee reads the alert's `severity` label:

| `severity` label | NudgeBee Priority |
|------------------|-------------------|
| `critical`, `high` | High |
| `warning`, `warn`, `medium` | Medium |
| `low`, or any other value | Low |
| `info`, `informational`, `none` | Info |
| `debug` | Debug |

Grafana-managed rules do not add a `severity` label by default. Add one under the rule's **Labels**, or every event gets **Low** priority.

### Event Fields

| NudgeBee field | Taken from |
|----------------|------------|
| Title | `annotations.summary`, falling back to the `alertname` label |
| Description | `annotations.description` |
| Link | `generatorURL`, falling back to `dashboardURL`, then `panelURL` |
| Start / end time | `startsAt` / `endsAt` |
| Tags | the `grafana_folder`, `namespace` and `cluster` labels |

### Labels

Every label on the alert becomes a label on the NudgeBee event under the same name. `generatorURL`, `dashboardURL`, `panelURL` and `silenceURL` are added as labels when Grafana sends them.

Annotations are not turned into labels. `commonLabels` and `groupLabels` are **not** read — a label must be on the alert itself.

### Resource Detection

NudgeBee picks the workload from the first of these labels that is set: `pod`, `deployment`, `statefulset`, `daemonset`, `replicaset`, `job`, `cronjob`. The namespace comes from the `namespace` label.

Add these labels to your Grafana rules — for example by keeping `namespace` and `pod` in the query's `by (...)` clause — so events land on the right workload.

### Event Deduplication

Events are deduplicated on the alert `fingerprint` together with its `startsAt`. Repeat notifications for the same firing update the existing event; a resolved notification marks it **Resolved**. If the same alert fires again later, it gets a new `startsAt` and therefore a new event.

### Alert Rules

Each `alertname` NudgeBee sees is registered as an alert rule on the account with source `grafana_webhook`, so you can tune or attach actions to it from the alert rules screen.

---

## Account Mapping (Advanced)

If you use multiple NudgeBee accounts and want to route alerts to different accounts based on their labels, edit the saved integration and use the **Account Mapping (Optional)** section:

1. Click **+ Add rule**.
2. Under **WHEN**, enter a **Label name** (for example `cluster`) and its **Label value(s)** (for example `prod-us-east-1`). Separate several values with commas to match any of them. Conditions inside one rule must all match.
3. Under **THEN use account**, pick the **Account**.

Rules are checked top to bottom and the first match wins. If no rule matches, the alert goes to the account selected on the form.

---

## Verify the Integration

1. In Grafana, open the NudgeBee contact point and click **Test**. Grafana sends a `TestAlert` with a fingerprint, so it appears in NudgeBee.
2. In NudgeBee, navigate to **Troubleshoot** > **All Events** and verify the test alert appears.
3. For a real check, temporarily lower a rule's threshold so it fires, and confirm the event appears with the right title, priority and workload, then changes to **Resolved** once the rule clears.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns HTTP `400` with `webhook validation failed` | Verify the token — in the `token` query parameter or the `Authorization: Bearer` header — is correct. Regenerate the integration if needed. |
| Webhook URL returns a 404 HTML page | The path is wrong, so the request is reaching the NudgeBee web app instead of the alert pipeline. The correct path is `/api/webhooks/grafana`. Check that the URL uses `https`, is lowercase, and has no `_webhook` suffix. Copy the URL directly from the integration. |
| Events not appearing | Check that a notification policy routes the alert to the NudgeBee contact point, and that **Custom Payload** is unset — a custom body without an `alerts[]` array is rejected. Check that Grafana can reach your NudgeBee domain over HTTPS. |
| Events never resolve | Turn off **Disable resolved message** on the contact point. |
| Every event has **Low** priority | Add a `severity` label (`critical`, `warning`, `info`, …) to your Grafana alert rules. |
| Events not attached to a workload | The alert has none of the labels listed under [Resource Detection](#resource-detection). Keep `namespace` and a workload label in the rule's query result. |
