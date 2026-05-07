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

## Integrating with LLM Server

1. **Configure Vertex AI in LLM Server**:
   
   Add the following configuration to your LLM Server settings:
   
```bash
    LLM_PROVIDER=googleai/vertexai
    LLM_MODEL_NAME=<Model name in Google Cloud AI>
    LLM_PROVIDER_API_ENDPOINT=<Base URL for Google Cloud AI> 
```


## Integrating with RAG Server

1. **Configure Vertex AI in RAG Server**:

   Add the following configuration to your RAG Server settings:
   
```bash
    EMBEDDINGS_PROVIDER=googleai/vertexai
    EMBEDDINGS_MODEL_NAME=<Model name in Google Cloud AI>
    EMBEDDINGS_PROVIDER_API_ENDPOINT=<Google Cloud embeddings endpoint URL>
```

Note: Google Vertex AI only supports authentication via service accounts. Ensure that the service account has the necessary permissions to access the Vertex AI API and any other resources you plan to use.