---
sidebar_position: 16
---
# Prometheus Alertmanager Webhook

Receive alerts from any Prometheus Alertmanager directly into NudgeBee. When an alert fires or resolves, NudgeBee creates or updates the matching event, attaches it to the workload the alert's labels name, and starts troubleshooting.

Use this webhook when Alertmanager runs **outside** the cluster the NudgeBee agent watches — a central Alertmanager for many clusters, Grafana Cloud, Chronosphere, or any hosted Alertmanager. If Alertmanager runs in the same cluster as the agent, point it at the agent instead; see [Alert forwarding](../../installation/agent/connect/alertmanager.md).

---

## Step 1: Create the Webhook in NudgeBee

1. Navigate to **Admin** > **Integrations** > **Webhooks** tab.
2. Click the **Prometheus AlertManager Webhook** card.
3. Click **Add Prometheus Alertmanager Webhook Account** and fill in the configuration:
   - **Integration Config Name** — a descriptive name (e.g., `Alertmanager Production`).
   - **Account** — select the NudgeBee account to receive events.
4. Click **Save**. NudgeBee shows the webhook URL and a ready-to-paste Alertmanager config. The URL has this format:

```
https://<your-nudgebee-domain>/api/webhooks/prometheus-alertmanager?token=<generated-token>
```

Copy the URL exactly as the integration shows it. The path segment is `prometheus-alertmanager` — lowercase, with a hyphen, no `_webhook` suffix. `prometheus_alertmanager_webhook` is the integration type NudgeBee stores internally, not a URL you can post to; a URL that does not match the route above is answered by the NudgeBee web app with a 404 and never reaches the alert pipeline.

5. **Copy the Alertmanager config** — you will add it to Alertmanager in the next step. The token in it is a credential; treat it like a password. To see the URL and config again later, open the integration from the **Webhooks** tab.

### Optional: tag events with query parameters

You can append your own query parameters to the URL. Every event delivered through it is tagged with them in NudgeBee. This is worth doing when more than one Alertmanager posts to the same webhook, since an Alertmanager payload carries no deployment context of its own:

```
.../api/webhooks/prometheus-alertmanager?env=prod&cluster=us-east-1
```

Start with `?` when the URL has no query string (as in the recommended config below), and with `&` when it already has one (`...?token=<token>&env=prod`). `token` and `authorization` are reserved and stripped. If the alert already carries a label with the same name, the alert's label wins.

---

## Step 2: Configure Alertmanager

Add a receiver that posts to NudgeBee **and** a route that sends alerts to it. A receiver that no route points at receives nothing.

The recommended config sends the token in the `Authorization` header. Alertmanager writes the full webhook URL into its log every time a delivery fails, but never the `http_config.authorization` credentials, so the token stays out of your logs:

```yaml
route:
  # Your existing root route stays as it is: keep its receiver, group_by and
  # other settings, and add this as the FIRST entry under its routes.
  routes:
    - receiver: nudgebee
      continue: true

receivers:
  # ...your existing receivers...
  - name: nudgebee
    webhook_configs:
      - url: 'https://<your-nudgebee-domain>/api/webhooks/prometheus-alertmanager'
        send_resolved: true
        http_config:
          authorization:
            type: Bearer
            credentials: '<token>'
```

- **`routes` with no matchers** sends every alert to NudgeBee. Add `matchers` (for example `- severity=~"critical|warning"`) to send only some.
- **`continue: true`** lets Alertmanager keep matching the routes after this one, so your existing receivers still get every alert. Put this route first: a route above it without `continue: true` stops matching before it is reached.
- **Do not replace the root `route`** with `receiver: nudgebee` unless NudgeBee is your only receiver. The root route is the default for every alert, and replacing it stops delivery to your other receivers.
- **`send_resolved: true`** is required for NudgeBee to close events when the alert clears. Without it, events stay **Firing**.
- Alertmanager versions too old to support `http_config.authorization` take `bearer_token: '<token>'` directly under `http_config` instead.

If the sender cannot set headers, the token can go in the URL instead. Existing receivers set up this way keep working, but the token then appears in Alertmanager's log whenever a delivery fails:

```yaml
receivers:
  - name: nudgebee
    webhook_configs:
      - url: 'https://<your-nudgebee-domain>/api/webhooks/prometheus-alertmanager?token=<token>'
        send_resolved: true
```

Reload Alertmanager (`POST /-/reload` or restart it) after editing the config. Run `amtool check-config alertmanager.yml` first to catch YAML mistakes. For kube-prometheus-stack, the Prometheus Operator, and VMAlertmanager, see [Alert forwarding](../../installation/agent/connect/alertmanager.md) for where this config lives.

:::tip
If one Alertmanager serves several clusters, add a route per cluster matching on the external label your Prometheus sets (for example `cluster`), and give each route its own receiver whose URL ends in a different `?cluster=<name>` so NudgeBee can tell the events apart.
:::

---

## How It Works

Alertmanager groups alerts into one notification. NudgeBee splits it and creates **one event per alert** in the `alerts[]` array.

### State Mapping

| Alertmanager `status` | NudgeBee Status |
|-----------------------|-----------------|
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

An alert with no `severity` label gets **Low** priority.

### Event Fields

