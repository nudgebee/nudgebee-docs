---
sidebar_position: 1
sidebar_label: Add an LLM Provider (UI)
keywords: [add llm provider, llm integration, test connection, organisation default, custom provider, openrouter, vllm, ollama, azure openai, bedrock, vertex ai]
---

# Add an LLM Provider

**Admin → Integrations → LLM → Add LLM Provider**

This is the usual way to connect NuBi to a model. The provider pages in this section explain what to prepare in each provider's console; this page explains the form itself. (Self-hosted installs can also configure a provider with environment variables — see [LLM Integrations](./index.md).) A provider configured here takes precedence over environment variables.

## The form

| Field | What to enter |
|---|---|
| **Accounts** | Leave empty to let every account in the organisation use this config, or pick the accounts that may use it |
| **Use as the organisation default** | Make this the model NuBi uses unless an account has its own default |
| **Use as the default for the selected accounts** | Shown when you pick accounts: make it the default for those accounts |
| **Integration Config Name** | A unique name for this configuration |
| **LLM Provider** | `anthropic`, `azure`, `bedrock`, `googleai`, `huggingface`, `openai`, `custom`, `sagemaker` or `vertexai`. Changing it clears the model and credential fields |
| **LLM Model Name** | The primary model, for example `gpt-5.5` or `claude-sonnet-5-5`. For Azure, enter the **deployment name** |

The credential fields that follow depend on the provider:

| Provider | Fields |
|---|---|
| `openai` | **API Key**; optional **API Endpoint** and **API Type** |
| `anthropic` | **API Key**, **API Endpoint** |
| `googleai` (Gemini API) | **API Key** |
| `vertexai` | **API Key** (required by the form but not used — Vertex AI uses the pod's service account; enter any placeholder). See [Vertex AI](./Google/vertex-ai.md) |
| `azure` | **Authentication** (**API key** or **OAuth2 client credentials**), **API Key** (with API-key auth) or the OAuth2 fields, **API Endpoint** (`https://<resource>.openai.azure.com`), **API Style** (**v1 (recommended)** or **Classic (api-version)**); **API Version** only with Classic, optional **Extra request headers (JSON)**. See [Azure OpenAI](./Azure/azure-openai.md) |
| `bedrock` | **Region**, **AWS Access Key**, **AWS Secret Key** (required) |
| `sagemaker` | **API Endpoint** (the SageMaker endpoint name), **Region** |
| `huggingface` | **API Key**, **API Endpoint**, optional **API Type**, **Adapter ID** and **Require Adapter ID** |
| `custom` | **Authentication**, **API Key** (or OAuth2 fields), **API Endpoint**, optional **API Type** and **Extra request headers (JSON)**. **API Version** and **Deployment Name** appear when **API Type** is **Azure (api-key header)** or **Azure AD (Bearer token)** |

### Custom: OpenRouter, vLLM, Ollama and other gateways

Use **custom** for any service that exposes the OpenAI Chat Completions API — OpenRouter, vLLM, Ollama, Groq, Together, DeepSeek, LiteLLM and most AI gateways. Enter the base URL **including the version segment**, for example `https://openrouter.ai/api/v1` or `http://ollama.example.com:11434/v1`; `/chat/completions` is appended to it, so leaving out `/v1` returns 404.

For gateways that need a bearer token instead of a static key, choose **OAuth2 client credentials** and fill in **OAuth2 Token URL**, **OAuth2 Client ID**, **OAuth2 Client Secret** and, optionally, **OAuth2 Scope**. For Azure-shaped gateways set **API Type** to **Azure (api-key header)** or **Azure AD (Bearer token)**. Custom also offers **Turn off model reasoning** for self-hosted reasoning models that spend their whole budget thinking.

### Advanced options

- **Fallback** — **No fallback**, an **Existing configured model**, or **Configure new** with its own credentials.
- **Per-category overrides** — use a different model, or a different provider, for **reasoning**, **retrieval** and **summary** work. Leave Provider as **Inherit** to use the settings above.
- **Per-agent overrides** — pin a model for a specific agent.
- **Model context window (tokens)** — for self-hosted deployments (custom, Hugging Face, SageMaker, Vertex AI, Bedrock), set this to your deployment's max model length.
- **Pricing** — override the built-in token prices used in [Budgets & Limits](../../features/ai/budgets-and-limits.md).

## Test Connection

**Test Connection** sends a short real request to every provider and model the form uses — the main model, each override and the fallback — and **Save** stays disabled until it passes. When you edit a configuration that is already connected, you can save without testing again. For Vertex AI the test checks the configuration but does not call the model.

## Related

- [LLM Integrations](./index.md)
- [AI & Tools → Providers](../../features/ai/ai-and-tools.md)
- [Budgets & Limits](../../features/ai/budgets-and-limits.md)
