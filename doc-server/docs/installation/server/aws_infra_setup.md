---
sidebar_position: 8
---

# AWS Infrastructure Setup

This guide covers the AWS infrastructure required for on-prem NudgeBee deployments to enable AWS cloud integration features. These CloudFormation stacks should be deployed in the AWS account where NudgeBee's cloud-collector service has access.

## EventBridge Infrastructure

Enables real-time AWS resource event ingestion from customer accounts via EventBridge.

### What It Creates

- **SQS Queue** (`nudgebee-eventbridge-queue`) - Receives EventBridge events from customer AWS accounts
- **SQS Dead Letter Queue** (`nudgebee-eventbridge-dlq`) - Captures failed messages after 3 retries
- **Queue Policy** - Allows cross-account EventBridge rules to send messages

### Deployment

Deploy the CloudFormation template in the AWS account where NudgeBee is running:

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

Enables bulk onboarding of AWS Organization member accounts via CloudFormation StackSets.

### What It Creates

- **SNS Topic** (`nudgebee-org-registration`) - Receives CloudFormation Custom Resource callbacks from member accounts
- **SQS Queue** (`nudgebee-org-registration-queue`) - Subscribed to the SNS topic, polled by cloud-collector
- **SQS Dead Letter Queue** (`nudgebee-org-registration-dlq`) - Captures failed messages after 3 retries
- **SNS-to-SQS Subscription** - Automatically routes SNS messages to the SQS queue

### Deployment

Deploy the CloudFormation template in the AWS account where NudgeBee is running:

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
  AWS_ORG_TEMPLATE_URL: "<url-to-your-hosted-org-member-template>"
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

## Configuration Reference

After deploying both stacks, your Helm values should include:

```yaml
nudgebee_secret:
  # EventBridge events
  CLOUD_COLLECTOR_AWS_EVENTBRIDGE_SQS: "<SQSQueueUrl from eventbridge stack>"

  # Organization onboarding
  AWS_ORG_TEMPLATE_URL: "<url-to-org-member-cloudformation-template>"
  AWS_ORG_SNS_TOPIC_ARN: "<SNSTopicArn from org-registration stack>"
  CLOUD_COLLECTOR_ORG_REGISTRATION_SQS: "<SQSQueueUrl from org-registration stack>"
```

For full configuration reference, see [NudgeBee Configurations](./secret_configs.md#cloud-integration).
