# Deploying NudgeBee AI on AWS Bedrock (Custom Model)

## Overview

This guide details the deployment of NudgeBee AI using AWS Bedrock's custom model hosting feature.

## Prerequisites

- AWS account with access to Bedrock and S3
- Trained NudgeBee model in `.tar.gz`
- Model uploaded to an S3 bucket
- IAM role with required access

## Step-by-Step Guide

### Step 1: Upload Model to S3

Same as SageMaker: upload `nudgebee_model.tar.gz` to an S3 bucket.

### Step 2: Register the Model in Bedrock

1. Go to **Amazon Bedrock**
2. Click **Custom Models** > **Create Custom Model**
3. Name the model (e.g., `nudgebee-custom-llm`)
4. Enter the S3 path for model artifacts
5. Select IAM role
6. Click **Create Model**

### Step 3: Deploy the Model

1. Go to **Custom Models** > **Deploy Model**
2. Select model and choose instance type (e.g., `ml.g5.2xlarge`)
3. Set autoscaling (optional)
4. Click **Deploy** and wait until active

## RAG and LLM Server Configuration

### RAG Server (Bedrock)

```sh
EMBEDDINGS_PROVIDER=bedrock
EMBEDDINGS_PROVIDER_REGION=<AWS_Region>
EMBEDDINGS_MODEL_NAME=<Custom_Bedrock_Model_ID>
```

### LLM Server (Bedrock)

```sh
LLM_PROVIDER=bedrock
LLM_PROVIDER_REGION=<AWS_Region>
LLM_MODEL_NAME=<Custom_Bedrock_Model_ID>
```

## Testing

Use AWS CLI:

```sh
aws bedrock-runtime invoke-model \
  --model-id <Custom_Bedrock_Model_ID> \
  --content-type application/json \
  --body '{"prompt": "Hello, how can I help you?"}'
```
