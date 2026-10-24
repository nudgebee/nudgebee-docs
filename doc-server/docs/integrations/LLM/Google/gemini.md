# Google Gemini Integration

This guide provides detailed instructions for integrating Google Gemini with NudgeBee's LLM Server and RAG Server applications.

## Overview

Google Gemini is a family of multimodal AI models developed by Google DeepMind. These models can understand and generate text, code, images, and audio, making them versatile for various AI applications. Gemini models are available through Google AI Studio and the Gemini API.

## Prerequisites

- Google Cloud Platform account
- Google Cloud project with billing enabled
- Gemini API enabled for your project
- An API key

## Setting up Google Gemini Credentials

1. **Create a Google Cloud Project** (or use an existing one):
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" at the top of the page
   - Click "New Project"
   - Enter a name and select your organization
   - Click "Create"

2. **Enable the Gemini API**:
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Gemini API"
   - Click on the API and select "Enable"

3. **Create API Credentials**:
   - Go to [Credentials](https://console.cloud.google.com/apis/credentials)
   - Click "Create credentials" and select "API key"
   - Copy your API key
   - Restrict the API key to Gemini API only

The Gemini API (`googleai`) authenticates with the API key only; you don't need a service account. To use a service account instead, use [Vertex AI](./vertex-ai.md).

## Add it in NudgeBee (UI)

In **Admin → Integrations → LLM → Add LLM Provider**, choose **googleai**, enter the **LLM Model Name** and the **API Key**, then **Test Connection**. See [Add an LLM Provider](../add-llm-provider.md).

## Integrating with LLM Server (environment variables)

1. **Configure Gemini in LLM Server**:

   Add the following configuration to your LLM Server settings:

```bash
    LLM_PROVIDER=googleai
    LLM_MODEL_NAME=<Model name in Google Cloud AI> # e.g., "gemini-1.5-pro"
    LLM_PROVIDER_API_KEY=<Google Cloud authentication token>
```


## Integrating with RAG Server

1. **Configure Gemini in RAG Server**:

   Add the following configuration to your RAG Server settings:

```bash
    EMBEDDINGS_PROVIDER=googleai
    EMBEDDINGS_MODEL_NAME=<Model name in Google Cloud AI> # e.g., "text-embedding-004"
    EMBEDDINGS_PROVIDER_API_KEY=<Credential for accessing Google Cloud embeddings>
```


## Rate Limits and Quotas

Google Gemini API has rate limits that you should be aware of:

- Default quota: Varies by model and account tier
- Requests per minute (RPM): Typically between 60-600 RPM
- Tokens per minute (TPM): Typically between 60k-1M TPM

To request quota increases:
- Go to [Google Cloud Console Quotas](https://console.cloud.google.com/iam-admin/quotas)
- Find the Gemini API quotas
- Select the quota to increase
- Click "Edit Quotas" and submit your request

## Related

- [Add an LLM Provider](../add-llm-provider.md)
- [Google Vertex AI](./vertex-ai.md)
- [LLM Integrations](../index.md)
