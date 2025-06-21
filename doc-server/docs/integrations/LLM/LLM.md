# LLM Provider Integrations

This documentation guides you through integrating various LLM providers with NudgeBee's LLM Server and RAG Server applications. Our platform supports multiple LLM providers, allowing you to leverage foundation models or deploy custom models based on your specific needs.

## Supported LLM Providers

* [AWS Bedrock](./Aws/bedrock.md) is the default provider for LLM Server and RAG Server applications.

Choose from the following LLM providers to integrate with your NudgeBee applications:

### Cloud Provider Services
- [AWS](./Aws/aws.md) - Amazon Web Services integration options including Bedrock and SageMaker
- [Azure](./Azure/azure.md) - Microsoft Azure integration options including Azure OpenAI Service
- [Google](./Google/google.md) - Google Cloud Platform integration options including Gemini and VertexAI

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
