---
sidebar_position: 9
sidebar_label: Event Resolutions
---

# Event Resolutions

**Troubleshoot → Event Resolutions**

The ledger of everything NudgeBee did about an event. When a runbook restarts a workload, an agent raises a right-sizing pull request, a ticket gets opened, or a command runs against a cluster, a resolution row records it — what was done, by whom, and whether it worked.

<!-- ![Event Resolutions table showing subject, resolution type, status and resolver](./img/event-resolutions.png) -->

## Why it exists

Actions taken on an event are scattered across the products they touch: a PR lives in GitHub, a ticket in Jira, a workflow run in the execution history. This page is the one place that answers "what has already been tried on this?" without opening four tools — and the audit trail for anything the platform changed on its own.

## Reading the table

| Column | What it holds |
|---|---|
| **Subject** | The workload, resource or investigation the resolution belongs to. |
| **Source** | The event, or a link to the AI investigation that raised the resolution. |
| **Severity** | Priority of the originating event (empty for resolutions raised by an investigation). |
| **Resolution** | The kind of action taken — links out where the action has a URL. |
| **Resolution Details** | The specifics: the command that ran (with its exit code when it wasn't 0), CPU and memory requests and limits as before → after, or the change made (Pod Restart, Raise PR, PVC Resize, Scale Replicas, Image Update). |
| **Status** | **Done**, **Needs checking** (a verification check didn't confirm it), **Outcome unverified** (a command reported no exit code), **Outcome unknown**, **Failed**, **Declined** or **Running**. A message under the status explains failures and unknowns, and also appears on Done rows whose reference isn't a link. |
| **Resolver** | Who or what acted. |
| **Updated** | When the row last changed. |

## Resolution types

| Type | Raised by |
|---|---|
| `PullRequest` | An agent or a threshold apply that writes a change as code. |
| `Ticket` | A ticket opened in Jira, ServiceNow, PagerDuty or another configured system. |
| `DeploymentChange` | A change applied to a running workload. |
| `WorkflowExecution` | An automation run against the event. |
| `CommandExecution` | A command run against the cluster or host. |

## Resolvers

| Resolver | Meaning |
|---|---|
| `AutoPilot` | Applied automatically by an auto-optimize or auto-runbook policy. |
| `Manual` | A person triggered the action from the UI. |
| `System` | Raised by the platform without a specific actor. |
| `User` | Attributed to a named user, shown by display name. |

## Investigation-backed resolutions

Not every resolution starts from an event. An AI investigation can raise one directly — an agent proposing a right-sizing PR, for example. Those rows show **Investigation** in the Source column and link straight back to the conversation that produced them, so you can read the reasoning behind the change.

## Filters

**Account**, **Status**, **Type** and **Resolver**, plus **Download** (CSV). The Status filter uses the underlying values — Success, Failed, InProgress, Configuring, Unknown, Declined — and the Type filter lists every kind the platform can record.

There is no date range: the table holds the whole history, newest first.

## Related

- [Event Lifecycle & Triage](./event-lifecycle.md)
- [Auto Optimize](../optimizations/autopilot/auto_optimize/index.md) — the policies that produce `AutoPilot` resolutions
- [Workflow Builder](../workflow-builder/index.md) — automations that produce `WorkflowExecution` resolutions
