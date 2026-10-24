---
id: recommendations-auto-optimize-lifecycle
title: Recommendations & AutoOptimize Lifecycle
sidebar_label: Recommendations & AutoOptimize
sidebar_position: 2
keywords: [recommendation lifecycle, autooptimize, rightsizing, dismiss recommendation, finops, rollback safety, cost optimization]
intent: inspect
provider: all
---

# Recommendations & AutoOptimize Lifecycle

Recommendations identify potential cost, performance, or configuration improvements. Review their evidence and target before applying them; the available actions depend on the recommendation category and integration.

## Review the evidence

Check the account, resource, recommendation rule, observation period, current settings, proposed settings, and estimated impact. Workload right-sizing uses 14 days of usage by default (see [how recommendations are calculated](./index.md#how-right-sizing-recommendations-are-calculated)); when you apply one you can choose another algorithm (**NB Algo**, **P99**, **P97**, **P95**) and add a buffer.

Savings are estimates based on the available usage and pricing data. Confirm the time basis and assumptions shown for the recommendation before using the value in a budget decision.

## Recommendation status

| Status | Meaning |
|---|---|
| **Open** | Found and not yet acted on |
| **In progress** | A fix, pull request or ticket is under way |
| **Dismissed / snoozed** | Hidden permanently, or for 7, 30 or 90 days — a snoozed recommendation comes back on its own |

Each attempt to fix a recommendation is recorded in [Resolutions](./resolutions.md) as **Success**, **In Progress** or **Failed** (failed ones can be retried).

## Choose an action

- Inspect the recommendation and its suggested change.
- Use an available apply action, GitOps PR, or ticket flow appropriate to the resource and integration.
- Use [Optimization-triggered Workflows](../workflow-builder/create-optimization-automation.md) to notify or orchestrate follow-up actions.
- Use [Auto Optimize](./autopilot/auto_optimize/index.md) to apply right-sizing continuously or on a schedule, with optional [approval](./autopilot/auto_optimize/approvals.md) (requests expire after 24 hours).

Recommendation status and execution status are different. A successful patch command does not by itself prove the application remained healthy or the estimated savings were realized.

## Configure automation

Select the target resources, algorithm and settings, schedule (a UTC cron expression), and approval options in the Auto Optimize form. Continuous rules run without approval. To stop a rule, **Disable** it — rules can't be deleted, and disabling doesn't revert changes already made. Validate each action's dry-run behavior before testing: the vertical-rightsize task skips its patch, GitOps, and ticket side effects in dry-run mode, but this is not a guarantee for every workflow task.

See [Dry Run & Validation](../workflow-builder/workflow-dry-run-validation.md). Do not assume a policy has a savings cap, maintenance-window queue, or automatic rollback unless that behavior is explicitly configured and supported by the selected action.

## Verify and recover

1. Before applying a change, record the prior resource settings and how to restore them.
2. Inspect execution output or the resulting GitOps PR to confirm what changed.
3. Check the workload's rollout, availability, and resource behavior after the change.
4. If recovery is needed, revert the GitOps change or restore the previous specification through your deployment process.

NudgeBee does not provide a universal automatic rollback on application degradation or a one-click infrastructure rollback for every workflow. Changing the live workflow version affects future runs; it does not revert completed resource changes.

## Related

- [Optimize overview](./index.md)
- [Cost & Configuration](./cost-and-configuration.md)
- [Auto Optimize](./autopilot/auto_optimize/index.md)
- [Resolutions](./resolutions.md)
