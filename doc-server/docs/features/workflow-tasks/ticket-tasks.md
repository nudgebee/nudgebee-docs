---
sidebar_position: 4
sidebar_label: Ticket Tasks
---

# Ticket Tasks

Create, update, and manage tickets across Jira, GitHub Issues, GitLab Issues, PagerDuty, ZenDuty, and ServiceNow.

## `tickets.create`

**Display Name:** Create Ticket

Create a new ticket or incident in your ticketing platform.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Ticket integration to use (Jira, GitHub, GitLab, PagerDuty, etc.). |
| `project_key` | string | Yes | Project key. Jira: `PROJ`. GitHub/GitLab: `owner/repo`. Dynamic options loaded from integration. |
| `title` | string | Yes | Ticket title/summary. |
| `description` | string | Yes | Ticket description/body. |
| `ticket_type` | string | No | Issue type (e.g., `Task`, `Bug`, `Incident`, `Story`). Platform-specific. Default: `Task`. |
| `severity` | string | No | Priority/severity level. Platform-specific (e.g., `High`, `Medium`, `Low`). |
| `assignee` | string | No | Assignee identifier (Jira: account ID or email; GitHub: username). |
| `reference_id` | string | No | External reference ID for tracking. Defaults to workflow ID. |
| `additional_fields` | object | No | Platform-specific custom fields (e.g., Jira Sprint, Components, custom fields). Dynamic fields loaded from integration. |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `id` | string | Internal ticket ID. |
| `ticket_id` | string | External ticket ID (e.g., `PROJ-123`). |
| `url` | string | Direct URL to the ticket. |
| `platform` | string | Platform name (jira, github, etc.). |
| `status` | string | Initial ticket status. |
| `severity` | string | Ticket priority/severity. |
| `reference_id` | string | Reference ID. |

---

## `tickets.get`

**Display Name:** Get Ticket

Fetch the details of an existing ticket by its ID.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `ticket_id` | string | Yes | Ticket ID to retrieve (e.g., `PROJ-123` for Jira, issue number for GitHub). |
| `integration_id` | ticket | No | Ticket integration. Required if the ticket was not created via Nudgebee. |
| `project_key` | string | No | Project key. Required for GitHub/GitLab (`owner/repo` format). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `id` | string | Internal ticket ID. |
| `ticket_id` | string | External ticket ID. |
| `title` | string | Ticket title. |
| `description` | string | Ticket description. |
| `status` | string | Current status. |
| `severity` | string | Priority/severity. |
| `assignee` | string | Current assignee. |
| `url` | string | Direct URL to the ticket. |
| `platform` | string | Platform name. |
| `created_at` | string | Creation timestamp. |

---

## `tickets.update`

**Display Name:** Update Ticket

Update ticket fields such as status, severity, assignee, description, or labels.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Ticket integration to use. |
| `ticket_id` | string | Yes | Ticket ID to update. |
| `project_key` | string | No | Project key (required for GitHub/GitLab). |
| `status` | string | No | New status. Triggers workflow transition for Jira/ServiceNow. GitHub/GitLab: `open`/`closed`. |
| `severity` | string | No | New priority/severity. |
| `assignee` | string | No | New assignee. |
| `description` | string | No | New description (replaces existing). |
| `labels` | array | No | Labels/tags to set (replaces existing). Not supported on ServiceNow. |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `status` | string | Update status. |
| `message` | string | Result message. |

---

## `tickets.transition`

**Display Name:** Transition Ticket

Move a ticket to a new status following workflow rules (e.g., Jira workflow transitions).

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Ticket integration. |
| `ticket_id` | string | Yes | Ticket ID to transition. |
| `status` | string | Yes | Target status (e.g., `In Progress`, `Done` for Jira; `open`/`closed` for GitHub). |
| `project_key` | string | No | Project key (required for GitHub/GitLab). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `status` | string | New status after transition. |
| `message` | string | Result message. |

---

## `tickets.assign`

**Display Name:** Assign Ticket

Assign a ticket to a specific person.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Ticket integration. |
| `ticket_id` | string | Yes | Ticket ID to assign. |
| `assignee` | string | Yes | Assignee identifier. Jira: account ID or email. GitHub/GitLab: username. ServiceNow: sys_id or email. |
| `project_key` | string | No | Project key (required for GitHub/GitLab). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `assignee` | string | Assigned user. |
| `message` | string | Result message. |

---

## `tickets.add_comment`

**Display Name:** Add Comment

Post a comment on an existing ticket.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Ticket integration. |
| `ticket_id` | string | Yes | Ticket ID to comment on. |
| `comment` | string | Yes | Comment text. |
| `project_key` | string | Yes | Project key (e.g., `PROJ` for Jira, `owner/repo` for GitHub). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `comment` | string | Comment that was added. |

---

## `tickets.get_comments`

**Display Name:** Get Ticket Comments

Fetch all comments from a ticket.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `ticket_id` | string | Yes | Ticket ID. |
| `integration_id` | ticket | No | Ticket integration (required if not created via Nudgebee). |
| `project_key` | string | No | Project key (required for GitHub/GitLab). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `comments` | array | List of comments (each with `author`, `comment`, `created_at`, `updated_at`). |
| `count` | number | Number of comments. |

---

## `tickets.acknowledge`

**Display Name:** Acknowledge Incident

Acknowledge an incident to stop further escalation. Only supported on PagerDuty and ZenDuty.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Incident management integration (PagerDuty or ZenDuty). |
| `ticket_id` | string | Yes | Incident/ticket ID to acknowledge. |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `status` | string | New status (`acknowledged`). |
| `message` | string | Result message. |

---

## `tickets.escalate`

**Display Name:** Escalate Incident

Escalate an incident to the next responder or escalation policy. Only supported on PagerDuty and ZenDuty.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Incident management integration (PagerDuty or ZenDuty). |
| `ticket_id` | string | Yes | Incident/ticket ID to escalate. |
| `escalation_policy` | string | No | Escalation policy ID (PagerDuty-specific). |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `status` | string | New status (`escalated`). |
| `message` | string | Result message. |

---

## `tickets.resolve`

**Display Name:** Resolve Incident

Mark an incident as resolved. Only supported on PagerDuty and ZenDuty.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | ticket | Yes | Incident management integration (PagerDuty or ZenDuty). |
| `ticket_id` | string | Yes | Incident/ticket ID to resolve. |
| `resolution` | string | No | Resolution message or notes. |
| `account_id` | account | No | Account override. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `ticket_id` | string | Ticket ID. |
| `status` | string | New status (`resolved`). |
| `message` | string | Result message. |
