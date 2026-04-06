# LLM Provider Integrations — BYOM (Bring Your Own Model)

NudgeBee uses **flexible AI models** — including modular SLMs, LLMs, and specialized agents — to power [NuBi](../../features/ai/AI.md), the pre-built Cloud-Ops agents, root cause analysis, automated runbooks, and intelligent recommendations. This section guides you through connecting an LLM provider to your NudgeBee instance.

### Do You Need This?

- **Cloud SaaS users**: A NudgeBee-managed LLM is included by default. You can skip this section unless you want to use BYOM (Bring Your Own Model) for more control over model selection or data handling.
- **Self-hosted (on-prem) users**: You need to configure an LLM provider for AI features to work. Choose from the options below.

:::info
Without an LLM connection, NudgeBee still provides monitoring, cost optimization, and alerting. The LLM unlocks [NuBi](../../features/ai/AI.md) and the full suite of AI-powered troubleshooting, natural language queries, agentic automation, and auto-generated runbooks.
:::

### Your Options — Flexible AI Models

NudgeBee supports BYOM (Bring Your Own Model) with three categories of LLM providers:

| Category | Providers | Best For |
|---|---|---|
| **Cloud Provider Services** | [AWS Bedrock](./Aws/bedrock.md), [Azure OpenAI](./Azure/azure-openai.md), [Google Vertex AI](./Google/vertex-ai.md), [Google Gemini](./Google/gemini.md), [OpenAI](./OpenAI/openai.md) | Teams with existing cloud contracts or preferred providers. |
| **Self-Hosted / Open Source** | [Ollama](./Ollama/nb-ollama.md), [HuggingFace](./HuggingFace/nb-hugging-face.md), [AWS SageMaker](./Aws/sagemaker.md) | Organizations requiring data privacy, air-gapped environments, or custom-trained models. |
| **NudgeBee Models** | Pre-trained NudgeBee AI models (nb-llm, nb-slm) | Self-hosted users who want optimized, purpose-built models for Cloud Ops. |

---

## Supported LLM Providers

* [AWS Bedrock](./Aws/bedrock.md) is the default provider for LLM Server and RAG Server applications.

Choose from the following LLM providers to integrate with your NudgeBee applications:

### Cloud Provider Services
- [AWS](./Aws/aws.md) - Amazon Web Services integration options including Bedrock and SageMaker
- [Azure](./Azure/azure.md) - Microsoft Azure integration options including Azure OpenAI Service
- [Google](./Google/google.md) - Google Cloud Platform integration options including Gemini and VertexAI
- [OpenAI](./OpenAI/openai.md) - OpenAI API integration for GPT-5, GPT-4o, GPT-4, and Embeddings models

### Open Source & Self-Hosted Options
- [Hugging Face](./HuggingFace/nb-hugging-face.md) - Integration with Hugging Face's model repository and inference APIs
- [Ollama](./Ollama/nb-ollama.md) - Integration with self-hosted Ollama deployments

### NudgeBee Models  

NudgeBee provides pre-trained AI models that can be downloaded and deployed on supported platforms (applicable for on-premises or self-hosted environments):

 **NudgeBee AI/LLM Models**  
   - Download pre-trained AI models from the NudgeBee platform using the following commands:

     ##### SLM
      ```bash
        curl --location 'https://registry.nudgebee.com/downloads/models/nb-slm' --header 'Authorization: Bearer <license_key>'
      ```
     ##### LLM
      ```bash
        curl --location 'https://registry.nudgebee.com/downloads/models/nb-llm' --header 'Authorization: Bearer <license_key>'
      ```
   - Optimized for high-performance inference in various AI-driven applications.

## Models Used for Retrieval-Augmented Generation (RAG)  

RAG models enhance information retrieval by generating vector embeddings and enabling efficient similarity searches:  

1. **nb-text-embeddings**  
   - Generates vector embeddings for text data.  
   - Powers the **RAG Server** for efficient similarity searches and context retrieval.  

## Models Used for Agents (LLM Server)  

The **LLM Server** powers intelligent agents that specialize in reasoning, planning, and query generation:  

1. **nb-llm**  
   - Functions as the primary **reasoning and planning** model.  
   - Handles complex query processing, decision-making, and response generation.  

2. **nb-slm**  
   - Designed for **task-specific agents**, improving modular AI functionality.
