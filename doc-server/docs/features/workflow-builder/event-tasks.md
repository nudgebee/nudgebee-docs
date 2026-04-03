---
sidebar_position: 17
sidebar_label: Event Tasks
---

# Event Tasks

Store and track events for analysis and troubleshooting.

## `events.store`

**Display Name:** Store Event

Save an event to Nudgebee for later troubleshooting and analysis. Events can trigger notifications, AI analysis, and appear in the event timeline.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `event` | object | Yes | Event data (see fields below). |
| `evidence_tasks` | array | No | Task IDs whose output should be attached as evidence. |
| `trigger_notification_im` | boolean | No | Auto-trigger IM notifications. Default: `true`. |
| `trigger_ai_analysis` | boolean | No | Auto-trigger AI analysis. Default: `true`. |
| `account_id` | account | No | Nudgebee account ID. |

### Event Object Fields

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `title` | string | Yes | Event title. |
| `description` | string | Yes | Event description. |
| `aggregation_key` | string | Yes | Event type for grouping. |
| `finding_id` | string | Yes | Unique event ID at source. |
| `finding_type` | string | Yes | Event type at source. |
| `subject_name` | string | Yes | Affected resource name. |
| `cluster` | string | Yes | Cluster name. |
| `priority` | string | Yes | Priority level. Options: `DEBUG`, `INFO`, `LOW`, `MEDIUM`, `HIGH`. Default: `INFO`. |
| `source` | string | No | Event source. Default: `workflow`. Options: `kubernetes_api_server`, `prometheus`, `manual`, `pagerduty_webhook`, `AWS_CloudWatch_Alarm`, `workflow`, etc. |
| `category` | string | No | Event category. |
| `subject_type` | string | No | Resource type. |
| `subject_namespace` | string | No | Resource namespace. |
| `subject_node` | string | No | Resource node. |
| `service_key` | string | No | Service key. |
| `starts_at` | timestamp | No | Event start time. |
| `ends_at` | timestamp | No | Event end time. |
| `fingerprint` | string | No | Fingerprint for deduplication. |
| `status` | string | No | Event status. Options: `FIRING`, `RESOLVED`, `CLOSED`. |
| `labels` | object | No | Labels for auto investigation. |
| `evidences` | array | No | Evidence attachments. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `id` | string | Created event ID. |

