---
sidebar_position: 3
sidebar_label: LLM Analyser
---

# LLM Analyser

**Optimize → LLM Analyser**

Where NudgeBee's own AI spend goes. Every investigation, agent run and tool call has a token cost; this is the breakdown, by conversation, model, agent, tool and user.

The tab is gated by the tenant feature **AI usage and cost tab** (flag id `LLM_ANALYSER`) — see [Tenant Settings → Features](../tenant-settings.md#features). If nobody can see it, that feature is the first thing to check. Anyone with read access to the account can open it.

<!-- ![LLM Analyser overview showing spend over time and cost by model](./img/llm-analyser-overview.png) -->

## Views

| View | Answers |
|---|---|
| **Overview** | What is total spend, and how is it trending? |
| **Conversations** | Which investigations cost the most? Drill into any one for its per-step cost. |
| **Models** | What is each model costing, and how much traffic does it take? |
| **Agents** | Which agents are expensive? |
| **Tools** | Which tool calls are driving token use? |
| **Users** | Who is generating the spend? |
| **Cost Report** | A daily AI cost digest posted to Slack (tenant-wide roles only). |
| **Critiques** | Quality reviews of answers — **Overview**, **Agents**, **Themes**, **Browse** (tenant admins). |

Group by day, week or month, and pick a range (**Last 24 Hours**, **Current Week**, **Current Month**, **Last Month** or custom).

Filters: **Account**, **Model**, **Provider**, **Agent**, **Source** and **User**.

The **Overview** tiles show Total AI cost, Cache storage, Cache hit rate, Cache savings, Avg cost / run, Runs and Tokens (in/out).

## Conversation detail

Opening a conversation shows the cost of each step — **Task**, **Models**, **Total calls**, **Latency**, **Tokens**, **Cost**, **Status**, **% run** — with quick views *Top 5 by cost*, *Top 5 by latency* and *Show failed*. That is how you find out that one expensive investigation was a single agent looping on a tool rather than the model being pricey.

## Cost reports

Turn on the tenant feature **Daily AI cost digest**, then in the Cost Report view open **Cost report schedule** and choose the **Slack channel** and **Send to Slack at** time. The digest shows daily and month-to-date AI spend.

## Model pricing

Spend is computed from a model price list. Where you use a model NudgeBee does not have a price for — a self-hosted model, a negotiated rate, a new release — set the price yourself in [Budgets & Limits → Model Pricing](./budgets-and-limits.md#model-pricing) so the totals stay real. Prices are per tenant.

## LLM Analyser or AI Gateway?

They measure different things and both can be true at once:

- **LLM Analyser** — what *NudgeBee's own agents* spent, broken down by the platform concepts that caused it (investigation, agent, tool).
- **[AI Gateway](./ai-gateway.md)** — what *your organisation's tools* spent going through the gateway, broken down by caller.

## Related

- [AI Gateway](./ai-gateway.md)
- [Cost Optimization](../optimizations/index.md)
