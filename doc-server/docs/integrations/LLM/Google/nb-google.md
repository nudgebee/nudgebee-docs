# Configure LLM Server to Use Google AI / Google Vertex AI
To enable the LLM server to interact with the Google Cloud AI-hosted model, update the following environment variables:

#### **Environment Variables for LLM Server**
```bash
    LLM_PROVIDER=googleai/vertexai
    LLM_MODEL_NAME=<Model name in Google Cloud AI>
    LLM_PROVIDER_API_KEY=<Google Cloud authentication token> 
    LLM_PROVIDER_API_ENDPOINT=<Base URL for Google Cloud AI> 
```
Note:
- LLM_PROVIDER_API_KEY - Needed only if using Google AI
- LLM_PROVIDER_API_ENDPOINT - Needed only if using Google Vertex AI

# Configure RAG Server to Use Google AI / Google Vertex AI
To enable the RAG server to interact with the Google Cloud AI-hosted model, update the following environment variables:

#### **Environment Variables for RAG Server**
```bash
    EMBEDDINGS_PROVIDER=googleai/vertexai
    EMBEDDINGS_MODEL_NAME=<Model name in Google Cloud AI>
    EMBEDDINGS_PROVIDER_API_KEY=<Credential for accessing Google Cloud embeddings>
    EMBEDDINGS_PROVIDER_API_ENDPOINT=<Google Cloud embeddings endpoint URL>
```
Note:
- EMBEDDINGS_PROVIDER_API_KEY - Needed only if using Google AI 
- EMBEDDINGS_PROVIDER_API_ENDPOINT - Needed only if using Google Vertex AI


#### For Vertex AI, credentials are typically managed through Google Cloud IAM roles and permissions. Ensure that the service account used has the necessary permissions to access the model and perform inference.