| NudgeBee field | Taken from |
|----------------|------------|
| Title | `annotations.summary`, falling back to the `alertname` label |
| Description | `annotations.description` |
| Link | `generatorURL` |
| Start / end time | `startsAt` / `endsAt` |
| Tags | the `cluster`, `namespace`, `service` and `job` labels |

### Labels

Every label on the alert becomes a label on the NudgeBee event under the same name. In addition:

- `externalURL` — the Alertmanager's `externalURL`.
- `generatorURL` — the alert's `generatorURL`.
- `runbook_url` — copied from the annotation, so the runbook link shows on the event.

Annotations other than `runbook_url` are not turned into labels. `commonLabels` and `groupLabels` are **not** read — a label must be on the alert itself.

An alert with no `generatorURL` — one posted straight to the Alertmanager API rather than produced by a rule, such as a delivery test — is labelled `nb_alert_origin=posted_without_rule_evaluation` so investigations don't treat it as a real outage.

### Resource Detection

NudgeBee picks the resource the alert is about from its labels, in this order:

1. Kubernetes controllers — `deployment`, `statefulset`, `daemonset`, `replicaset`, `cronjob`, `kube_job` (and the OpenTelemetry `k8s.*.name` equivalents)
2. Service-mesh workloads — `destination_workload_name`, `workload`, `source_workload_name`
3. NudgeBee's own `app_id` label (`/k8s/<namespace>/<workload>`)
4. `persistentvolumeclaim`, `horizontalpodautoscaler` / `hpa`, `job_name`
5. `service` / `service.name`
6. `pod` / `k8s.pod.name`
7. For PostgreSQL exporter alerts with `datname`: the database host (`server`, `instance`, `host`, `hostname`), else the database name
8. `instance`

The namespace comes from `namespace`, falling back to `destination_workload_namespace`, `workload_namespace`, `source_workload_namespace`, `kubernetes_namespace`, or `k8s.namespace.name`.

The `job` label is **not** treated as a Kubernetes Job — in Prometheus it is the scrape job. Use `kube_job` or `job_name` for that.

### Event Deduplication

Events are deduplicated on the alert `fingerprint` together with its `startsAt`. Repeat notifications for the same firing update the existing event; a resolved notification marks it **Resolved**. If the same alert fires again later, it gets a new `startsAt` and therefore a new event.

### Alert Rules

The first time NudgeBee sees an `alertname`, it registers it as an alert rule on the account with source `prometheus_alertmanager_webhook`, so you can tune or attach actions to it from the alert rules screen.

---

## Account Mapping (Advanced)

If you use multiple NudgeBee accounts and want to route alerts to different accounts based on their labels, edit the saved integration and use the **Account Mapping (Optional)** section:

1. Click **+ Add rule**.
2. Under **WHEN**, enter a **Label name** (for example `cluster`) and its **Label value(s)** (for example `prod-us-east-1`). Separate several values with commas to match any of them. Conditions inside one rule must all match.
3. Under **THEN use account**, pick the **Account**.

Rules are checked top to bottom and the first match wins. If no rule matches, the alert goes to the account selected on the form.

---

## Verify the Integration

1. Fire a test alert through Alertmanager with `amtool`, including a `generatorURL` so it is not flagged as a delivery test:

```bash
amtool alert add NudgeBeeWebhookTest severity=warning namespace=default \
  --annotation=summary="NudgeBee webhook test" \
  --generator-url="http://prometheus/graph" \
  --alertmanager.url=http://<your-alertmanager>:9093
```

2. Wait for your route's `group_wait` (30s by default).
3. In NudgeBee, navigate to **Troubleshoot** > **All Events** and verify the alert appears with:
   - Title `NudgeBee webhook test` and **Medium** priority
   - The alert's labels on the event
4. Let the alert expire (or set `--end` in the past) and check that the event changes to **Resolved**.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Webhook URL returns HTTP `400` with `webhook validation failed` | Verify the token — in the `token` query parameter or the `Authorization: Bearer` header — is correct. Regenerate the integration if needed. |
| Webhook URL returns a 404 HTML page | The path is wrong, so the request is reaching the NudgeBee web app instead of the alert pipeline. The correct path is `/api/webhooks/prometheus-alertmanager`. Check that the URL uses `https`, is lowercase, uses a hyphen (not an underscore), and has no `_webhook` suffix. Copy the URL directly from the integration. |
| Events not appearing | Check that a route points at the `nudgebee` receiver — a receiver alone gets no alerts — and confirm with `amtool config routes test` that your alert's labels route to it. Check the Alertmanager logs for `notify` errors on the `nudgebee` receiver. Check that Alertmanager can reach your NudgeBee domain over HTTPS. |
| Events never resolve | Set `send_resolved: true` on the `webhook_configs` entry. |
| Every event has **Low** priority | The alerts carry no `severity` label, or use a value not in the priority table. Add `severity` to your alerting rules. |
| Events not attached to a workload | The alert has none of the labels listed under [Resource Detection](#resource-detection). Add a `namespace` and a controller label (e.g. `deployment`) to the rule. A label in `commonLabels` or `groupLabels` alone is not enough. |
| Events from several clusters look the same | Add a `cluster` label to your Prometheus external labels, or add `cluster=<name>` to the webhook URL's query string per route. |
