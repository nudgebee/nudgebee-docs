---
sidebar_position: 4
---
# SolarWinds Webhook

The SolarWinds webhook integration forwards **SolarWinds Observability alerts** directly into NudgeBee. When an alert fires or clears in SolarWinds, NudgeBee automatically receives it, enriches it with correlated logs and metrics, and creates a trackable incident.

> **Prerequisite:** For full telemetry enrichment (auto-attached logs and traces), configure the [SolarWinds Observability integration](../Observability/solarwinds.md) first.

---

## How It Works

```
SolarWinds alert fires
        │
        ▼
SolarWinds Webhook Notification (HTTP POST)
        │
        ▼
NudgeBee  /webhook/solarwinds
        │
        ├── Parse alert type and extract entity/metric info
        ├── Match impacted entity to a Kubernetes workload
        ├── Auto-collect correlated logs and metrics evidence
        └── Create NudgeBee incident (or resolve existing one)
```

---

## Step 1: Copy the Webhook URL from NudgeBee

1. In NudgeBee, navigate to **Integrations** > **Webhooks**
2. Select **SolarWinds**
3. Copy the webhook endpoint URL — it will look like:
   ```
   https://<your-nudgebee-url>/webhook/solarwinds
   ```

---

## Step 2: Configure a Webhook Notification in SolarWinds

1. In SolarWinds, go to **Settings** > **Notifications**
2. Click **Add Notification** and select **Webhook**
3. Fill in the form:
   - **Name**: `NudgeBee`
   - **Webhook URL**: paste the URL from Step 1
   - **HTTP Method**: `POST`
   - **Content-Type**: `application/json`
4. Configure the **payload** using one of the templates below, depending on your alert type
5. Click **Save**
6. Attach the notification to your alert rules under **Alerts** > **Alert Rules** — select NudgeBee as a notification channel

> **Reference:** [SolarWinds Notifications and Alerting](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=notifications)

---

## Supported Alert Types

NudgeBee handles four SolarWinds alert payload formats:

| Alert Type | When Sent | Description |
|------------|-----------|-------------|
| `entity-metric-raw` | Alert fires on a K8s entity | Metric threshold breach linked to a Kubernetes resource |
| `standalone-metric-raw` | Alert fires on a metric (no entity) | Metric-only alert with condition and description |
| `generic-event-raw` | Log-based alert fires | Alert triggered by a log query match |
| `alert-cleared-entity-raw` | Alert resolves | Any alert clears or recovers |

### Payload Template — Entity Metric Alert

Use this for alerts tied to a Kubernetes entity (pod, deployment, node, etc.):

```json
{
  "type": "entity-metric-raw",
  "name": "{{alert.name}}",
  "severity": "{{alert.severity}}",
  "triggerID": "{{alert.id}}",
  "detailURL": "{{alert.url}}",
  "condition": "{{alert.condition}}",
  "entities": [
    {
      "displayName": "{{entity.name}}",
      "entityId": "{{entity.id}}",
      "type": "{{entity.type}}",
      "activeAlertURL": "{{entity.alertUrl}}",
      "values": [
        { "name": "{{metric.name}}", "value": "{{metric.value}}" }
      ]
    }
  ]
}
```

### Payload Template — Standalone Metric Alert

Use this for metric-only alerts without an entity context:

```json
{
  "type": "standalone-metric-raw",
  "name": "{{alert.name}}",
  "severity": "{{alert.severity}}",
  "triggerID": "{{alert.id}}",
  "detailURL": "{{alert.url}}",
  "condition": "{{alert.condition}}",
  "description": "{{alert.description}}",
  "metrics": [
    {
      "name": "{{metric.name}}",
      "value": "{{metric.value}}",
      "threshold": "{{metric.threshold}}"
    }
  ]
}
```

### Payload Template — Log-Based Alert

Use this for alerts triggered by log query conditions:

```json
{
  "type": "generic-event-raw",
  "name": "{{alert.name}}",
  "severity": "{{alert.severity}}",
  "triggerID": "{{alert.id}}",
  "detailURL": "{{alert.url}}",
  "query": "{{alert.logQuery}}",
  "logViewerURL": "{{alert.logViewerUrl}}",
  "events": [
    {
      "message": "{{event.message}}",
      "hostname": "{{event.hostname}}",
      "severity": "{{event.severity}}",
      "applicationName": "{{event.application}}"
    }
  ]
}
```

### Payload Template — Alert Cleared

Use this to notify NudgeBee when an alert resolves:

