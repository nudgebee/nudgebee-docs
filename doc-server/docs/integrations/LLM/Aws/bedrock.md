# Amazon Bedrock Integration

This guide walks you through integrating Amazon Bedrock with NudgeBee's LLM Server and RAG Server applications.

## Overview

Amazon Bedrock is a fully managed service that offers a choice of high-performing foundation models (FMs) from leading AI companies through a unified API. Bedrock simplifies the process of building generative AI applications while maintaining privacy and security.

## Prerequisites

- AWS account with Amazon Bedrock access enabled
- IAM user with appropriate Bedrock permissions
- AWS Access Key ID and Secret Access Key

## Setting up Amazon Bedrock Credentials

1. **Request Access to Models**:
   - Navigate to the Amazon Bedrock console in AWS
   - Go to "Model access" in the navigation pane
   - Request access to the foundation models you want to use
   - Wait for approval (typically immediate for most models)

2. **Create IAM User with Bedrock Permissions**:
   ```bash
   aws iam create-user --user-name bedrock-user
   aws iam attach-user-policy --user-name bedrock-user --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
   ```

3. **Generate Access Keys**:
   ```bash
   aws iam create-access-key --user-name bedrock-user
   ```
   Save the returned Access Key ID and Secret Access Key securely.

## Integrating with LLM Server

1. **Configure Bedrock in LLM Server**:
   
   Add the following configuration to your LLM Server settings:
   
```sh
LLM_PROVIDER=bedrock
LLM_PROVIDER_REGION=<AWS_Region> # e.g., us-west-2
LLM_MODEL_NAME=<Custom_Bedrock_Model_ID> # e.g., meta.llama3-8b-instruct-v1:0
```

## Integrating with RAG Server

1. **Configure Bedrock in RAG Server**:

   Add the following configuration to your RAG Server settings:
   
```sh
EMBEDDINGS_PROVIDER=bedrock
EMBEDDINGS_PROVIDER_REGION=<AWS_Region> # e.g., us-west-2
EMBEDDINGS_MODEL_NAME=<Custom_Bedrock_Model_ID> # e.g., amazon.titan-embed-text-v1
```

#### To deploy NudgeBee AI models on AWS Bedrock and integrate [NudgeBee Model Deployment](./aws_bedrock_custom_model) 