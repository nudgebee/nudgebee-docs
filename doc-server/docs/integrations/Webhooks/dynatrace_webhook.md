---
sidebar_position: 3
---
# Dynatrace Webhook

The Dynatrace webhook integration forwards **Dynatrace Problems** (incidents) directly into NudgeBee. When a problem fires or resolves in Dynatrace, NudgeBee automatically receives it, enriches it with correlated logs and traces, and creates a trackable incident.

> **Prerequisite:** For full telemetry enrichment (auto-attached logs and traces), configure the [Dynatrace Observability integration](../Observability/dynatrace.md) first.

---

## How It Works

```
Dynatrace Davis detects a problem
        │
        ▼
Dynatrace Workflow triggers (Davis problem)
        │
        ▼
HTTP Request action sends POST to NudgeBee
        │
        ▼
NudgeBee  /webhook/dynatrace
        │
        ├── Fetch full problem details from Dynatrace API v2
        ├── Match impacted entity to a Kubernetes workload
        ├── Auto-collect correlated logs (2 hrs before → 6 hrs after)
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

## Step 2: Configure a Workflow in Dynatrace

1. In Dynatrace, open the **Workflows** app (search for "Workflows" in the navigation bar).
2. Click **Add Workflow**.
3. Give the workflow a descriptive name (e.g., `NudgeBee Problem Notification`).

### Configure the Trigger

4. Set the trigger type to **Davis problem**.
5. Configure the trigger settings:
   - **Problem state**: select **Active or Closed** — this ensures the workflow fires both when a problem opens and when it resolves.
   - **Event category**: select **All** to capture all problem types, or pick specific categories (Availability, Error, Slowdown, Resource, Custom).
   - *(Optional)* Add **entity tag filters** to limit which problems are forwarded (e.g., only problems tagged `env:production`).
   - *(Optional)* Add a **DQL matcher expression** for fine-grained filtering (e.g., `maintenance.is_under_maintenance == false` to skip maintenance windows).

### Add the HTTP Request Task

6. In the workflow canvas, click **+** (below the trigger node) to add a task.
7. Select the **HTTP Request** action.
8. Configure the task:
   - **Method**: `POST`
   - **URL**: paste the NudgeBee webhook URL from Step 1
   - **Headers**: add `Content-Type` with value `application/json`
   - **Payload**: paste the following:

```
{{ event() | to_json }}
```

This sends the entire Davis problem record to NudgeBee, including all entity metadata, Kubernetes context, severity, timestamps, and tags.

9. Click **Save** to save the workflow as a draft, then click **Deploy** to activate it.

> **Reference:** [Dynatrace Workflows documentation](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows)

:::tip Custom Payload Template
If you prefer to send only specific fields instead of the full event, use this template in the payload:

```json
{
  "event.id": "{{ event()['event.id'] }}",
  "display_id": "{{ event()['display_id'] }}",
  "event.status": "{{ event()['event.status'] }}",
  "event.name": "{{ event()['event.name'] }}",
  "event.category": "{{ event()['event.category'] }}",
  "event.start": "{{ event()['event.start'] }}",
  "event.end": "{{ event()['event.end'] }}",
  "event.kind": "{{ event()['event.kind'] }}",
  "k8s.workload.name": {{ event()['k8s.workload.name'] | to_json }},
  "k8s.namespace.name": {{ event()['k8s.namespace.name'] | to_json }},
  "affected_entity_names": {{ event()['affected_entity_names'] | to_json }},
  "entity_tags": {{ event()['entity_tags'] | to_json }},
  "dt.davis.impact_level": {{ event()['dt.davis.impact_level'] | to_json }}
}
```

Dynatrace Workflows use **Jinja template expressions** with the `event()` function to access problem fields. The `| to_json` filter ensures array values are serialized as valid JSON arrays.
:::

<details>
<summary>Legacy: Problem Notifications (Dynatrace Classic)</summary>

If your Dynatrace environment does not have the Workflows app (e.g., older SaaS or Managed versions), you can use the legacy **Problem Notifications** approach:

1. Go to **Settings** > **Integrations** > **Problem notifications**
2. Click **Add notification** > **Custom integration**
3. Set **Display name** to `NudgeBee`, paste the webhook URL, and enable **Accept SSL certificate**
4. Under **Payload**, paste:

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

5. Select an **Alerting profile** to choose which problems to forward, then click **Save**

**Note:** Legacy Problem Notifications use `{Placeholder}` syntax. Status values are `OPEN` / `RESOLVED` / `MERGED` (instead of `ACTIVE` and `CLOSED` in Workflows).

</details>

---

## Step 3: Test the Workflow

1. In the Dynatrace Workflows app, open the workflow you created.
2. Click **Run** to execute the workflow manually, or wait for a real Davis problem to trigger it.
3. Check the **Execution log** in the workflow to verify the HTTP Request task completed with a `2xx` status code.
4. In NudgeBee, navigate to **Incidents** — a test incident should appear within a few seconds.
5. Open the incident and confirm:
   - Problem title and severity are populated
   - Impacted workload is linked (if entity mapping succeeded)
   - Log and trace evidence is attached (if the Observability integration is configured)

---

## Event Mapping

### Problem State → NudgeBee Status

| Dynatrace Problem State | NudgeBee Incident Status |
|--------------------------|--------------------------|
| `ACTIVE` | `firing` |
| `CLOSED` | `resolved` |

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

> Evidence collection (steps 3–4) requires the [Dynatrace Observability integration](../Observability/dynatrace.md) to be configured for the same environment.

---

## Prerequisites Checklist

- [ ] The NudgeBee webhook URL is publicly reachable from Dynatrace's Workflow execution environment
- [ ] [Dynatrace Observability integration](../Observability/dynatrace.md) configured (for log and trace enrichment)
- [ ] Access token includes `storage:logs:read` and `storage:spans:read` scopes
- [ ] *(Optional)* `environment-api:problems:read` scope added for richer problem metadata

---

## Verify the Integration

1. Confirm the workflow test (Step 3) created an incident in NudgeBee.
2. Wait for a real Dynatrace problem to fire, or trigger one manually (e.g., via a synthetic monitor or by running the workflow manually).
3. Open the incident in NudgeBee and verify:
   - **Status** reflects the Dynatrace problem state (firing / resolved)
   - **Priority** maps correctly to the problem severity
   - **Logs** and **Traces** tabs show correlated evidence

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No incident created after running workflow | Webhook URL unreachable or HTTP Request task misconfigured | Check the workflow execution log for HTTP errors. Verify the NudgeBee URL is publicly accessible. |
| Workflow does not trigger on new problems | Trigger misconfigured | Verify the trigger type is **Davis problem** with problem state set to **Active or Closed**. Check event category filters. |
| Workflow fires only on open, not resolve | Problem state filter incomplete | Set problem state to **Active or Closed** (not just Active) in the trigger configuration. |
| Incident created but no workload linked | Entity name doesn't match any K8s workload | Check if the impacted entity name in Dynatrace matches a workload name or label in NudgeBee. |
| No logs or traces attached | Observability integration not configured | Set up the [Dynatrace Observability integration](../Observability/dynatrace.md) first. |
| 403 on problem enrichment | Token missing `environment-api:problems:read` | Add the scope to your token, or the integration falls back to DQL-based enrichment. |
| Duplicate incidents for the same problem | `event.id` missing in payload | Ensure your payload includes the `event.id` field (included by default with `event() | to_json`). |
| Payload fields render as literal text | Jinja syntax error in template | Verify expressions use double braces and the `event()` function. Check the workflow execution log for template rendering errors. |

---

## Helpful Links

- [Dynatrace Workflows documentation](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows)
- [Dynatrace HTTP Request action](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows/default-workflow-actions/http-request-workflow-action)
- [Dynatrace Davis problem trigger](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows/trigger/event-trigger)
- [Dynatrace Problems API v2](https://docs.dynatrace.com/docs/dynatrace-api/environment-api/problems-v2)
- [Dynatrace Access Tokens](https://docs.dynatrace.com/docs/manage/access-control/access-tokens)
- [Dynatrace Observability integration in NudgeBee](../Observability/dynatrace.md)
