---
sidebar_position: 2
sidebar_label: Approvals
keywords: [auto optimize approval, approve rightsizing, reject, approval expired, require approval]
---

# Auto Optimize Approvals

When a rule has **Require approval** on, each run lists its planned changes and waits for an account editor to approve them before anything is applied. Continuous Vertical Right Sizing never waits for approval.

## Review a run

**Optimize → Auto Optimize → Approvals** lists pending and past requests:

| Column | Meaning |
|---|---|
| **Automation** | The rule |
| **Changes** | How many changes are planned |
| **Status** | *Waiting*, *Approved*, *Rejected*, *Expired* or *Cancelled* |
| **Expires / Decided by** | When it expires, or who decided |
| **Comment**, **Planned at** | The reviewer's comment, and when the run was planned |

**Review** (write access) opens *Review planned changes* with each **Workload** and **Planned change**. Choose **Approve and apply** or **Reject**. A comment is optional when approving and required when rejecting.

In Slack and Microsoft Teams the request arrives with **Approve** and **Reject** buttons; other channels get a link to this page.

## What to expect

- A request stays open for **24 hours**. If nobody decides, it expires and nothing is applied.
- When you approve, a change is skipped (with a reason) if its recommendation is no longer open, has changed since you reviewed it, or already has a pull request or ticket in progress.
- Editing a rule's settings, or disabling it, cancels its pending requests.
- While a request is pending, the rule can't be run again manually.

## Related

- [Auto Optimize](./index.md)
- [Resolutions](../../resolutions.md)
