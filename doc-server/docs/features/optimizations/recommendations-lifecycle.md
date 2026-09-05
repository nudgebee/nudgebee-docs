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

Check the account, resource, recommendation rule, observation period, current settings, proposed settings, and estimated impact. Rightsizing algorithms and headroom are configurable: there is no universal 14-day P95/P99 calculation or fixed 15–20% buffer for every recommendation.

Savings are estimates based on the available usage and pricing data. Confirm the time basis and assumptions shown for the recommendation before using the value in a budget decision.

## Choose an action

- Inspect the recommendation and its suggested change.
- Use an available apply action, GitOps PR, or ticket flow appropriate to the resource and integration.
- Use [Optimization-triggered Workflows](../workflow-builder/create-optimization-automation.md) to notify or orchestrate follow-up actions.
- Use [Auto Optimize](./autopilot/auto_optimize/index.md) to configure supported scheduled optimizations and optional approval.

Recommendation status and execution status are different. A successful patch command does not by itself prove the application remained healthy or the estimated savings were realized.

## Configure automation

Select the target resources, supported algorithm/settings, schedule, and approval options in the Auto Optimize form. Validate each action's dry-run behavior before testing: the vertical-rightsize task skips its patch, GitOps, and ticket side effects in dry-run mode, but this is not a guarantee for every workflow task.

See [Dry Run & Validation](../workflow-builder/workflow-dry-run-validation.md). Do not assume a policy has a savings cap, maintenance-window queue, or automatic rollback unless that behavior is explicitly configured and supported by the selected action.

## Verify and recover

1. Before applying a change, record the prior resource settings and how to restore them.
2. Inspect execution output or the resulting GitOps PR to confirm what changed.
3. Check the workload's rollout, availability, and resource behavior after the change.
4. If recovery is needed, revert the GitOps change or restore the previous specification through your deployment process.

NudgeBee does not provide a universal automatic rollback on application degradation or a one-click infrastructure rollback for every workflow. Changing the live workflow version affects future runs; it does not revert completed resource changes.
