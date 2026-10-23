---
sidebar_position: 5.6
sidebar_label: Budgets & Limits
---

# Budgets & Limits

**AI & Tools → Budgets & Limits**

Limits on how much NudgeBee's AI may spend or how many AI conversations it may run, per tenant and per account, plus the usage behind them and the model prices used to compute cost. Two views: **Usage & Limits** and **Model Pricing**.

Anyone with access to the tab can see usage. Creating and changing budgets, history and prices needs a **tenant admin**. Users see their own usage, read-only, in **b-Cortex → Insights → My Usage**.

## What is limited

Budgets apply separately to two modules:

| Module | Covers |
|---|---|
| **Event Analysis (Automated)** | Automatic investigations of events and alerts |
| **NuBi Chat (User)** | Conversations people start in Ask NudgeBee, Slack or Teams |

For each module, at **tenant** level and at **account** level, you can set up to four limits:

| Limit | Resets |
|---|---|
| **Monthly Cost** (USD) | At the start of each month (UTC) |
| **Daily Cost** (USD) | At midnight (UTC) |
| **Monthly Count** (conversations) | At the start of each month (UTC) |
| **Daily Count** (conversations) | At midnight (UTC) |

Budgets are per tenant and per account, not per user. To cap individual users, use quotas on the [AI Gateway](./ai-gateway.md).

### When a limit is reached

The next request for that module is **refused** with a message saying the daily or monthly budget, or the investigation count limit, was exceeded for your organization or for this account. Limits are checked tenant first, then account. Nothing is refused if the budget check itself cannot run. When the tenant budget is exhausted, the tab shows *"Tenant budget exhausted"* and asks you to contact support to re-enable NuBi and event analysis.

### Defaults

With no budget configured, system defaults apply: a **monthly cost** limit per module (tenant $1,000; account $600 for Event Analysis and $400 for NuBi Chat). Daily cost and count limits exist but are off by default. Each limit also has a platform maximum that a budget cannot exceed.

## Usage & Limits

The header summarizes this month: **Monthly spend — tenant**, **Monthly spend — account** (when an account is selected), **Conversations (month)** and **Today's spend**. A table shows, per module and per scope (Tenant, Account), the spend and count against **Monthly $**, **Daily $**, **Monthly #** and **Daily #** — *No limits* where none is set — and marks a scope **Exhausted** when it hits a limit.

**Active Budgets** lists the budgets you have configured, with **Edit** and **Delete** (which reverts to the defaults). Budgets for other accounts are in a collapsible section below. With nothing configured: *"No custom configurations for tenant or this account. System defaults are being applied."*

### Add a budget

**Add Budget** opens *Create Budget Configuration*:

1. **Scope** — **Tenant** or **Account** (then pick the account).
2. **Apply to** — **Both Modules**, **Event Analysis (Automated)** or **NuBi Chat (User)**.
3. Turn on the limits you want and enter a value: **Monthly Cost**, **Daily Cost**, **Monthly Count**, **Daily Count**.

If a budget already exists for that scope and module, you are asked to edit it from **Active Budgets** instead.

**Disable All Budget Checks** bypasses every cost and count limit for the scope. Only NudgeBee super admins can turn it on; saving the budget as anyone else turns it back off.

### History

Every budget change, with **User** (system changes show *SYSTEM*), **Timestamp**, **Module**, **Budget Type**, **Previous Value**, **Updated Value** and **Action** (Created, Updated, Deleted). In the account view it shows that account's changes.

## Model Pricing

The rates used to turn model usage into cost, in **USD per 1M tokens**.

| Column | Meaning |
|---|---|
| **Model**, **Provider** | The model |
| **Input**, **Output**, **Cached** | Rates per 1M tokens |
| **Tiered rate** | Whether the price changes above a context size |
| **Max output**, **Context window** | Model limits |
| **Source** | **Built-in** rate, or a **Custom rate** your tenant set |

Filter by name, **Provider** or **Source**. Tenant admins can **Add price** (Provider, Model, Input rate, Output rate, Cached input rate, Cache creation rate) or edit a rate — for example for a model hosted on your own provider. A model with no price counts as **$0**, so spend for it will not appear against budgets until it has a rate.

## Related

- [AI & Tools](./ai-and-tools.md)
- [LLM Analyser](./llm-analyser.md) — where the spend goes, by conversation, model, agent and user
- [AI Gateway](./ai-gateway.md) — per-user quotas
