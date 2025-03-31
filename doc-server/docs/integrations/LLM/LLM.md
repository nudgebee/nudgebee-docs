# AI Module Integration  

Nudgebee integrates with a variety of AI model hosting platforms to provide you with the flexibility to choose the platform that best suits your needs. This section provides an overview of our AI model integrations and will be updated as more integrations become available.  

## Available AI Model Integrations  

Nudgebee supports multiple AI hosting platforms, allowing seamless integration with different environments:  

* [AzureAI Foundry](./Azure/nb-azure-ai.md) - Leverage Azure AI to deploy, manage, and scale AI models while integrating them with Nudgebee.  
* [HuggingFace](./HuggingFace/nb-hugging-face.md) - Utilize Hugging Face for hosting and managing AI models, enabling efficient integration with Nudgebee.  
* [Ollama](./Ollama/nb-ollama.md) - Deploy and manage AI models using the Ollama framework for optimized performance with Nudgebee.  
* [Aws](./Aws/nb-aws.md) - Use AWS SageMaker to build, train, and deploy AI models, ensuring scalability and integration with Nudgebee.  

## Downloadable Models  

Nudgebee provides pre-trained AI models that can be downloaded and deployed on supported platforms (applicable for on-premises or self-hosted environments):

 **Nudgebee AI/LLM Models**  
   - Download pre-trained AI models from the Nudgebee platform using the following commands:

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
