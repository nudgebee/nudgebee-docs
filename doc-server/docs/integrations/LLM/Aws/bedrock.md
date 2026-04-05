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
   ```

   Attach one of the following policies to grant Bedrock access:

   **Option A: Custom Inline Policy (Recommended — Least Privilege)**

   Create a policy file `bedrock-policy.json`:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "VisualEditor0",
               "Effect": "Allow",
               "Action": [
                   "bedrock:InvokeModel",
                   "bedrock:InvokeModelWithResponseStream"
               ],
               "Resource": "*"
           }
       ]
   }
   ```

   Attach the inline policy:
   ```bash
   aws iam put-user-policy --user-name bedrock-user --policy-name BedrockInvokeAccess --policy-document file://bedrock-policy.json
   ```

   **Option B: AWS Managed Policy**

   ```bash
   aws iam attach-user-policy --user-name bedrock-user --policy-arn arn:aws:iam::aws:policy/AmazonBedrockLimitedAccess
   ```

3. **Generate Access Keys**:
   ```bash
   aws iam create-access-key --user-name bedrock-user
   ```
   Save the returned Access Key ID and Secret Access Key securely.

## Model ID vs Inference Profile

When calling models on Amazon Bedrock, the model name you provide depends on your throughput setup:

- **Inference Profile (default)**: If you have **not** purchased dedicated/provisioned throughput, you must use an **inference profile ID** as the model name. Inference profiles are prefixed with the region shorthand (e.g., `us.`, `eu.`).
  - Example LLM (Meta Llama): `us.meta.llama3-8b-instruct-v1:0`
  - Example LLM (Anthropic Claude): `us.anthropic.claude-sonnet-4-6-20250514-v1:0`
  - Example Embeddings: `us.amazon.titan-embed-text-v2:0`
  - You can find available inference profile IDs in the Bedrock console under **Inference profiles**, or by running:
    ```bash
    aws bedrock list-inference-profiles --region <your-region>
    ```

- **Dedicated/Provisioned Throughput**: If you have purchased provisioned throughput for a model, use the **provisioned model ARN** as the model name.
  - Example: `arn:aws:bedrock:<region>:<account-id>:provisioned-model/<model-name>`

> **Recommended**: While bare model IDs (e.g., `meta.llama3-8b-instruct-v1:0`) work for on-demand inference within the same region, using inference profile IDs is recommended for cross-region routing and better availability. Some newer models may require inference profiles.

## Integrating with LLM Server

1. **Configure Bedrock in LLM Server**:
   
   Add the following configuration to your LLM Server settings:
   
```sh
LLM_PROVIDER=bedrock
LLM_PROVIDER_REGION=<AWS_Region> # e.g., us-west-2
LLM_MODEL_NAME=<Inference_Profile_ID_or_Provisioned_ARN> # e.g., us.meta.llama3-8b-instruct-v1:0
```

## Integrating with RAG Server

1. **Configure Bedrock in RAG Server**:

   Add the following configuration to your RAG Server settings:
   
```sh
EMBEDDINGS_PROVIDER=bedrock
EMBEDDINGS_PROVIDER_REGION=<AWS_Region> # e.g., us-west-2
EMBEDDINGS_MODEL_NAME=<Inference_Profile_ID_or_Provisioned_ARN> # e.g., us.amazon.titan-embed-text-v2:0
```

#### To deploy NudgeBee AI models on AWS Bedrock and integrate [NudgeBee Model Deployment](./aws_bedrock_custom_model.md) 