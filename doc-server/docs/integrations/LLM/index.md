# LLM Provider Integrations — BYOM (Bring Your Own Model)

NudgeBee uses **flexible AI models** — including modular SLMs, LLMs, and specialized agents — to power [NuBi](../../features/ai/), the pre-built Cloud-Ops agents, root cause analysis, automated runbooks, and intelligent recommendations. This section guides you through connecting an LLM provider to your NudgeBee instance.

### Do You Need This?

- **Cloud SaaS / Enterprise users**: A NudgeBee-managed LLM is available. You can skip this section unless you want to use BYOM (Bring Your Own Model) for more control over model selection or data handling.
- **Community (open-source) users**: You need to configure your own LLM provider for AI features to work — this is the BYOM path. Choose from the options below.

:::info
Without an LLM connection, NudgeBee still provides monitoring, cost optimization, and alerting. The LLM unlocks [NuBi](../../features/ai/) and the full suite of AI-powered troubleshooting, natural language queries, agentic automation, and auto-generated runbooks.
:::

### Your Options — Flexible AI Models

NudgeBee supports BYOM (Bring Your Own Model) with three categories of LLM providers:

| Category | Providers | Best For |
|---|---|---|
| **Cloud Provider Services** | [AWS Bedrock](./Aws/bedrock.md), [Azure OpenAI](./Azure/azure-openai.md), [Google Vertex AI](./Google/vertex-ai.md), [Google Gemini](./Google/gemini.md), [OpenAI](./OpenAI/) | Teams with existing cloud contracts or preferred providers. |
| **Self-Hosted / Open Source** | [Ollama](./Ollama/), [HuggingFace](./HuggingFace/), [AWS SageMaker](./Aws/sagemaker.md) | Organizations requiring data privacy, air-gapped environments, or custom-trained models. |
| **NudgeBee Models** <Enterprise/> <Cloud/> | Pre-trained NudgeBee AI models (nb-llm, nb-slm) | Enterprise/Cloud users who want optimized, purpose-built models for Cloud Ops. |

### BYOM Configuration Matrix & Helm Values Snippets

To configure your own LLM provider on a self-hosted NudgeBee deployment, set the appropriate provider flags under `nudgebee_secret` in your `values.yaml`:

#### 1. Self-Hosted Ollama / vLLM (Private VPC / Air-Gapped)
```yaml
nudgebee_secret:
  LLM_PROVIDER: "ollama"  # or "vllm"
  OLLAMA_BASE_URL: "http://ollama.ai-infra.svc.cluster.local:11434"
  OLLAMA_MODEL: "llama3.1:8b"
  EMBEDDING_MODEL: "nomic-embed-text"
```

#### 2. AWS Bedrock (Claude 3.5 / Llama 3)
```yaml
nudgebee_secret:
  LLM_PROVIDER: "bedrock"
  AWS_DEFAULT_REGION: "us-east-1"
  # Bare model IDs (e.g. anthropic.claude-3-5-sonnet-20241022-v2:0) are valid for on-demand regional inference.
  # Cross-region inference profile IDs (e.g. us.anthropic.claude-3-5-sonnet-20241022-v2:0) provide cross-region availability.
  AWS_BEDROCK_MODEL_ID: "anthropic.claude-3-5-sonnet-20241022-v2:0"
  # In EKS, IRSA is recommended; otherwise pass access keys:
  # AWS_ACCESS_KEY_ID: "<YOUR_KEY>"
  # AWS_SECRET_ACCESS_KEY: "<YOUR_SECRET>"
```

#### 3. OpenAI / Azure OpenAI
```yaml
nudgebee_secret:
  LLM_PROVIDER: "openai"
  OPENAI_API_KEY: "<YOUR_OPENAI_API_KEY>"
  OPENAI_MODEL: "gpt-4o"
```

---

## Supported LLM Providers

* [AWS Bedrock](./Aws/bedrock.md) is the default provider for LLM Server and RAG Server applications.

Choose from the following LLM providers to integrate with your NudgeBee applications:

### Cloud Provider Services
- [AWS](./Aws/index.md) - Amazon Web Services integration options including Bedrock and SageMaker
- [Azure](./Azure/index.md) - Microsoft Azure integration options including Azure OpenAI Service
- [Google](./Google/index.md) - Google Cloud Platform integration options including Gemini and VertexAI
- [OpenAI](./OpenAI/index.md) - OpenAI API integration for GPT-5, GPT-4o, GPT-4, and Embeddings models

### Open Source & Self-Hosted Options
- [Hugging Face](./HuggingFace/index.md) - Integration with Hugging Face's model repository and inference APIs
- [Ollama](./Ollama/index.md) - Integration with self-hosted Ollama deployments

### NudgeBee Models <Enterprise/> <Cloud/>

:::info[Enterprise feature]
NudgeBee's pre-trained `nb-llm` / `nb-slm` / `nb-text-embeddings` models are part of the **Enterprise** and **Cloud** editions and are downloaded from the licensed `registry.nudgebee.com` registry. **Community (open-source) users** should connect their own model instead — see the [Open Source & Self-Hosted Options](#open-source--self-hosted-options) above (Ollama, Hugging Face) or any BYOM provider. See [Editions](../../editions.md) for details.
:::

NudgeBee provides pre-trained AI models that can be downloaded and deployed on supported platforms (applicable for licensed on-premises or self-hosted Enterprise environments):

 **NudgeBee AI/LLM Models**
   - Download pre-trained AI models from the NudgeBee platform using the following commands (requires an Enterprise license key):

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
