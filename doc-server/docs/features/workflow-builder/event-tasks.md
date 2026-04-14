---
sidebar_position: 17
sidebar_label: Event Tasks
---

# Event Tasks

Store and track events for analysis and troubleshooting.

## `events.store`

**Display Name:** Store Event

Save an event to Nudgebee for later troubleshooting and analysis. Events can trigger notifications, AI analysis, and appear in the event timeline.

:::important Deduplication by `finding_id`

Events are uniquely identified by the combination of **tenant**, **account_id**, and **finding_id**. If you submit an event with a `finding_id` that already exists for the same tenant and account, no new event will be created. Instead, the existing event will be updated with the new values for `labels`, `priority`, `subject_name`, `subject_namespace`, `subject_type`, `cloud_resource_id`, `subject_owner`, and `subject_owner_kind`. Fields like `title`, `description`, `starts_at`, and `evidences` are **not** updated on deduplication.

To create a separate event for each occurrence, ensure each event has a unique `finding_id` (e.g., append a timestamp or sequence number: `PR_kwDOIzHflc7SOPfp::1`, `PR_kwDOIzHflc7SOPfp::2`).

:::

### Top-Level Parameters

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `event` | object | Yes | — | The event object (see below). |
| `trigger_notification_im` | boolean | No | `true` | Auto-trigger IM notifications. |
| `trigger_ai_analysis` | boolean | No | `true` | Auto-trigger AI analysis. |

### Event Object Fields

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `account_id` | account | No | Current workflow account | NB Account ID. |
| `title` | string | Yes | — | Title for the event. |
| `description` | string | Yes | — | Description for the event. |
| `aggregation_key` | string | Yes | — | Event type (used for playbook matching). |
| `finding_id` | string | Yes | — | Unique event ID at source. This is the dedup key — repeated values for the same tenant+account update the existing event. To create a separate event for each occurrence, use a unique value (e.g., `PR_kwDOIzHflc7SOPfp::1`). |
| `finding_type` | string | Yes | — | Event type at source. |
| `subject_name` | string | Yes | — | Event subject name. |
| `status` | string | Yes | — | `FIRING`, `RESOLVED`, or `CLOSED`. |
| `priority` | string | Yes | `INFO` | `DEBUG`, `INFO`, `LOW`, `MEDIUM`, or `HIGH`. |
| `source` | string | No | `automation` | Event source (e.g., `prometheus`, `pagerduty_webhook`, `automation`, etc.). |
| `category` | string | No | — | Event category. |
| `subject_type` | string | No | — | Event subject type. |
| `subject_namespace` | string | No | — | Event subject namespace. |
| `subject_node` | string | No | — | Event subject node. |
| `service_key` | string | No | — | Event subject service key. |
| `starts_at` | timestamp | No | — | Event start time (ISO 8601). |
| `ends_at` | timestamp | No | — | Event end time (ISO 8601). |
| `fingerprint` | string | No | — | Event fingerprint for deduplication. |
| `cluster` | string | No | Auto-derived from account name | Cluster name. |
| `principal` | string | No | — | Event user/actor. |
| `subject_owner` | string | No | — | Event subject parent. |
| `subject_owner_kind` | string | No | — | Event subject parent type. |
| `labels` | object | No | — | Key-value labels for auto investigation. |
| `evidences` | array | No | — | Evidence attachments (see Evidence schema below). |

### Evidence Object Fields

| Field | Type | Required | Default | Description |
|:---|:---|:---|:---|:---|
| `type` | string | No | `markdown` | Evidence type. |
| `data` | object | Yes | — | Evidence data. |
| `filename` | string | Yes | — | Evidence filename. |
| `additional_info` | object | No | — | Additional details for evidence. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `id` | string | Created event ID. |