```json
{
  "type": "alert-cleared-entity-raw",
  "name": "{{alert.name}}",
  "triggerID": "{{alert.id}}",
  "detailURL": "{{alert.url}}"
}
```

---

## Step 3: Test the Webhook

1. In SolarWinds, use the **Test Notification** button in the webhook settings, or manually trigger one of your alert rules.
2. In NudgeBee, navigate to **Incidents** — the incident should appear within a few seconds.
3. Open the incident and confirm:
   - Alert name and severity are populated
   - Impacted workload is linked (for entity-type alerts)
   - Log or metric evidence is attached (if the Observability integration is configured)

---

## Event Mapping

### Alert Status → NudgeBee Incident Status

| SolarWinds Alert Type | NudgeBee Incident Status |
|-----------------------|--------------------------|
| `entity-metric-raw` | `firing` |
| `standalone-metric-raw` | `firing` |
| `generic-event-raw` | `firing` |
| `alert-cleared-entity-raw` | `resolved` |

### Severity → Priority

| SolarWinds Severity | NudgeBee Priority |
|---------------------|-------------------|
| `CRITICAL` | P1 — Critical |
| `HIGH` | P1 — Critical |
| `MEDIUM` | P2 — High |
| `WARNING` | P2 — High |
| `LOW` | P3 — Medium |
| `INFO` | P4 — Info |

---

## Automatic Evidence Collection

When NudgeBee receives an alert, it automatically enriches the incident:

1. **Alert details** — Extracts the alert name, severity, condition expression, and a link back to SolarWinds for full details.
2. **Workload matching** — For entity-type alerts, the entity `displayName` is matched to a Kubernetes workload using progressive lookups: exact name → label `app.kubernetes.io/name` → label `app` → substring match.
3. **Log evidence** — If the [SolarWinds Observability integration](../Observability/solarwinds.md) is configured, correlated logs are auto-fetched for the impacted workload around the alert time.
4. **Metric evidence** — Related metric data from SolarWinds is attached as structured evidence.
5. **Deduplication** — Alerts are deduplicated using the **TriggerID** as a unique fingerprint. If a TriggerID is absent, a composite key of `name + condition` is used. Cleared alerts update (resolve) the existing incident rather than creating a new one.
6. **Event rule auto-creation** — NudgeBee automatically creates an event rule for new alert types, making them visible in the rules management UI.

---

## Prerequisites Checklist

- [ ] The NudgeBee webhook URL is publicly reachable from SolarWinds notification delivery
- [ ] [SolarWinds Observability integration](../Observability/solarwinds.md) configured (for log and metric enrichment)
- [ ] Alert notification in SolarWinds is attached to the relevant alert rules

---

## Verify the Integration

1. Confirm the test notification (Step 3) created an incident in NudgeBee.
2. Wait for a real SolarWinds alert to fire, or manually trigger one.
3. Open the incident in NudgeBee and verify:
   - **Status** is `firing` and transitions to `resolved` when the alert clears
   - **Priority** maps correctly to the alert severity
   - **Workload** is linked for entity-type alerts
   - **Logs** and **Metrics** tabs show correlated evidence

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No incident created after test | Webhook URL unreachable | Verify the NudgeBee URL is publicly accessible. Check firewall or network rules. |
| Incident created but no workload linked | Entity name doesn't match any K8s workload | Check if the entity `displayName` in SolarWinds matches a workload name or label in NudgeBee. |
| No logs or metrics attached | Observability integration not configured | Set up the [SolarWinds Observability integration](../Observability/solarwinds.md) first. |
| Alert not resolving / stays firing | Cleared alert payload not configured | Ensure you have a separate notification pointing to NudgeBee for the `alert-cleared-entity-raw` type. |
| Duplicate incidents for the same alert | `triggerID` missing in payload | Ensure your payload template includes the `triggerID` field. |
| Severity shows as P4 / Info unexpectedly | Severity field value is unexpected | Verify the `severity` field in the payload uses one of: `CRITICAL`, `HIGH`, `MEDIUM`, `WARNING`, `LOW`, `INFO`. |

---

## Helpful Links

- [SolarWinds Notifications and Alerting](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=notifications)
- [SolarWinds Alert Rules](https://documentation.solarwinds.com/en/success_center/observability/default.htm#cshid=alert-rules)
- [SolarWinds Observability SaaS documentation](https://documentation.solarwinds.com/en/success_center/observability/default.htm)
- [SolarWinds Observability integration in NudgeBee](../Observability/solarwinds.md)
