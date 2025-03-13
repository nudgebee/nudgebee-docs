# Deploying Nudgebee AI on AWS SageMaker and Bedrock  

## Overview  

This guide provides detailed steps to deploy the Nudgebee AI model on **AWS SageMaker** and **AWS Bedrock (Custom Model)**, including configuration for both the **RAG server** and **LLM server** to use the deployed model.  

## **Prerequisites**  

Before proceeding, ensure you have:  

- An AWS account with permissions for SageMaker, Bedrock, S3, IAM, and ECR.  
- A trained Nudgebee AI model in a supported format (`.tar.gz`).  
- The model file uploaded to an Amazon S3 bucket.  
- An IAM role with the necessary permissions.  
- The RAG and LLM servers properly configured to interact with the deployed model.

## **Deploying on AWS SageMaker**  

### **Step 1: Upload Model to S3**  

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).  
2. Navigate to **Amazon S3**.  
3. Click **Create Bucket** (if you don’t have an existing S3 bucket).  
4. Provide a **Bucket name** and configure settings as needed.  
5. Click **Create bucket**.  
6. Open the bucket, then click **Upload**.  
7. Click **Add files**, select `nudgebee_model.tar.gz`, and click **Upload**.  

### **Step 2: Create a SageMaker Model**  

1. Navigate to **Amazon SageMaker**.  
2. Go to **Models** > **Create model**.  
3. Enter a **Model name** (e.g., `nudgebee-ai-model`).  
4. Choose **Use an existing container** and enter the Amazon ECR container image URL.  
5. Under **Model artifacts**, enter the full S3 path of the uploaded model file.  
6. Select an **IAM Role** with SageMaker and S3 access.  
7. Click **Create model**.  

### **Step 3: Configure and Deploy Endpoint**  

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


## **Deploying on AWS Bedrock - Custom Model**  

AWS Bedrock now supports **custom model hosting**, allowing you to deploy your own model as a fully managed endpoint.  

### **Step 1: Upload the Model to S3**  

Follow the same **Step 1** from the SageMaker section to upload the model file to S3.  

### **Step 2: Register the Custom Model in Bedrock**  

1. Navigate to **Amazon Bedrock** in the AWS Console.  
2. Click **Custom Models** > **Create Custom Model**.  
3. Enter a **Model name** (e.g., `nudgebee-custom-llm`).  
4. Under **Model artifacts**, provide the full S3 path of the uploaded model file.  
5. Select an **IAM role** with access to S3 and Bedrock.  
6. Click **Create Model**.  

### **Step 3: Deploy the Custom Model**  

1. Once the model is registered, navigate to **Custom Models** > **Deploy Model**.  
2. Select the registered model from Step 2.  
3. Choose an **Instance type** (e.g., `ml.g5.2xlarge`).  
4. Set **Auto-scaling policies** (optional).  
5. Click **Deploy** and wait until the model becomes active.

## **Configuring RAG Server to Use SageMaker or Bedrock**  

### **Environment Variables for RAG Server**  

For SageMaker:  

```sh
EMBEDDINGS_PROVIDER=sagemaker  
EMBEDDINGS_PROVIDER_REGION=<AWS_SageMaker_Region>  
EMBEDDINGS_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL>
EMBEDDINGS_MODEL_NAME=<Custom_Bedrock_Model_ID>  
```

For Bedrock (Custom Model):  

```sh
EMBEDDINGS_PROVIDER=bedrock  
EMBEDDINGS_PROVIDER_REGION=<AWS_Region>  
EMBEDDINGS_MODEL_NAME=<Custom_Bedrock_Model_ID>  
```

## **Configuring LLM Server to Use SageMaker or Bedrock**  

### **Environment Variables for LLM Server**  

For SageMaker:  

```sh
LLM_PROVIDER=sagemaker  
LLM_PROVIDER_API_ENDPOINT=<SageMaker_Endpoint_URL>  
LLM_PROVIDER_REGION=<AWS_SageMaker_Region>  
```

For Bedrock (Custom Model):  

```sh
LLM_PROVIDER=bedrock  
LLM_PROVIDER_REGION=<AWS_Region>  
LLM_PROVIDER_CUSTOM_MODEL_ID=<Custom_Bedrock_Model_ID>  
```

## **Testing the Deployment**  

### **For SageMaker**  

1. Go to **Endpoints** in SageMaker.  
2. Select the deployed endpoint and navigate to **Test endpoint**.  
3. Upload a JSON request with text data for AI processing.  
4. Click **Invoke** and verify the response.  

### **For Bedrock**  

1. Use the **AWS SDK** or **CLI** to invoke the custom model:  

   ```sh
   aws bedrock-runtime invoke-model \
     --model-id <Custom_Bedrock_Model_ID> \
     --content-type application/json \
     --body '{"prompt": "Hello, how can I help you?"}'  
   ```  

2. Verify the model response.

## **Conclusion**  

You have successfully deployed the Nudgebee AI model on **AWS SageMaker** and **AWS Bedrock (Custom Model)**, configuring both the **RAG server** and **LLM server** to interact with the selected platform.  

