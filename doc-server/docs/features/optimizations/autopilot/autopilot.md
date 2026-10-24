---
sidebar_position: 4
keywords: [autopilot, auto optimize, auto runbook, automation, self-healing]
---
# Autopilot

NudgeBee's automated actions now live in two places:

- **[Auto Optimize](./auto_optimize/index.md)** (**Optimize → Auto Optimize**) applies right-sizing for you — continuous or scheduled vertical right-sizing, horizontal right-sizing and PVC right-sizing — with optional [approval](./auto_optimize/approvals.md) before each run.
- **[Automations](../../workflow-builder/index.md)** (the Workflow Builder) handles everything else: responding to events and recommendations with tasks such as restarting workloads, deleting pods, draining nodes, creating tickets, sending notifications and calling APIs. The former Auto Runbook actions are Workflow Builder tasks.

Every automated change is recorded — Auto Optimize runs in the rule's history and in [Resolutions](../resolutions.md), automation runs in their execution history.

## Related

- [Auto Optimize](./auto_optimize/index.md)
- [Automations](../../workflow-builder/index.md)
- [Optimize overview](../index.md)
