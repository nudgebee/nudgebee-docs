---
sidebar_position: 7.4
sidebar_label: Optimize
keywords: [cloud recommendations, right sizing, infra upgrade, configuration, security findings, apply mitigation, create alarm, recommendation resolution]
---

# Optimize (Cloud)

**Infra → Cloud → Optimize** lists the account's recommendations. Each service tab has the same view filtered to that service.

| Sub-tab | Recommendations |
|---|---|
| **Right Sizing** | Over- or under-sized resources, with savings |
| **Configuration** | Settings worth changing, including missing alarms |
| **Security** | Findings from AWS Security Hub, GCP Security Command Center or Microsoft Defender for Cloud |
| **Infra Upgrade** | Older instance or service generations to move off, with savings |
| **Recommendation Resolution** | Every fix NudgeBee applied or tried to apply (account level only) |

## Reading the list

- **Cards:** **Total Recommendations**; **Right Sizing** and **Infra Upgrade** also show estimated savings per year. Rows show savings per month. Savings are in USD.
- **Filters:** **Rule Name**, **Severity**, **Status** (defaults to Open and In Progress) and **Service Name**.
- **Columns:** **Severity**, **Rule Name**, **Instance**, **Recommendation**, and **Savings** on Right Sizing and Infra Upgrade.
- **Expand a row** for **Evidence**, **Description**, **Mitigation** and **Audit History**.

## Acting on a recommendation

- **Ask NuBi** — get an explanation or a plan.
- **Create Ticket** — once created, the row shows the ticket ID.
- **Apply Mitigation** (in the **Mitigation** tab) — runs the steps in the mitigation, which you can review first; some recommendations let you pick a **Target Instance Type**. Needs write access, an account that isn't in AWS Read-Only mode, and a recommendation that isn't closed or dismissed.
- **Create Alarm** (Configuration recommendations that suggest an alarm) — pick where the alarm notifies: SNS topics on AWS, action groups on Azure, notification channels on GCP. Needs write access and an account not in Read-Only mode.

Some recommendations are guidance only — apply them in the cloud console. The **Fixes** column of [Supported Cloud Services](./supported-services.md) shows what NudgeBee can apply.

## Recommendation Resolution

The history of applied fixes: **Recommendation**, **Severity**, **Status**, **Est. Savings**, **Resolver**, **Type** and **Updated At**. Filter by **Status** (All, Success, Failed, In Progress), **Recommendation** or **Resolver**. Failed fixes can be retried; expand a row for **Details** and **Message**.

## Related

- [Supported Cloud Services](./supported-services.md)
- [Resource Actions](./resource-actions.md)
- [Cost Optimization](../optimizations/index.md)
