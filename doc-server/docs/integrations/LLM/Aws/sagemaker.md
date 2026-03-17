# Amazon SageMaker Integration

This guide provides detailed instructions for integrating Amazon SageMaker with NudgeBee's LLM Server and RAG Server applications.

## Overview

Amazon SageMaker is a fully managed machine learning service that enables data scientists and developers to build, train, and deploy machine learning models at scale. For NudgeBee applications, SageMaker provides a flexible platform to deploy both foundation models and custom-trained models.

## Prerequisites

- AWS account with SageMaker access enabled
- IAM user with appropriate SageMaker permissions
- AWS Access Key ID and Secret Access Key
- Basic understanding of SageMaker endpoints

## Setting up Amazon SageMaker Credentials

1. **Create IAM User with SageMaker Permissions**:
   ```bash
   aws iam create-user --user-name sagemaker-user
   aws iam attach-user-policy --user-name sagemaker-user --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
   ```

2. **Generate Access Keys**:
   ```bash
   aws iam create-access-key --user-name sagemaker-user
   ```
   Save the returned Access Key ID and Secret Access Key securely.

## Deploying Foundation Models on SageMaker

To deploy foundation models on SageMaker for use with NudgeBee applications:

1. **Navigate to JumpStart in SageMaker Studio**:
   - Open SageMaker Studio
   - Select the "JumpStart" tab
   - Browse available foundation models

2. **Deploy a Foundation Model**:
   - Select your desired model
   - Click "Deploy"
   - Configure instance type and other settings
   - Launch the model

3. **Get the Endpoint Name**:
   - Once deployed, note the endpoint name
   - Add this endpoint name to your NudgeBee configuration

## Custom Model Deployment on SageMaker

To deploy your custom models on SageMaker:

1. **Prepare Your Model Artifacts**:
   - Package your model artifacts
   - Upload to an S3 bucket
   ```bash
   aws s3 cp model.tar.gz s3://your-bucket/models/
   ```

2. **Create a SageMaker Model**:
   ```bash
   aws sagemaker create-model \
     --model-name "your-custom-model" \
     --execution-role-arn "arn:aws:iam::your-account-id:role/SageMakerExecutionRole" \
     --primary-container "Image=your-container-image,ModelDataUrl=s3://your-bucket/models/model.tar.gz"
   ```

3. **Create an Endpoint Configuration**:
   ```bash
   aws sagemaker create-endpoint-config \
     --endpoint-config-name "your-config-name" \
     --production-variants "VariantName=AllTraffic,ModelName=your-custom-model,InstanceType=ml.c5.xlarge,InitialInstanceCount=1"
   ```

4. **Create the Endpoint**:
   ```bash
   aws sagemaker create-endpoint \
     --endpoint-name "your-endpoint-name" \
     --endpoint-config-name "your-config-name"
   ```

## Integrating with LLM Server

1. **Configure SageMaker in LLM Server**:
   
   Add the following configuration to your LLM Server settings:
   
```sh
LLM_PROVIDER=sagemaker
LLM_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL> # e.g., https://your-endpoint-name.amazonaws.com
LLM_PROVIDER_REGION=<AWS_SageMaker_Region> # e.g., us-west-2
```


## Integrating with RAG Server

1. **Configure SageMaker in RAG Server**:

   Add the following configuration to your RAG Server settings:
   
```sh
EMBEDDINGS_PROVIDER=sagemaker
EMBEDDINGS_PROVIDER_REGION=<AWS_SageMaker_Region> # e.g., us-west-2
EMBEDDINGS_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL> # e.g., https://your-endpoint-name.amazonaws.com
EMBEDDINGS_MODEL_NAME=<Model_Name> # e.g., your-custom-model
```


#### To deploy NudgeBee AI models on AWS SageMaker and integrate [NudgeBee Model Deployment](./aws_sagemaker)