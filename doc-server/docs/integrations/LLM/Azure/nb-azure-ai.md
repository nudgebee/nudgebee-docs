# Deploying Nudgebee AI on Azure AI Foundry

## Overview
This guide provides detailed steps to deploy the Nudgebee AI model on Azure AI Foundry, including configuration for both the RAG server and LLM server to use the deployed model.


## **Prerequisites**

Before proceeding, ensure you have:
- An Azure account with permissions for AI Foundry, Storage, IAM, and Container Registry.
- A trained Nudgebee AI model in a supported format (`.tar.gz`).
- The model file uploaded to Azure Blob Storage.
- An Azure AI Foundry workspace set up for model deployment.
- The RAG and LLM servers properly configured to interact with the deployed model.


## **Step 1: Upload Model to Azure Blob Storage**

1. Log in to [Azure Portal](https://portal.azure.com/).
2. Navigate to **Storage Accounts** and select an existing account or create a new one.
3. Click **Containers** and create a new container if necessary.
4. Open the container and click **Upload**.
5. Select the model file (`nudgebee_model.tar.gz`) from your local system.
6. Click **Upload** to store the model file in Azure Blob Storage.


## **Step 2: Register the Model in Azure AI Foundry**

1. Navigate to **Azure AI Foundry**.
2. Click **Models** in the left navigation panel.
3. Click **Register Model**.
4. Provide a **Model name** (e.g., `nudgebee-ai-model`).
5. Select the **Storage path** where the model was uploaded in Step 1.
6. Click **Register** to add the model to Azure AI Foundry.


## **Step 3: Deploy the Model**

1. Navigate to **Deployments** in Azure AI Foundry.
2. Click **Create Deployment**.
3. Select the registered model from Step 2.
4. Choose a **Compute target**, such as Azure Kubernetes Service (AKS).
5. Configure the **Instance type** and scaling options.
6. Click **Deploy** and wait for the deployment to complete.


## **Step 4: Configure RAG Server to Use Azure AI Foundry**

Update the environment variables in the RAG server to connect to the deployed model:

### **Environment Variables for RAG Server**

- `EMBEDDINGS_PROVIDER`: `azure`
- `EMBEDDINGS_MODEL_NAME`: `<Model name in Azure AI Foundry>`'
- `EMBEDDINGS_PROVIDER_API_VERSION`: `<API version for Azure embeddings>`
- `EMBEDDINGS_PROVIDER_API_ENDPOINT`: `<Azure embeddings endpoint URL>`
- `EMBEDDINGS_PROVIDER_API_KEY`: `<Credential for accessing Azure embeddings>`

Ensure the application correctly sends embedding requests to this endpoint.


## **Step 5: Configure LLM Server to Use Azure AI Foundry**

To enable the LLM server to interact with the Azure AI Foundry-hosted model, update the following environment variables:

### **Environment Variables for LLM Server**

- `LLM_PROVIDER`: `azure`
- `LLM_PROVIDER_MODEL_NAME`: `<Model name in Azure AI Foundry>`
- `LLM_PROVIDER_API_KEY`: `<Azure authentication token>`
- `LLM_PROVIDER_API_VERSION`: `<API version>`
- `LLM_PROVIDER_API_ENDPOINT`: `<Base URL for Azure AI Foundry>`

Ensure that the LLM server correctly forwards chat completion requests to this endpoint.


## **Step 6: Test the Deployment**

1. Navigate to **Deployments** in Azure AI Foundry.
2. Select the deployed model.
3. Click **Test Deployment**.
4. Upload a JSON request with text data for AI processing.
5. Click **Run Test** and verify the response.


## **Conclusion**

You have successfully deployed the Nudgebee AI model on Azure AI Foundry and configured both the RAG server and LLM server to use the deployed model.