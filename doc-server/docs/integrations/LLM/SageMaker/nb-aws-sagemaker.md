# Deploying Nudgebee AI on AWS SageMaker

## Overview
This guide provides detailed steps to deploy the Nudgebee AI model on AWS SageMaker, including configuration for both the RAG server and LLM server to use the deployed model.


## **Prerequisites**

Before proceeding, ensure you have:
- An AWS account with permissions for SageMaker, S3, IAM, and ECR.
- A trained Nudgebee AI model in a supported format (`.tar.gz`).
- The model file uploaded to an Amazon S3 bucket.
- An IAM role with the necessary permissions.
- The RAG and LLM servers properly configured to interact with the deployed model.


## **Step 1: Upload Model to S3**

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. Navigate to **Amazon S3**.
3. Click **Create Bucket** (if you don’t have an existing S3 bucket).
4. Provide a **Bucket name** and configure settings as needed.
5. Click **Create bucket**.
6. Open the bucket, then click **Upload**.
7. Click **Add files**, select `nudgebee_model.tar.gz`, and click **Upload**.


## **Step 2: Create a SageMaker Model**

1. Navigate to **Amazon SageMaker**.
2. Go to **Models** > **Create model**.
3. Enter a **Model name** (e.g., `nudgebee-ai-model`).
4. Choose **Use an existing container** and enter the Amazon ECR container image URL.
5. Under **Model artifacts**, enter the full S3 path of the uploaded model file.
6. Select an **IAM Role** with SageMaker and S3 access.
7. Click **Create model**.


## **Step 3: Configure and Deploy Endpoint**

1. Navigate to **Inference** > **Endpoint Configurations**.
2. Click **Create endpoint configuration**.
3. Enter a **Configuration name** (e.g., `nudgebee-endpoint-config`).
4. Click **Add model** and select the model from Step 2.
5. Choose an **Instance type** (e.g., `ml.m5.large`).
6. Click **Create endpoint configuration**.
7. Go to **Inference** > **Endpoints**.
8. Click **Create endpoint**.
9. Enter an **Endpoint name** and select the created configuration.
10. Click **Create endpoint** and wait until it becomes **InService**.


## **Step 4: Configure RAG Server to Use SageMaker Endpoint**

Update the environment variables in the RAG server to connect to the deployed model:

### **Environment Variables for RAG Server**

- `EMBEDDINGS_PROVIDER`: `sagemaker`
- `EMBEDDINGS_PROVIDER_REGION`: `<AWS SagwMaker region>`
- `EMBEDDINGS_PROVIDER_API_ENDPOINT`: `<SageMaker endpoint URL>`

Ensure the application correctly sends embedding requests to this endpoint.


## **Step 5: Configure LLM Server to Use SageMaker Model**

To enable the LLM server to interact with the SageMaker-hosted model, update the following environment variables:

### **Environment Variables for LLM Server**

- `LLM_PROVIDER`: `sagemaker`
- `LLM_PROVIDER_API_ENDPOINT`: `<SageMaker endpoint URL>`
- `LLM_PROVIDER_REGION`: `<AWS SageMaker region>`

Ensure that the LLM server correctly forwards chat completion requests to this endpoint.


## **Step 6: Test the Deployment**

1. Go to **Endpoints** in SageMaker.
2. Select the deployed endpoint and navigate to **Test endpoint**.
3. Upload a JSON request with text data for AI processing.
4. Click **Invoke** and verify the response.


## **Conclusion**

You have successfully deployed the Nudgebee AI model on AWS SageMaker and configured both the RAG server and LLM server to use the deployed model.