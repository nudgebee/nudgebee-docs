---
sidebar_label: Anthropic
sidebar_position: 2
---

# Anthropic Integration

Connect Claude models to NudgeBee's LLM Server, or route your organisation's own traffic to Anthropic through the [AI Gateway](../../../features/ai/ai-gateway.md).

## Overview

Anthropic provides direct API access to the Claude model family. NudgeBee supports Anthropic as a first-class LLM provider in two places:

- **LLM Server** — the models that power [NuBi](../../../features/ai/), investigations, RCA generation and the pre-built agents.
- **AI Gateway** — a passthrough route (`/anthropic/v1/messages`) so tools in your organisation can reach Anthropic through the gateway and pick up its metering, quotas and routing.

If you reach Claude through AWS rather than directly, use [AWS Bedrock](../Aws/bedrock.md) instead — same models, different credentials and endpoint.

## Prerequisites

- An Anthropic account with API access at [console.anthropic.com](https://console.anthropic.com)
- An API key (they begin `sk-ant-`)
- Billing configured

## Generating an API key

1. Sign in at [console.anthropic.com](https://console.anthropic.com).
2. Go to **API Keys** and create a new key.
3. Give it a descriptive name and copy it — the value is shown once.
4. Store it securely; it is a bearer credential for your account's spend.

## Integrating with LLM Server

```bash
LLM_PROVIDER=anthropic
LLM_MODEL_NAME=<model id>            # e.g. claude-opus-5
LLM_PROVIDER_API_KEY=<your sk-ant-… key>
LLM_PROVIDER_API_ENDPOINT=           # optional, for a proxy or gateway in front of Anthropic
LLM_MODEL_FALLBACKS=                 # optional, comma-separated model ids to fall back to
```

### Extended thinking

```bash
LLM_ANTHROPIC_THINKING_ENABLED=true   # default: false
```

Claude models can reason before answering. Turning this on generally improves multi-step investigation quality and costs more tokens per call. Leave it off for routine work and turn it on if you find investigations stopping short of a root cause.

### Model ids

| Model | Model id | Context |
|---|---|---|
| Claude Opus 5 | `claude-opus-5` | 1M |
| Claude Opus 4.8 | `claude-opus-4-8` | 1M |
| Claude Opus 4.7 | `claude-opus-4-7` | 1M |
| Claude Opus 4.6 | `claude-opus-4-6` | 1M |
| Claude Sonnet 5 | `claude-sonnet-5` | 1M |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M |
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200K |

Model ids are complete as written — do not append a date suffix.

**Which to pick.** Opus for investigation and RCA quality, Sonnet for a cheaper default on high-volume work, Haiku for classification and routing where latency matters more than depth. Current pricing is on [Anthropic's pricing page](https://www.anthropic.com/pricing).

## Embeddings and RAG Server

:::caution Anthropic does not serve embeddings
There is no `EMBEDDINGS_PROVIDER=anthropic`. RAG Server must use a different provider for embeddings, even when LLM Server is on Anthropic — a perfectly normal split.
:::

Supported embeddings providers are `bedrock` (the default), `openai`, `azure`, `googleai`, `huggingface`, `ollama` and `sagemaker`. Configure one of those:

```bash
EMBEDDINGS_PROVIDER=openai
EMBEDDINGS_MODEL_ID=<embedding model>
EMBEDDINGS_PROVIDER_API_KEY=<key for that provider>
```

See [OpenAI](../OpenAI/index.md), [AWS Bedrock](../Aws/bedrock.md) or [Ollama](../Ollama/index.md) for the provider you choose.

## Using Anthropic through the AI Gateway

The gateway recognises `anthropic` as a provider and exposes an Anthropic-shaped route, so a tool already speaking the Messages API can be pointed at the gateway with only a base-URL change.

Configure the gateway's Anthropic credential with `GATEWAY_ANTHROPIC_API_KEY`, or supply a tenant key from **Admin → AI & Tools → Gateway**.

Once it is routed through the gateway you get per-user cost attribution, quotas and central model remapping — see [AI Gateway](../../../features/ai/ai-gateway.md). Point a tool at a [tier alias](../../../features/ai/ai-gateway.md#tier-aliases) rather than a concrete model id and you can change models later without touching the tool.

---

## Troubleshooting

### `401 authentication_error`

The key is wrong, revoked, or has whitespace around it. Anthropic keys start with `sk-ant-`. Re-copy the key from the console; it is shown only at creation, so if you no longer have it, issue a new one.

### `404 not_found_error` naming the model

The model id is wrong or your organisation does not have access to it. Check the id against the table above — a date suffix appended to a current model id produces exactly this error.

### `429 rate_limit_error`

You have hit a per-minute request or token limit. Bulk log analysis and large investigations are the usual triggers. Either move to a higher tier in the Anthropic console, or set `LLM_MODEL_FALLBACKS` so overflow lands on another model instead of failing.

### `400` mentioning credit balance

Billing is not configured, or the balance is exhausted. Check **Billing** in the Anthropic console.

### Investigations stop before reaching a root cause

Try `LLM_ANTHROPIC_THINKING_ENABLED=true`, and prefer an Opus model over Haiku for investigation work.

## Related

- [LLM Integrations overview](../index.md)
- [AWS Bedrock](../Aws/bedrock.md) — Claude models via AWS
- [AI Gateway](../../../features/ai/ai-gateway.md)
