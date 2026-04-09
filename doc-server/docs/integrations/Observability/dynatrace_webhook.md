---
sidebar_position: 3
---
# Dynatrace Webhook

The Dynatrace webhook integration forwards **Dynatrace Problems** (incidents) directly into NudgeBee. When a problem fires or resolves in Dynatrace, NudgeBee automatically receives it, enriches it with correlated logs and traces, and creates a trackable incident.

> **Prerequisite:** For full telemetry enrichment (auto-attached logs and traces), configure the [Dynatrace Observability integration](./dynatrace.md) first.

---

## How It Works

```
Dynatrace Problem fires
        │
        ▼
Dynatrace Problem Notification (HTTP POST)
        │
        ▼
NudgeBee  /webhook/dynatrace
        │
        ├── Fetch full problem details from Dynatrace API v2
        ├── Match impacted entity to a Kubernetes workload
        ├── Auto-collect correlated logs (2 hrs before → 6 hrs after problem start)
        ├── Auto-collect correlated traces (same window)
        └── Create NudgeBee incident with evidence attached
```

---

## Step 1: Copy the Webhook URL from NudgeBee

1. In NudgeBee, navigate to **Integrations** > **Webhooks**
2. Select **Dynatrace**
3. Copy the webhook endpoint URL — it will look like:
   ```
   https://<your-nudgebee-url>/webhook/dynatrace
   ```

---

## Step 2: Configure Problem Notification in Dynatrace

1. In Dynatrace, go to **Settings** > **Integrations** > **Problem notifications**
2. Click **Add notification**
3. Select **Custom integration** as the notification type
4. Fill in the form:
   - **Display name**: `NudgeBee`
   - **Webhook URL**: paste the URL from Step 1
   - **Accept SSL certificate**: enabled (recommended)
5. Under **Payload**, paste one of the templates below
6. Under **Alerting profile**, choose which problems to forward (e.g., all problems, or a specific environment/namespace)
7. Click **Save**

### Payload Template — OpenPipeline / Davis format *(Recommended)*

Use this for modern Dynatrace environments (Grail + OpenPipeline):

```json
{
  "event.id": "{ProblemID}",
  "event.status": "{State}",
  "event.name": "{ProblemTitle}",
  "event.severity": "{SeverityLevel}",
  "event.start_time": "{ProblemDetailsJSONv2.startTime}",
  "event.end_time": "{ProblemDetailsJSONv2.endTime}",
  "k8s.workload.name": "{ProblemDetailsJSONv2.impactedEntities[0].name}",
  "dt.problem.url": "{ProblemURL}",
  "dt.tags": "{Tags}"
}
```

### Payload Template — Classic Freemarker format *(Legacy)*

Use this if your environment uses the older Freemarker-based notification system:

```
{
  "ProblemID": "{ProblemID}",
  "ProblemTitle": "{ProblemTitle}",
  "State": "{State}",
  "ProblemSeverity": "{ProblemSeverity}",
  "ImpactedEntities": {ImpactedEntities},
  "ProblemURL": "{ProblemURL}",
  "Tags": "{Tags}"
}
```

> **Reference:** [Dynatrace Problem notifications — webhook setup](https://docs.dynatrace.com/docs/manage/notifications-and-alerting/problem-notifications/webhook-integration)

---

## Step 3: Test the Webhook

1. In the Dynatrace Problem notification settings, click **Send test notification**
2. In NudgeBee, navigate to **Incidents** — a test incident should appear within a few seconds
3. Open the incident and confirm:
   - Problem title and severity are populated
   - Impacted workload is linked (if entity mapping succeeded)
   - Log and trace evidence is attached (if the Observability integration is configured)

---

## Event Mapping

### Problem State → NudgeBee Status

| Dynatrace State | NudgeBee Incident Status |
|-----------------|--------------------------|
| `OPEN` | `firing` |
| `RESOLVED` | `resolved` |
| `MERGED` | `resolved` |

### Severity → Priority

| Dynatrace Severity | NudgeBee Priority |
|--------------------|-------------------|
| `AVAILABILITY` | P1 — Critical |
| `ERROR` | P1 — Critical |
| `PERFORMANCE` | P2 — High |
| `RESOURCE_CONTENTION` | P3 — Medium |
| `CUSTOM_ALERT` | P3 — Medium |

---

## Automatic Evidence Collection

When NudgeBee receives a problem, it automatically enriches the incident:

1. **Problem details** — Full metadata is fetched from the Dynatrace Problems API (`/api/v2/problems/{problemId}`): impacted entities, tags, start/end times, linked events.
2. **Workload matching** — The impacted entity name is matched to a Kubernetes workload using progressive lookups: exact name match → label `app.kubernetes.io/name` → label `app` → substring match.
3. **Log evidence** — Correlated logs are queried from Dynatrace Grail for **2 hours before to 6 hours after** the problem start time, filtered to the matched workload.
4. **Trace evidence** — Distributed traces for the same workload and time window are attached.
5. **Deduplication** — Problems are deduplicated using the **Dynatrace Problem ID** as a unique fingerprint. Reopened problems update the existing incident rather than creating a duplicate.

> Evidence collection (steps 3–4) requires the [Dynatrace Observability integration](./dynatrace.md) to be configured for the same environment.

---

## Prerequisites Checklist

- [ ] The NudgeBee webhook URL is publicly reachable from Dynatrace's notification delivery system
- [ ] [Dynatrace Observability integration](./dynatrace.md) configured (for log and trace enrichment)
- [ ] Access token includes `storage:logs:read` and `storage:spans:read` scopes
- [ ] *(Optional)* `environment-api:problems:read` scope added for richer problem metadata

---

## Verify the Integration

1. Confirm the test notification (Step 3) created an incident in NudgeBee.
2. Wait for a real Dynatrace problem to fire, or trigger one manually via a synthetic monitor.
3. Open the incident in NudgeBee and verify:
   - **Status** reflects the Dynatrace problem state (firing / resolved)
   - **Priority** maps correctly to the problem severity
   - **Logs** and **Traces** tabs show correlated evidence

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No incident created after test | Webhook URL unreachable | Verify the NudgeBee URL is publicly accessible. Check firewall or network rules. |
| Incident created but no workload linked | Entity name doesn't match any K8s workload | Check if the impacted entity name in Dynatrace matches a workload name or label in NudgeBee. |
| No logs or traces attached | Observability integration not configured | Set up the [Dynatrace Observability integration](./dynatrace.md) first. |
| 403 on problem enrichment | Token missing `environment-api:problems:read` | Add the scope to your token, or the integration falls back to DQL-based enrichment. |
| Duplicate incidents for the same problem | `event.id` / `ProblemID` missing in payload | Ensure your payload template includes the Problem ID field. |
| Classic template fields show as literal text | Using wrong notification type | Use **Custom integration** — not a webhook app — in Dynatrace notification settings. |

---

## Helpful Links

- [Dynatrace Problem notifications — webhook setup](https://docs.dynatrace.com/docs/manage/notifications-and-alerting/problem-notifications/webhook-integration)
- [Dynatrace Problems API v2](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/problems-v2)
- [Dynatrace Access Tokens](https://docs.dynatrace.com/docs/manage/access-control/access-tokens)
- [Dynatrace Observability integration in NudgeBee](./dynatrace.md)
