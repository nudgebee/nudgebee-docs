# Deploying NudgeBee AI on Hugging Face

## Overview
This guide provides detailed steps to deploy the NudgeBee AI model on Hugging Face using the UI, including configuration for both the RAG server and LLM server to use the deployed model.


## **Prerequisites**

Before proceeding, ensure you have:
- A **Hugging Face** account.
- A trained NudgeBee AI model in a compatible format (`.bin`, `.pt`, `.gguf`).
- The model files ready for upload.
- The RAG server properly configured to interact with the deployed model.


## **Step 1: Upload the Model to Hugging Face Hub**

1. Go to [Hugging Face Models](https://huggingface.co/models) and log in to your account.
2. Click on your profile and select **New Model**.
3. Provide a repository name (e.g., `nudgebee-ai`) and set visibility (public or private).
4. Click **Create model**.
5. Once inside the model repository, click **Upload files**.
6. Select and upload the trained model files from your local system.
7. Click **Commit changes** to finalize the upload.


## **Step 2: Deploy the Model with Inference API**

1. Navigate to your model page on Hugging Face.
2. Click **Settings** and enable **Inference API** if not already enabled.
3. Copy the Inference API endpoint URL.


## **Step 3: Configure RAG Server to Use Hugging Face**

Update the environment variables in the RAG server to connect to the deployed model:

### **Environment Variables for RAG Server**

```bash
EMBEDDINGS_PROVIDER=huggingface
EMBEDDINGS_PROVIDER_API_KEY=<API key for Hugging Face>
EMBEDDINGS_PROVIDER_API_ENDPOINT=<Hugging Face embeddings endpoint>
```

## **Step 4: Configure LLM Server to Use Hugging Face**

To enable the LLM server to interact with the Hugging Face-hosted model, update the following environment variables:

### **Environment Variables for LLM Server**

```bash
LLM_PROVIDER=huggingface
LLM_MODEL_NAME=<Model name in Hugging Face>
LLM_PROVIDER_API_KEY=<Hugging Face API token>
LLM_PROVIDER_API_ENDPOINT=<Hugging Face model endpoint>
```

## **Conclusion**

You have successfully deployed the NudgeBee AI model on Hugging Face using the UI and configured both the RAG server and LLM server to use the deployed model.