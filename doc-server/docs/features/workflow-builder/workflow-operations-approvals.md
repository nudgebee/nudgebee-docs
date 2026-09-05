---
id: workflow-operations-approvals
title: "Workflow Operations: Approvals, Replays, Cancellations & Auditing"
sidebar_label: Approvals, Replays & Operations
sidebar_position: 6
keywords: [workflow approvals, approval gate, replay workflow, cancel execution, workflow auditing, who invoked workflow, execution history]
intent: change
provider: all
---

# Workflow Operations: Approvals, Replays, Cancellations & Auditing

Use execution details to inspect task outcomes, respond to approvals, retry a run, or request cancellation.

## Approval tasks

Add the **Core → Approval** task before an action that needs human review. Configure:

| Parameter | Purpose |
| --- | --- |
| Message | Explain the proposed action, target, and impact |
| Approval type | `in_app`, `instant_message`, or `email` |
| IM provider and channel | For instant messages, select Slack and its destination channel ID |
| Email recipients | Required when using email |
| Approval options | Defaults to `approve` and `reject` |

The default `in_app` mode waits for a response from the execution view without sending a notification. Configure the workflow's branching to handle the returned decision before running a mutating task. See [Core Tasks](./core-tasks.md).

The approval task does not provide per-task allowed-role/group selectors or automatic escalation to a secondary channel. Access to execution actions depends on the user's configured permissions.

## Retry or replay an execution

A retry starts a **new execution of the workflow from the beginning**. It does not resume at the failed task or reuse completed task outputs.

1. Open the original execution and inspect the failure and any actions that already succeeded.
2. Correct the underlying problem and review the inputs for the new execution.
3. Retry the run. Original inputs are reused, with any supplied overrides.
4. Inspect the new execution and verify its external effects.

The server prefers the version used by the original run. If that version is unavailable, such as for an older run without version metadata or a pruned version, it falls back to the live version. Review the selected definition before retrying.

:::warning Repeated actions
Earlier tasks can execute again, including ticket creation, notifications, and infrastructure changes. Check whether those actions are safe to repeat before retrying.
:::

## Cancel an execution

Use the cancellation action in execution details to request cancellation. The server sends a cancellation request to the workflow engine; it does not expose a choice between graceful cancellation and force termination.

Cancellation does not undo completed actions or guarantee that an external command has stopped immediately. Inspect the final task states and check the target system before retrying or starting recovery.

## Execution history and attribution

Inspect the execution's version, inputs, task outputs, errors, and status. Workflow operations also emit audit events, including cancellation. Available attribution depends on how the workflow was invoked; do not assume every run contains a client IP, token name, AI conversation ID, or recommendation savings value.

For recovery, record the original and retry execution IDs, the version used, the affected resources, and any manual corrective actions.
