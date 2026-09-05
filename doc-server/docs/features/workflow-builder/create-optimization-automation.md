---
id: create-optimization-automation
title: "Create an Automation from an Optimization Recommendation"
sidebar_label: Optimization-Triggered Automation
sidebar_position: 3
keywords: [optimization trigger, auto rightsizing, cost optimization automation, idle resource cleanup, finops automation]
intent: setup
provider: all
---

# Create an Automation from an Optimization Recommendation

Start with a notification workflow so you can verify recommendation matching before adding remediation.

## Prerequisites

- A connected account producing recommendations.
- Permission to create and run workflows.
- A configured notification destination for the test.

## Configure the trigger

Create a workflow and add an **Optimization Trigger**. Select a Cluster, Category, and Rule Name as needed. An empty configuration matches every recommendation; use a narrow filter for your first workflow. See the [Optimization Trigger reference](./triggers.md#optimization-trigger) for supported values.

The structured trigger does not expose minimum-savings or environment-tag fields. If you need additional logic, evaluate the available payload fields in the workflow before performing an action.

## Use the actual recommendation payload

Recommendations arrive under `Inputs.event` in downstream task parameters:

| Expression | Value |
| --- | --- |
| `{{ Inputs.event.recommendation_id }}` | Recommendation ID |
| `{{ Inputs.event.resource_id }}` | Resource identifier |
| `{{ Inputs.event.account_id }}` | Cloud account ID |
| `{{ Inputs.event.category }}` | Recommendation category |
| `{{ Inputs.event.rule_name }}` | Recommendation rule |
| `{{ Inputs.event.estimated_savings }}` | Savings value supplied by the recommendation |
| `{{ Inputs.event.cluster }}` | Cluster value |

The payload also contains `event_type`, `cloud_account_id`, `tenant_id`, `severity`, and `status`. It does not include an `optimization` object or proposed CPU/memory request fields. Retrieve and inspect the recommendation details before configuring a rightsizing action; do not treat the resource ID as a Kubernetes workload name.

## Add a notification and verify

1. Add a notification task from [Notification Tasks](./notification-tasks.md) and select a test destination.
2. Include the recommendation ID, resource ID, category, and savings value in the message.
3. Test with a representative payload using the [validation guide](./workflow-dry-run-validation.md). Dry Run can send real notifications.
4. Publish an Active version and make it live.
5. When a new matching recommendation arrives, inspect the execution inputs and confirm the notification contains the expected identifiers.

## Add remediation after validating the inputs

Choose a task appropriate to the recommendation and explicitly supply its required account, resource, and action parameters. Insert an [Approval](./workflow-operations-approvals.md) task where review is needed, and verify decision handling before the change task.

Use [Auto Optimize](../optimizations/autopilot/auto_optimize/index.md) for supported scheduled optimization configurations. Before direct changes, record the previous resource settings and the recovery procedure. Workflow history does not provide a universal one-click infrastructure rollback.
