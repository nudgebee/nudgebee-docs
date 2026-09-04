---
id: workflow-dry-run-validation
title: "Test and Validate an Automation (Dry Run & Validation)"
sidebar_label: Dry Run & Validation
sidebar_position: 4
keywords: [workflow dry run, workflow validation, test workflow, mock payload, draft vs live, dry-run simulation]
intent: inspect
provider: all
---

# Test and Validate an Automation

Validate the workflow definition and test its behavior before making a version live.

:::warning Dry Run can perform real actions
Dry Run executes workflow tasks with a dry-run flag. Only tasks that explicitly handle that flag skip their side effects. HTTP requests, scripts, ticket creation, notifications, database queries, and cloud calls can still reach external systems. Use test accounts, resources, and destinations with appropriately restricted credentials.
:::

## Validation and execution are different checks

| Check | What it establishes | External effects |
| --- | --- | --- |
| Definition validation | Required fields, supported parameters, and workflow structure | Does not execute the tasks |
| Dry Run | Evaluated inputs, task outputs, and execution trace | Depends on each task's dry-run support |
| Run current | Executes the current draft | Real execution |
| Run live version | Executes the published live version | Real execution |

For example, the Kubernetes vertical-rightsize task returns its proposed patch in Dry Run and skips GitOps, ticket creation, and patch application. This behavior does not apply automatically to other task types.

## Prepare a test

1. Save your draft and resolve configuration errors shown in the editor.
2. Inspect every task that can change a resource or contact an external service. Choose test targets before executing it.
3. Use a sanitized payload with the same structure as the real trigger input. See [trigger payloads](./triggers.md#event-payload-schema).
4. Run the draft with Dry Run and inspect the task inputs, outputs, and errors. Missing payload fields must be corrected before publishing.
5. For tasks that honor dry-run mode, review the proposed change and then validate actual behavior separately against a test resource. A simulated patch does not prove that a production rollout will remain healthy.

## Publish the validated version

**Save Draft** preserves your working copy. **Publish** creates a version; **Make Live** selects the version used by production triggers. Set the live version to Active when ready. Editing a draft does not stop an existing active live version.

See [Workflow Versioning](./workflow-versioning.md) for the controls and version history. Publishing an older workflow version changes future executions; it does not undo changes already made to infrastructure.
