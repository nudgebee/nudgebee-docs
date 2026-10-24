# Google Vertex AI Integration

This guide provides detailed instructions for integrating Google Vertex AI with NudgeBee's LLM Server and RAG Server applications.

## Overview

Google Vertex AI is a unified platform that brings together Google Cloud's machine learning tools for training and deploying ML models and building AI applications. For language models, Vertex AI offers both pre-trained foundation models through its Model Garden and the ability to deploy custom models.

## Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud project with Vertex AI API enabled
- Service account with appropriate permissions
- Basic understanding of ML model deployment concepts

## Setting up Google Vertex AI Credentials

1. **Create a Google Cloud Project** (or use an existing one):
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" at the top of the page
   - Click "New Project"
   - Enter a name and select your organization
   - Click "Create"

2. **Enable the Vertex AI API**:
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Vertex AI API"
   - Click on the API and select "Enable"

3. **Create a Service Account**:
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click "Create Service Account"
   - Enter name and description
   - Add the following roles:
     - "Vertex AI User"
     - "Vertex AI Admin" (if you need to create resources)
     - "Storage Object Admin" (for model artifacts)
   - Create and download the JSON key file

## Add it in NudgeBee (UI)

In **Admin → Integrations → LLM → Add LLM Provider**, choose **vertexai**, enter the **LLM Model Name** and an **API Key**. See [Add an LLM Provider](../add-llm-provider.md). **Test Connection** checks the configuration for Vertex AI but doesn't call the model, so send a test question to NuBi after saving.

## Integrating with LLM Server (environment variables)

```bash
LLM_PROVIDER=vertexai
LLM_MODEL_NAME=<Vertex AI model name, e.g. gemini-2.5-flash>
LLM_PROVIDER_REGION=<location, default us-central1>
GOOGLE_CLOUD_PROJECT=<your project id>
LLM_PROVIDER_API_KEY=<optional; leave unset to use Application Default Credentials>
```

The project comes from `GOOGLE_CLOUD_PROJECT` and the location from `LLM_PROVIDER_REGION` (default `us-central1`). With no API key, the LLM Server uses the service account available to its pod (Application Default Credentials).

## Integrating with RAG Server

```bash
EMBEDDINGS_PROVIDER=vertexai
EMBEDDINGS_MODEL_NAME=<embedding model, e.g. text-embedding-005>
EMBEDDINGS_PROVIDER_REGION=<location>
```

Both the model name and the region are required for Vertex AI embeddings.

## Related

- [Add an LLM Provider](../add-llm-provider.md)
- [Google Gemini](./gemini.md)
- [LLM Integrations](../index.md)
