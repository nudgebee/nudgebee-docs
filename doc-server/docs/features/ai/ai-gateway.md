---
sidebar_position: 2
sidebar_label: AI Gateway
---

# AI Gateway

One endpoint in front of every LLM provider your organisation uses. Tools point at the gateway instead of at OpenAI, Anthropic, Bedrock or Vertex directly, and it handles credentials, routing, quotas and accounting on the way through — so you get per-user cost attribution and central control without changing anything in the tools themselves.

The gateway runs as its own service, `llm-gateway`. It is separate from `llm-server`, which is what powers NuBi's own investigations.

## Where to find it

| Surface | Path | For |
|---|---|---|
| **Usage** | Optimize → AI Gateway | Seeing what went through it |
| **Configuration** | Admin → AI & Tools → Gateway | Routing, tiers, quotas, privacy |

The usage tab is gated on a feature flag (`UI_ENABLE_LLM_GATEWAY`) as well as access. If the tab is missing for everyone, check the flag before checking permissions.

<!-- ![AI Gateway usage overview with spend, tokens and request volume](./img/ai-gateway-overview.png) -->

## Usage

Eight views over gateway traffic:

| View | Answers |
|---|---|
| **Connect** | How do I point a tool at the gateway? |
| **Overview** | What is total spend, token volume and request count? |
| **Models** | Which models are being used, and what does each cost? |
| **Users** | Who is spending? |
| **Requests** | What did an individual call look like? |
| **Sessions** | What happened across a whole conversation? |
| **Tools** | Which tools are calling through the gateway? |
| **Governance** | Where are quotas biting, and what is being blocked? |

Charts group by hour or by day.

## Configuration

### Tier aliases

Provider-agnostic model names any tool can send as the `model` — `nb-smart`, for example. The gateway resolves the alias to a concrete model.

This is what lets you change models centrally. A tool asking for `nb-smart` keeps working when you remap that tier from one provider to another; a tool hard-coding `gpt-4o` does not. **Reset** restores the shipped default for a tier.

A tier needs a credential for whichever provider its target model belongs to.

### Routing rules

Rules are evaluated in **priority order, lowest number first**. The first rule whose match conditions apply wins, and its target model replaces whatever the caller asked for.

Leave a field as **Any** or blank to match everything. The **Model** condition accepts either a concrete model id or an alias a client calls.

Use routing to send cheap traffic to a cheap model, keep a specific team on a specific provider, or fail a deprecated model over to its replacement without touching the callers.

### Quotas

A quota caps usage over a calendar window:

- **Metric** — request count, token count, or cost in USD.
- **Period** — minute, hour, day or month. Windows are UTC-aligned.
- **Scope** — the whole tenant, or a single user.

When a cap is hit, further requests get **HTTP 429** until the window resets. A tenant-wide cap and a per-user cap can both apply to the same request.

### Data privacy

**Capture request & response bodies** stores the full prompt and response for each request so admins can inspect their own traffic. It is **off by default**, and a platform administrator can disable it at the platform level, in which case the tenant control is locked and says so.

Turn it on when you are debugging a specific behaviour; leave it off otherwise — it stores whatever your prompts contain.

## Related

- [Egress Filter](./egress-filter.md) — scanning what leaves for secrets and PII
- [LLM Analyser](./llm-analyser.md) — cost analysis for NudgeBee's own AI usage
- [LLM Integrations](../../integrations/LLM/index.md) — connecting the providers behind the gateway
