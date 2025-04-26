# Deploying Nudgebee AI on AWS SageMaker

## Overview

This guide walks you through deploying the Nudgebee AI model on AWS SageMaker.

## Prerequisites

- AWS account with access to SageMaker, S3, IAM, and ECR
- Trained Nudgebee model (`.tar.gz`)
- Model uploaded to an S3 bucket
- IAM role with required permissions

## Step-by-Step Guide

### Step 1: Upload Model to S3

1. Log in to [AWS Console](https://aws.amazon.com/console/)
2. Go to **Amazon S3**
3. Create or open a bucket
4. Upload `nudgebee_model.tar.gz` to the bucket

### Step 2: Create SageMaker Model

1. Open **Amazon SageMaker**
2. Go to **Models** > **Create model**
3. Name the model (e.g., `nudgebee-ai-model`)
4. Provide ECR container image URL
5. Add S3 path to the model artifact
6. Choose IAM role with permissions
7. Click **Create model**

### Step 3: Deploy Endpoint

1. Go to **Inference** > **Endpoint Configurations**
2. Create new configuration and add the model
3. Choose instance type (e.g., `ml.m5.large`)
4. Create endpoint and wait for it to become **InService**

## RAG and LLM Server Configuration

### RAG Server (SageMaker)

```sh
EMBEDDINGS_PROVIDER=sagemaker
EMBEDDINGS_PROVIDER_REGION=<AWS_SageMaker_Region>
EMBEDDINGS_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL>
EMBEDDINGS_MODEL_NAME=<Model_Name>
```

### LLM Server (SageMaker)

```sh
LLM_PROVIDER=sagemaker
LLM_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL>
LLM_PROVIDER_REGION=<AWS_SageMaker_Region>
```

## Testing

1. Use SageMaker Console > Endpoints > Test
2. Provide a JSON request and validate response
