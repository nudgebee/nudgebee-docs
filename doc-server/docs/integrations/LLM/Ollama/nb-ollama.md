# Deploying Nudgebee AI on Ollama (GPU Machine)

## Overview
This guide provides detailed steps to deploy the Nudgebee AI model on a GPU machine using Ollama, including configuration for both the Nudgebee RAG server and LLM server to use the deployed model for embedding generation and inference.


## **Prerequisites**

Before proceeding, ensure you have:
- A machine with a compatible NVIDIA GPU (CUDA enabled)
- Installed **Ollama** with GPU support
- A trained Nudgebee AI model in a compatible format
- Docker installed (if using a containerized setup)
- The Nudgebee RAG server and LLM server properly configured to interact with the deployed model


## **Step 1: Install Ollama with GPU Support**

1. Install Ollama:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```
2. Verify Ollama installation:
   ```bash
   ollama --version
   ```
3. Ensure GPU support is enabled:
   ```bash
   nvidia-smi
   ```
   If the GPU is detected, proceed with model deployment.


## **Step 2: Download and Load the Model into Ollama**

1. Download the Nudgebee model from the Nudgebee store.
2. Place the Nudgebee model file in an accessible directory.
3. Import the model into Ollama:
   ```bash
   ollama create nudgebee-ai --from nudgebee_model
   ```
4. Verify that the model is available:
   ```bash
   ollama list
   ```


## **Step 3: Run the Ollama Model**

1. Start the Ollama model as a background service:
   ```bash
   ollama run nudgebee-ai
   ```
   This keeps the model ready to accept queries.
2. Test the model:
   ```bash
   ollama run nudgebee-ai "Hello, how can I help?"
   ```


## **Step 4: Configure Nudgebee RAG Server to Use Ollama**

Update the environment variables in the Nudgebee RAG server to connect to the deployed model:

### **Environment Variables for RAG Server**

- `OLLAMA_EMBEDDING_MODEL`: Ollama embedding model name.
- `OLLAMA_API_BASE`: Base URL for the Ollama API.
- `OLLAMA_EMBEDDING_ENDPOINT`: Endpoint for accessing the Ollama embedding model.

Ensure the Nudgebee RAG server correctly sends embedding requests to this endpoint.


## **Step 5: Configure Nudgebee LLM Server to Use Ollama**

Nudgebee LLM server uses the OpenAI-compatible endpoint provided by Ollama and requires the following configuration:

### **Environment Variables for LLM Server**

- `LLM_PROVIDER`: `openai`
- `OPENAI_API_KEY`: `<if Ollama is configured with security>`
- `OPENAI_BASE_URL`: `<>`

Ensure the Nudgebee LLM server is configured to send inference requests to the Ollama model.


## **Step 6: Test the Integration**

### **Test the RAG Server Embedding Generation**

1. Send an embedding request via API:
   ```bash
   curl -X POST "http://localhost:11434/api/generate" -H "Content-Type: application/json" -d '{"model": "nudgebee-ai", "prompt": "Generate embeddings for: Kubernetes monitoring"}'
   ```
2. Verify the response contains the expected embeddings.

### **Test the LLM Server Inference**

1. Send an inference request:
   ```bash
   curl -X POST "http://localhost:11434/api/chat/completions" -H "Content-Type: application/json" -d '{"model": "nudgebee-ai", "messages": [{"role": "user", "content": "Explain Kubernetes monitoring"}]}'
   ```
2. Verify that the response contains a valid reply from the model.


## **Conclusion**

You have successfully deployed the Nudgebee AI model on an Ollama-supported GPU machine and configured both the Nudgebee RAG server and LLM server to use the deployed model for embedding generation and inference.