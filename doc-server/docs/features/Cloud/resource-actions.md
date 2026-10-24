---
sidebar_position: 7.3
sidebar_label: Resource Actions
keywords: [start instance, stop instance, reboot, restart cloud sql, pause azure sql, ssm run command, ecs redeploy, scale ecs service, action history]
---

# Resource Actions

You can start, stop and restart some cloud resources directly from their service tab. Actions need **write access** to the account, and the account must not be in AWS **Read-Only** mode (see [Access modes](./access-modes-and-real-time-events.md)). The actions offered depend on the resource's current state.

| Resource | Actions |
|---|---|
| EC2, Azure VM, Compute Engine | **Start Instance**, **Stop Instance**, **Reboot Instance** |
| EC2 only | **Run Command…** — run an AWS Systems Manager command: *Check disk space*, *Check memory*, *Update SSM agent* or *Install CloudWatch agent* |
| RDS | **Start Instance**, **Stop Instance**, **Reboot Instance** |
| Cloud SQL | **Start Instance**, **Stop Instance**, **Restart Instance** |
| Azure SQL Databases | **Resume Database**, **Pause Database** |
| ECS services | **Redeploy Service**, **Force Redeploy**, **Scale Service** (set the desired number of tasks) |

Azure SQL Managed Instances have no actions. Storage buckets, ECS clusters and ECS tasks have no available actions yet.

## Confirming an action

Disruptive actions — **Stop Instance**, **Force Redeploy** and **Pause Database** — ask you to type the resource's name to confirm. Other actions ask for a simple confirmation.

## Action History

Each resource's **Action History** tab lists the actions run on it from NudgeBee.

## Permissions in the cloud

NudgeBee runs these actions with the access you granted when connecting the account. On AWS that is the **Standard** access mode; the actions it needs are listed in [Standard access mode with a manual role](./AWS.md#standard-access-mode-with-a-manual-role).

## Related

- [Services & Inventory](./services-and-inventory.md)
- [Access modes & real-time events](./access-modes-and-real-time-events.md)
- [Optimize](./optimize.md) — applying recommendation fixes
