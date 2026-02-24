---
sidebar_position: 8
---

# AWS Infrastructure Setup

This guide covers the complete AWS setup required for on-prem NudgeBee deployments to enable AWS cloud integration features, including single-account onboarding and AWS Organization bulk onboarding.

## Prerequisites

Before enabling AWS cloud integration, complete the following steps in the AWS account where NudgeBee is deployed.

### 1. AWS Credentials for NudgeBee

NudgeBee services need AWS credentials to interact with AWS APIs (STS, SQS, CloudFormation, etc.).

**If NudgeBee is running on EKS:** Use [IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) or [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html). No additional credential configuration is needed.

**If NudgeBee is NOT running on EKS:** Provide AWS credentials via Helm values:

```yaml
nudgebee_secret:
  AWS_ACCESS_KEY_ID: "<your-access-key>"
  AWS_SECRET_ACCESS_KEY: "<your-secret-key>"
  AWS_DEFAULT_REGION: "<your-region>"
```

### 2. Create the NudgeBee IAM Role

NudgeBee uses a central IAM role to assume cross-account roles in customer AWS accounts. This role ARN is passed as a parameter to CloudFormation templates deployed in customer accounts, so that the cross-account role's trust policy allows NudgeBee to assume it.

#### Create the Role

1. Go to **IAM > Roles > Create Role** in the NudgeBee AWS account
2. Select **AWS Service** as trusted entity type, choose **EC2** (or the appropriate service for your deployment)
3. Name the role (e.g., `NudgebeeInstanceRole`)
4. Attach the following **minimum permissions**:
   - `sts:AssumeRole` - To assume cross-account roles in customer accounts
   - `sqs:ReceiveMessage`, `sqs:DeleteMessage`, `sqs:GetQueueAttributes` - To poll SQS queues (EventBridge events and org registration)
   - `sns:Publish` - If using SNS for org registration callbacks
   - `cloudformation:CreateStackSet`, `cloudformation:CreateStackInstances` - If using AWS Organization onboarding

:::tip
If using IRSA or Pod Identity, create the role with the appropriate trust policy for your EKS cluster instead of EC2.
:::

#### Configure in Helm

Set the role ARN in your Helm values:

```yaml
nudgebee_secret:
  NUDGEBEE_INSTANCE_ROLE: "arn:aws:iam::<nudgebee-account-id>:role/NudgebeeInstanceRole"
```

This role ARN is used by NudgeBee to:
- Extract the NudgeBee AWS account ID for cross-account trust policies
- Pass as a parameter to CloudFormation templates so customer cross-account roles trust this role

### 3. CloudFormation Templates

The CloudFormation templates are hosted by NudgeBee and available at the following URLs:

#### Single Account Template

```yaml
nudgebee_secret:
  AWS_TEMPLATE_URL: "https://nudgebee-prod-documents.s3.amazonaws.com/nudgebee-aws-cloud-formation.json"
```

#### Organization Member Template (Optional)

If using AWS Organization onboarding:

```yaml
nudgebee_secret:
  AWS_ORG_TEMPLATE_URL: "https://nudgebee-prod-documents.s3.us-east-1.amazonaws.com/nudgebee-aws-org-member-template.json"
```

:::note
For self-hosted deployments, you can upload these templates to your own S3 bucket and set the URLs accordingly. AWS CloudFormation requires S3-hosted templates.
:::

---

## EventBridge Infrastructure

Enables real-time AWS resource event ingestion from customer accounts via EventBridge. This is **optional** - only required if you want real-time event monitoring.

**Download:** [nudgebee-eventbridge-infrastructure.yaml](/cloudformation/nudgebee-eventbridge-infrastructure.yaml)

### What It Creates

- **SQS Queue** (`nudgebee-eventbridge-queue`) - Receives EventBridge events from customer AWS accounts
- **SQS Dead Letter Queue** (`nudgebee-eventbridge-dlq`) - Captures failed messages after 3 retries
- **Queue Policy** - Allows cross-account EventBridge rules to send messages

### Deployment

Deploy the CloudFormation template in the NudgeBee AWS account:

```bash
aws cloudformation create-stack \
  --stack-name nudgebee-eventbridge-infra \
  --template-body file://nudgebee-eventbridge-infrastructure.yaml \
  --region <your-region>
```

#### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SQSQueueName` | `nudgebee-eventbridge-queue` | Name of the SQS queue |
| `SQSDLQName` | `nudgebee-eventbridge-dlq` | Name of the dead letter queue |
| `SQSMessageRetentionPeriod` | `1209600` (14 days) | Message retention in seconds |
| `SQSVisibilityTimeout` | `300` (5 min) | Visibility timeout in seconds |

### After Deployment

1. Go to the CloudFormation stack **Outputs** tab
2. Copy the `SQSQueueUrl` value
3. Set it as `CLOUD_COLLECTOR_AWS_EVENTBRIDGE_SQS` in your Helm values:

