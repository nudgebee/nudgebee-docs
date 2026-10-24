---
sidebar_position: 1.25
sidebar_label: Automatic Event Analysis
keywords: [event analysis, alert investigation, auto analysis, investigate, view analysis, generate rca, remediation loop, why was my alert not analysed]
---

# Automatic Event Analysis

When an alert or event arrives, NuBi can investigate it on its own — gather evidence, find the likely root cause and write it up — before anyone opens it. This page explains which events are analysed, the settings that control it, and where the results appear.

## Which events are analysed

By default NuBi analyses **high-priority events** automatically. An event is **not** analysed automatically when:

- **Automatic event analysis** is off for the tenant or the account (see [Settings](#settings));
- triage suppressed or dropped it;
- it is a *HighErrorCriticalLogs* or *Anomaly* event, or an *ApplicationAPIFailures* event with status 400, 401, 403, 404 or no status;
- its namespace is in the account's **Namespaces Excluded from Auto-Analysis**;
- its source isn't in the tenant's allowed sources, when NudgeBee support has set an allowlist;
- the AI budget is exhausted — see [Budgets & Limits](./budgets-and-limits.md).

Lower-priority events can be included by tenant rules — per event type, with a minimum priority — that NudgeBee support configures for you. Any event can still be investigated by hand with **Investigate**.

An automation's *investigate event* task runs whatever the tenant and account switches say; AI budget limits still apply.

## Where results appear

- **Event lists** show **Investigate** for an event that hasn't been analysed and **View Analysis** for one that has.
- **The analysis page** shows the investigation. **Ask a follow up** continues it as a NuBi conversation in the chat drawer.
- **Generate RCA** on the analysis page writes a root cause analysis using your [RCA Format](./rca-format.md) template. It appears when no RCA exists yet and you have write access to the account.
- **Slack and Teams** — an alert card's **Ask Nubi to Analyse!** / **Ask Nubi** button posts the analysis in the card's thread (reusing an existing analysis if there is one). With **Post event analysis to chat** on, analyses are posted to the incident's channel as they complete.

## Settings

### Tenant features

**Admin → Tenant Settings → Features**, category *AI investigation & events*:

| Feature | What it does | Default |
|---|---|---|
| **Automatic event analysis** | Investigates events as they arrive. Can also be turned off for one account — useful when trialling, or for a noisy account that should be analysed only on request. | On |
| **Investigate events without service labels** | Analyses events even when they carry no service label, accepting lower-confidence results while labelling is fixed upstream. | Off |
| **Post event analysis to chat** | Delivers each analysis into the incident's Slack channel or thread as it completes. | Off |
| **AI alert prioritisation** | Classifies each alert and applies a fixed policy to set a P0–P3 priority, instead of the severity × environment formula. Priority decides what is analysed automatically. | On for new tenants |
| **Auto-raise fix PRs** | Opens a draft pull request with a proposed fix when log analysis finds a code-level cause. Nothing merges automatically. | Off |
| **Alert remediation loop** | Builds a fix plan for each alert and posts it in the alert's Slack thread, where each step can be run or declined. | Off |

### Per account

In **Admin → Integrations**: for a Kubernetes account, the row menu **Settings** → **AI Event Analysis** section; for a cloud account, the row action **AI Event Analysis Settings**. The namespace settings exist only for Kubernetes accounts.

| Setting | Meaning |
|---|---|
| **Reuse the analysis of a recent similar event** | Reuse a finished analysis instead of investigating again |
| **Reuse Window (hours)** | How long a finished analysis is reused, for similar events and when reopening the same event. Blank uses the platform default. |
| **Always-Fresh Namespaces** | Namespaces whose events are always investigated fresh, never reused |
| **Namespaces Excluded from Auto-Analysis** | Namespaces never analysed automatically. You can still investigate them manually. |

## Alert remediation loop (Slack)

With **Alert remediation loop** on, NuBi posts a fix plan in the alert's Slack thread. Each step has **Run** and **Decline**; **Run** asks *Run this step?* first. Your Slack account must be linked to your NudgeBee user — otherwise NuBi replies that it can't take your answer until you link it.

## Troubleshooting: "my alert wasn't analysed"

1. Check the event's priority — only high-priority events are analysed automatically.
2. Check **Automatic event analysis** for the tenant and the account, and the account's excluded namespaces.
3. Check the event type against the exclusions above, and whether triage suppressed it.
4. Check the budget in [Budgets & Limits](./budgets-and-limits.md).
5. Use **Investigate** to run it by hand.

## Related

- [What NuBi Can Do](./nubi.md)
- [RCA Format](./rca-format.md)
- [Tenant Settings → Features](../tenant-settings.md#features)
- [Alert Pipeline Troubleshooting](../troubleshooting/alert-pipeline-troubleshooting.md)
