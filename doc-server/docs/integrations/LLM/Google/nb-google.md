## Generate Google Cloud AI credentials

### Create a Service Account for Google Cloud AI

#### 1. Go to Google Cloud Console
- URL: [Google Cloud Console](https://console.cloud.google.com/).

#### 2. Select Your Project
- Make sure you're in the correct project where Vertex AI and Gemini APIs will be used.

#### 3. Enable Required APIs
Navigate to: **APIs & Services > Library**, then enable the following:

-  **Vertex AI API**
-  **Generative Language API (Vertex AI)** (for Gemini models)

#### 4. Create a Service Account
- Go to: **IAM & Admin > Service Accounts**
- Click **"Create Service Account"**
- Provide:
  - A name (e.g., `nudgebee-vertex-ai-access`)
  - Description (optional)
- Click **Create and Continue**

#### 5. Grant Roles to the Service Account
On the next screen, assign the necessary roles:

##### Minimum recommended roles:
- `Vertex AI User` (`roles/aiplatform.user`)
- `Vertex AI Service Agent User` (`roles/aiplatform.serviceAgentUser`)

Then click **Continue > Done**

#### 6. Create a Key for the Service Account
- Find the service account you just created in the list
- Click the **3-dot menu** > **"Manage keys"**
- Click **"Add Key" > "Create new key"**
- Choose **JSON** format and click **Create**

This will download a `.json` file—**store it securely**. This is your credential file.

### Create an API Key for Vertex AI (Google Cloud)
#### 1. Go to Google Cloud Console
- URL: [Google Cloud Console](https://console.cloud.google.com/).

#### 2. Select Your Project
- Choose the correct Google Cloud project where you want to use Vertex AI.

#### 3. Enable Vertex AI API
- Navigate to: **APIs & Services > Library**
- Search for **Vertex AI API**
- Click **Enable** if it's not already enabled.

#### 4. Create Credentials (API Key)
- Go to: **APIs & Services > Credentials**
- Click on **"Create Credentials"**
- Choose **API key**

#### 5. (Recommended) Restrict the API Key
- After the key is created, click **"Restrict key"**
- Under **API restrictions**:
  - Select **"Restrict key"**
  - Choose both:
    - **Vertex AI API**
    - **Generative Language API (Vertex AI)**

- (Optional) Add **IP address restrictions** for enhanced security

#### 6. Save Your API Key
- Copy the generated API key and store it securely

## Configure LLM Server to Use Google AI / Google Vertex AI
To enable the LLM server to interact with the Google Cloud AI-hosted model, update the following environment variables:

### **Environment Variables for LLM Server**
```bash
    LLM_PROVIDER=googleai/vertexai
    LLM_MODEL_NAME=<Model name in Google Cloud AI>
    LLM_PROVIDER_API_KEY=<Google Cloud authentication token> 
    LLM_PROVIDER_API_ENDPOINT=<Base URL for Google Cloud AI> 
```
Note:
- LLM_PROVIDER_API_KEY - Needed only if using Google AI
- LLM_PROVIDER_API_ENDPOINT - Needed only if using Google Vertex AI

## Configure RAG Server to Use Google AI / Google Vertex AI
To enable the RAG server to interact with the Google Cloud AI-hosted model, update the following environment variables:

### **Environment Variables for RAG Server**
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
