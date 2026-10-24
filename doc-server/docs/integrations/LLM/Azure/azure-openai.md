# Azure OpenAI Service Integration

This guide provides detailed instructions for integrating Azure OpenAI Service with NudgeBee's LLM Server and RAG Server applications.

## Overview

Azure OpenAI Service provides REST API access to OpenAI's powerful language models including GPT-4, GPT-3.5-Turbo, and Embeddings models. By running these models on Azure, you benefit from enterprise-grade security, compliance, regional availability, and high availability guarantees.

## Prerequisites

- Azure subscription with access to Azure OpenAI Service
- Appropriate permissions to create and manage Azure resources
- Azure OpenAI resource deployed in your subscription

## Setting up Azure OpenAI Credentials

1. **Create Azure OpenAI Resource**:
   - Navigate to the [Azure Portal](https://portal.azure.com)
   - Search for "Azure OpenAI"
   - Click "Create" and follow the wizard:
     - Select subscription, resource group, region
     - Choose a name for your resource
     - Select pricing tier
     - Review and create

2. **Deploy a Model**:
   - In your Azure OpenAI resource, select "Model deployments"
   - Click "Create new deployment"
   - Select a model (e.g., "gpt-35-turbo" or "gpt-4")
   - Set the deployment name — name it after the model (for example `gpt-5-mini`) so NudgeBee can detect the model's limits and pricing
   - Configure capacity
   - Click "Create"

3. **Get API Credentials**:
   - In your Azure OpenAI resource, go to "Keys and Endpoint"
   - Note down:
     - Endpoint URL
     - API Key
     - Resource Name
     - Deployment Name

## Add it in NudgeBee (UI)

In **Admin → Integrations → LLM → Add LLM Provider**, choose **azure** and fill in:

| Field | What to enter |
|---|---|
| **LLM Model Name** | The **deployment name** (not the model name). If the deployment has a custom name, temperature, pricing and token limits aren't detected |
| **Authentication** | **API key** (the resource key), or **OAuth2 client credentials** to sign in as a Microsoft Entra ID service principal |
| **API Key** | For API key auth |
| **OAuth2 Token URL / Client ID / Client Secret / Scope** | For OAuth2: `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`, the app's client ID and secret, and scope `https://cognitiveservices.azure.com/.default`. The service principal needs the **Cognitive Services OpenAI User** role on the resource |
| **API Endpoint** | `https://<resource>.openai.azure.com` |
| **API Style** | **v1 (recommended)** calls the v1 API and needs no API version. **Classic (api-version)** calls the deployment URL and needs **API Version** (for example `2024-10-21`) |

Then **Test Connection**. See [Add an LLM Provider](../add-llm-provider.md).

## Integrating with LLM Server (environment variables)

```bash
LLM_PROVIDER=azure
LLM_MODEL_NAME=<deployment name> # e.g., "gpt-5-mini"
LLM_PROVIDER_API_KEY=<Azure OpenAI key>
LLM_PROVIDER_API_ENDPOINT=https://<resource>.openai.azure.com
LLM_PROVIDER_API_STYLE=v1 # or "classic"
LLM_PROVIDER_API_VERSION=<API version> # only with classic, e.g., "2024-10-21"
```

For Entra ID instead of a key, set `LLM_AUTH_TYPE=oauth_client_credentials` with `LLM_OAUTH_TOKEN_URL`, `LLM_OAUTH_CLIENT_ID`, `LLM_OAUTH_CLIENT_SECRET` and `LLM_OAUTH_SCOPE`.

## Integrating with RAG Server

1. **Configure Azure OpenAI in RAG Server**:

   Add the following configuration to your RAG Server settings:

```bash
EMBEDDINGS_PROVIDER=azure
EMBEDDINGS_MODEL_NAME=<embedding deployment> # e.g., "text-embedding-3-small"
EMBEDDINGS_PROVIDER_API_VERSION=<API version for Azure embeddings> # e.g., "2023-05-15"
EMBEDDINGS_PROVIDER_API_ENDPOINT=https://<resource>.openai.azure.com # v1 style (the default); for classic set EMBEDDINGS_PROVIDER_API_STYLE=classic
EMBEDDINGS_PROVIDER_API_KEY=<Credential for accessing Azure embeddings>
```

#### To deploy NudgeBee AI models on Azure OpenAI and integrate [NudgeBee Model Deployment](./nb-azure-ai.md)

## Related

- [Add an LLM Provider](../add-llm-provider.md)
- [LLM Integrations](../index.md)
