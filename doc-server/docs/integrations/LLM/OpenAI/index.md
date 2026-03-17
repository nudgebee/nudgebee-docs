# OpenAI Integration

This guide provides detailed instructions for integrating OpenAI with NudgeBee's LLM Server and RAG Server applications.

## Overview

OpenAI provides REST API access to powerful language models including GPT-5, GPT-4o, GPT-4, GPT-3.5-Turbo, and Embeddings models. These models are widely used for natural language understanding, generation, and embedding tasks. NudgeBee supports both native OpenAI API and OpenAI-compatible endpoints.

## Prerequisites

- OpenAI account with API access
- OpenAI API key with appropriate permissions
- Billing configured for your OpenAI account (for paid models)

## Setting up OpenAI Credentials

1. **Create an OpenAI Account**:
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Sign up or log in to your account
   - Complete account verification if required

2. **Configure Billing** (if using paid models):
   - Go to [Billing Settings](https://platform.openai.com/account/billing)
   - Add a payment method
   - Set usage limits if desired

3. **Generate API Key**:
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Provide a descriptive name for the key
   - Copy the API key (it will only be shown once)
   - Store the key securely

## Integrating with LLM Server

1. **Configure OpenAI in LLM Server**:

   Add the following configuration to your LLM Server settings:

```bash
LLM_PROVIDER=openai
LLM_MODEL_NAME=<Model name> # e.g., "gpt-5", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo"
LLM_PROVIDER_API_KEY=<Your OpenAI API key>
LLM_PROVIDER_API_ENDPOINT=<Custom endpoint URL> # Optional, for OpenAI-compatible endpoints
LLM_PROVIDER_API_TYPE=openai # Optional, defaults to "openai"
```

### Available Models

- **GPT-5 Series**: `gpt-5`, `gpt-5-turbo`, `gpt-5-preview`
- **GPT-4o Series**: `gpt-4o`, `gpt-4o-mini`, `gpt-4o-2024-11-20`, `gpt-4o-2024-08-06`
- **GPT-4 Turbo**: `gpt-4-turbo`, `gpt-4-turbo-2024-04-09`, `gpt-4-turbo-preview`
- **GPT-4**: `gpt-4`, `gpt-4-32k`, `gpt-4-0613`
- **GPT-3.5 Turbo**: `gpt-3.5-turbo`, `gpt-3.5-turbo-16k`

## Integrating with RAG Server

1. **Configure OpenAI in RAG Server**:

   Add the following configuration to your RAG Server settings:

```bash
EMBEDDINGS_PROVIDER=openai
EMBEDDINGS_MODEL_ID=<Embedding model name> # e.g., "text-embedding-ada-002", "text-embedding-3-large"
EMBEDDINGS_API_KEY=<Your OpenAI API key>
EMBEDDINGS_API_ENDPOINT=<Custom endpoint URL> # Optional, for OpenAI-compatible endpoints
EMBEDDINGS_API_TYPE=openai # Optional, defaults to "openai"
EMBEDDINGS_API_VERSION=<API version> # Optional
```

### Available Embedding Models

- `text-embedding-ada-002` - Legacy model (1,536 dimensions)
- `text-embedding-3-small` - Smaller, faster model (1,536 dimensions)
- `text-embedding-3-large` - Higher quality model (3,072 dimensions)

## Rate Limits and Quotas

OpenAI API has rate limits based on your account tier:

- **Free Tier**: Limited requests per minute (RPM) and tokens per minute (TPM)
- **Tier 1-5**: Progressively higher limits based on usage and payment history
- Rate limits vary by model (GPT-4 typically has lower limits than GPT-3.5)

To view your current rate limits:
- Go to [Rate Limits](https://platform.openai.com/account/rate-limits)
- Check your tier and limits for each model
- Usage is automatically tracked and displayed in your dashboard

For higher rate limits, increase your usage tier by:
- Making consistent API usage
- Maintaining payment history
- Contacting OpenAI support for enterprise needs
