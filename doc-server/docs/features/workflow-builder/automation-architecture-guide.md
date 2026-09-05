---
id: automation-architecture-guide
title: "Choosing Between Event Playbooks, Workflows, and AutoOptimize"
sidebar_label: Playbooks vs Workflows vs AutoOptimize
sidebar_position: 7
keywords: [playbooks vs workflows, autooptimize vs workflows, automation architecture, choosing automation, when to use playbooks]
intent: inspect
provider: all
---

# Choosing Between Event Playbooks, Workflows, and AutoOptimize

Choose the mechanism according to the work you need to perform and the controls available for that action.

| Mechanism | Use it for | What to verify |
| --- | --- | --- |
| Event playbooks | Attaching diagnostic actions and evidence to event investigations | The configured actions, permissions, and their possible side effects |
| Workflows | Multi-step orchestration using event, optimization, schedule, webhook, or manual triggers | Trigger input, task parameters, approvals, retry behavior, and recovery |
| AutoOptimize | Supported scheduled optimization actions | Target resources, algorithm/settings, schedule, and approval configuration |

## Investigation

Use diagnostic actions to collect relevant metrics, logs, or resource information. Review each action before enabling it: a script or query is not made read-only merely because it is part of a diagnostic playbook.

## Operational response

Use a workflow when you need branching, notifications, tickets, or changes across multiple steps. Select the trigger lifecycle phase that provides the required input. If a task needs completed investigation results, do not assume an event-created trigger already contains them.

See [Event-Triggered Automation](./create-event-automation.md) and [Approvals and Operations](./workflow-operations-approvals.md).

## Scheduled optimization

Use [Auto Optimize](../optimizations/autopilot/auto_optimize/index.md) for the optimization categories supported by its configuration form. Use a recommendation-triggered workflow for custom follow-up logic, starting with a notification and verifying the payload before adding changes.

Resource changes can affect availability. Establish verification and recovery steps before enabling them; neither workflow history nor a previous workflow version provides a universal automatic infrastructure rollback.