```yaml
nudgebee_secret:
  CLOUD_COLLECTOR_AWS_EVENTBRIDGE_SQS: "https://sqs.<region>.amazonaws.com/<account-id>/nudgebee-eventbridge-queue"
```

4. The `SQSQueueArn` output is used when setting up EventBridge rules in customer accounts to target this queue

---

## Organization Registration Infrastructure

Enables bulk onboarding of AWS Organization member accounts via CloudFormation StackSets. This is **optional** - only required if you want to use AWS Organization onboarding.

**Download:** [nudgebee-org-registration-infrastructure.yaml](/cloudformation/nudgebee-org-registration-infrastructure.yaml)

### What It Creates

- **SNS Topic** (`nudgebee-org-registration`) - Receives CloudFormation Custom Resource callbacks from member accounts
- **SQS Queue** (`nudgebee-org-registration-queue`) - Subscribed to the SNS topic, polled by cloud-collector
- **SQS Dead Letter Queue** (`nudgebee-org-registration-dlq`) - Captures failed messages after 3 retries
- **SNS-to-SQS Subscription** - Automatically routes SNS messages to the SQS queue

### Deployment

Deploy the CloudFormation template in the NudgeBee AWS account:

```bash
aws cloudformation create-stack \
  --stack-name nudgebee-org-registration-infra \
  --template-body file://nudgebee-org-registration-infrastructure.yaml \
  --region <your-region>
```

#### Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SNSTopicName` | `nudgebee-org-registration` | Name of the SNS topic |
| `SQSQueueName` | `nudgebee-org-registration-queue` | Name of the SQS queue |
| `SQSDLQName` | `nudgebee-org-registration-dlq` | Name of the dead letter queue |
| `SQSMessageRetentionPeriod` | `1209600` (14 days) | Message retention in seconds |
| `SQSVisibilityTimeout` | `300` (5 min) | Visibility timeout in seconds |

### After Deployment

1. Go to the CloudFormation stack **Outputs** tab
2. Copy the following values and set them in your Helm values:

```yaml
nudgebee_secret:
  AWS_ORG_SNS_TOPIC_ARN: "arn:aws:sns:<region>:<account-id>:nudgebee-org-registration"
  CLOUD_COLLECTOR_ORG_REGISTRATION_SQS: "https://sqs.<region>.amazonaws.com/<account-id>/nudgebee-org-registration-queue"
```

| Stack Output | Helm Config Key |
|-------------|-----------------|
| `SNSTopicArn` | `AWS_ORG_SNS_TOPIC_ARN` |
| `SQSQueueUrl` | `CLOUD_COLLECTOR_ORG_REGISTRATION_SQS` |

### How It Works

1. Admin initiates AWS Organization onboarding from the NudgeBee UI
2. A CloudFormation StackSet is deployed to organization member accounts using the template at `AWS_ORG_TEMPLATE_URL`
3. Each member account's stack sends a registration event to the SNS topic (`AWS_ORG_SNS_TOPIC_ARN`)
4. The SNS topic forwards events to the SQS queue (`CLOUD_COLLECTOR_ORG_REGISTRATION_SQS`)
5. The cloud-collector service polls the SQS queue and auto-registers each member account

---

## Complete Configuration Reference

After completing all setup steps, your Helm values should include:

```yaml
nudgebee_secret:
  # AWS credentials (only if NOT running on EKS with IRSA/Pod Identity)
  AWS_ACCESS_KEY_ID: "<your-access-key>"
  AWS_SECRET_ACCESS_KEY: "<your-secret-key>"
  AWS_DEFAULT_REGION: "<your-region>"

  # NudgeBee IAM role (required for AWS integration)
  NUDGEBEE_INSTANCE_ROLE: "arn:aws:iam::<nudgebee-account-id>:role/NudgebeeInstanceRole"

  # CloudFormation templates
  AWS_TEMPLATE_URL: "https://nudgebee-prod-documents.s3.amazonaws.com/nudgebee-aws-cloud-formation.json"
  AWS_ORG_TEMPLATE_URL: "https://nudgebee-prod-documents.s3.us-east-1.amazonaws.com/nudgebee-aws-org-member-template.json"

  # EventBridge events (optional)
  CLOUD_COLLECTOR_AWS_EVENTBRIDGE_SQS: "<SQSQueueUrl from eventbridge stack>"

  # Organization onboarding (optional)
  AWS_ORG_SNS_TOPIC_ARN: "<SNSTopicArn from org-registration stack>"
  CLOUD_COLLECTOR_ORG_REGISTRATION_SQS: "<SQSQueueUrl from org-registration stack>"
```

For full configuration reference, see [NudgeBee Configurations](./secret_configs.md#cloud-integration).
