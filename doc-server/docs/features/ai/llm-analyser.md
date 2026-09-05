---
sidebar_position: 3
sidebar_label: LLM Analyser
---

# LLM Analyser

**Optimize → LLM Analyser**

Where NudgeBee's own AI spend goes. Every investigation, agent run and tool call has a token cost; this is the breakdown, by conversation, model, agent, tool and user.

The tab is gated by the per-tenant `LLM_ANALYSER` feature flag — see [Tenant Settings → Features](../tenant-settings.md#features). If nobody can see it, that flag is the first thing to check.

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
| **Cost Report** | A scheduled summary, delivered on a cadence you set. |

Group by day, week or month. Filters combine with **Any of** or **All of**, so you can isolate, say, every conversation that used a particular model *and* a particular agent.

## Conversation detail

Opening a conversation shows the cost of each step, which is how you find out that one expensive investigation was a single agent looping on a tool rather than the model being pricey.

## Cost reports

Schedule a recurring account cost report so the numbers arrive without anyone opening the tab. Configure the schedule from the Cost Report view.

## Model pricing

Spend is computed from a model price list. Where you use a model NudgeBee does not have a price for — a self-hosted model, a negotiated rate, a new release — set the price yourself so the totals stay real. Prices are per tenant.

## LLM Analyser or AI Gateway?

They measure different things and both can be true at once:

- **LLM Analyser** — what *NudgeBee's own agents* spent, broken down by the platform concepts that caused it (investigation, agent, tool).
- **[AI Gateway](./ai-gateway.md)** — what *your organisation's tools* spent going through the gateway, broken down by caller.

## Related

- [AI Gateway](./ai-gateway.md)
- [Cost Optimization](../optimizations/index.md)
