# Azure OpenAI Service Integration

This guide provides detailed instructions for integrating Azure OpenAI Service with NudgeBee's LLM Server and RAG Server applications.

## Overview

Azure OpenAI Service provides REST API access to OpenAI's powerful language models including GPT-4, GPT-3.5-Turbo, and Embeddings models. By running these models on Azure, you benefit from enterprise-grade security, compliance, regional availability, and high availability guarantees.

## Prerequisites

- Azure subscription with access to Azure OpenAI Service (requires application approval)
- Appropriate permissions to create and manage Azure resources
- Azure OpenAI resource deployed in your subscription

## Setting up Azure OpenAI Credentials

1. **Request Access to Azure OpenAI**:
   - Visit [Azure OpenAI Service Request Form](https://aka.ms/oai/access)
   - Complete the application with your use case details
   - Wait for approval notification

2. **Create Azure OpenAI Resource**:
   - Navigate to the [Azure Portal](https://portal.azure.com)
   - Search for "Azure OpenAI"
   - Click "Create" and follow the wizard:
     - Select subscription, resource group, region
     - Choose a name for your resource
     - Select pricing tier
     - Review and create

3. **Deploy a Model**:
   - In your Azure OpenAI resource, select "Model deployments"
   - Click "Create new deployment"
   - Select a model (e.g., "gpt-35-turbo" or "gpt-4")
   - Set deployment name and version
   - Configure capacity
   - Click "Create"

4. **Get API Credentials**:
   - In your Azure OpenAI resource, go to "Keys and Endpoint"
   - Note down:
     - Endpoint URL
     - API Key
     - Resource Name
     - Deployment Name

## Integrating with LLM Server

1. **Configure Azure OpenAI in LLM Server**:
   
   Add the following configuration to your LLM Server settings:
   
```bash
LLM_PROVIDER=azure
LLM_MODEL_NAME=<Model name in Azure AI Foundry> # e.g., "gpt-4o"
LLM_PROVIDER_API_KEY=<Azure authentication token> 
LLM_PROVIDER_API_VERSION=<API version> # e.g., "2023-05-15"
LLM_PROVIDER_API_ENDPOINT=<Base URL for Azure AI Foundry> # e.g., "https://your-resource-name.openai.azure.com"
```


## Integrating with RAG Server

1. **Configure Azure OpenAI in RAG Server**:

   Add the following configuration to your RAG Server settings:
   
```bash
EMBEDDINGS_PROVIDER=azure
EMBEDDINGS_MODEL_NAME=<Model name in Azure AI Foundry> # e.g., "gpt-4o"
EMBEDDINGS_PROVIDER_API_VERSION=<API version for Azure embeddings> # e.g., "2023-05-15"
EMBEDDINGS_PROVIDER_API_ENDPOINT=<Azure embeddings endpoint URL> # e.g., "https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name"
EMBEDDINGS_PROVIDER_API_KEY=<Credential for accessing Azure embeddings>
```

#### To deploy NudgeBee AI models on Azure OpenAI and integrate [NudgeBee Model Deployment](./nb-azure-ai)