---
sidebar_position: 7.1
sidebar_label: Account Summary
keywords: [cloud account summary, cloud cost summary, monthly forecast, credits, cost trend, account owner, insights]
---

# Account Summary

**Infra → Cloud → Summary** — the first tab of a cloud account.

## Resources and health

| Card | Shows |
|---|---|
| **Resource Summary** | The six services with the most resources. **Show N more** lists them all; click a service to open **Services** filtered to it. |
| **Insights** | Notable findings; each links to the tab where you can act on it. |
| **Errors** | **Fired Alarm Count** for the last 7 days, with a trend. |
| **Optimizations** | **Optimize Count** — click to open **Optimize → Right Sizing**. |
| **Recent Events** | The latest five events (Instance ID, Events, Severity, Created at), with a link to all events. |

## Cost Summary

Not shown for Cloud Foundry.

| Card | Shows |
|---|---|
| **Monthly forecast** | This month's expected spend, compared with last month's gross spend (**Prev mo (gross)**). Credits are excluded. |
| **Current Month (MTD)** | Spend so far this month, with the average daily cost. |
| **Credits / Discounts** | Shown only when the account has credits: this month, last month and **Net spend (MTD)**. |
| **Savings** | Savings estimated by the cloud provider. |

The **Cost Trend** chart groups spend by **Day**, **Week** or **Month** (default) for up to the last 6 months.

## Owner

Users with write access can set the account's **owner**. Workloads without an owner of their own inherit it, so alerts and recommendations reach the right team. See [Ownership](../user-management.md#ownership).

## Cloud Foundry

Cloud Foundry accounts show **App Health** (Running, Degraded, Stopped), **Top Resource Consumers**, **Spaces** and a metrics chart instead of the cost cards.

## Related

- [Cloud Accounts](./index.md)
- [Services & Inventory](./services-and-inventory.md)
- [Optimize](./optimize.md)
