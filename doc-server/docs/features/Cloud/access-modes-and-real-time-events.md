---
sidebar_position: 7.7
sidebar_label: Access Modes & Real-Time Events
keywords: [read-only mode, standard mode, aws access mode, connect eventbridge, eventbridge not receiving events, real-time events, connect event grid, gcp real-time alerts, update permissions]
---

# Access Modes & Real-Time Events

## AWS access mode

You choose the access mode when you connect an AWS account:

| Mode | What NudgeBee can do |
|---|---|
| **Standard** | Read everything, plus create CloudWatch alarms, run resource actions and apply recommendation fixes. CloudFormation onboarding in this mode also deploys the EventBridge rules for real-time events. |
| **Read-Only** | Read only. CloudWatch alarm creation, EventBridge event tracking and automated recommendation actions are unavailable. |

A Read-Only account shows this banner on its pages: *This account is connected in read-only mode. CloudWatch alarm creation, EventBridge event tracking, and automated recommendation actions are unavailable.*

To change permissions on an account connected with the CloudFormation template, use **Update Permissions** in its row menu (**Admin → Integrations → Kubernetes & Cloud → AWS**). It opens the stack update in the AWS console, where you set the access mode (read-write or read-only) and SSM Parameter Store read access, then submit the update.

The permissions each mode needs are listed in [AWS](./AWS.md).

## Real-time events

Without real-time events, NudgeBee learns about changes on its regular sync. Connect them to get events within minutes.

### AWS — Connect EventBridge

An AWS account onboarded with the CloudFormation template in **Standard** mode already has the EventBridge rules. Use **Connect EventBridge** for accounts that don't — for example Read-Only accounts or accounts connected with a manually created role.

1. Open **Admin → Integrations → Kubernetes & Cloud → AWS**.
2. In the account's row menu, choose **Connect EventBridge** (**Manage EventBridge** once connected).
3. Follow the steps to deploy the EventBridge stack in your AWS account. It creates only the EventBridge resources NudgeBee needs.

The events forwarded are EC2 instance state changes, RDS instance events, ECS service actions and task state changes, CloudWatch alarm state changes, and API calls (through CloudTrail) for EC2, RDS, ECS, Lambda, load balancers, SQS and SNS.

The **Real-Time Events** column shows the status:

| Status | Meaning |
|---|---|
| **waiting for events** | Recently connected; the first event appears once the stack is created in AWS |
| **active** | An event arrived in the last 7 days |
| **no recent events** | No event for more than 7 days — check that the EventBridge stack still exists in the AWS account |
| **no events received** | Connected a while ago but nothing has arrived — the stack may not have been created, or it isn't delivering |

### Azure — Connect Event Grid

In **Admin → Integrations → Kubernetes & Cloud → Azure**, choose **Connect Event Grid** in the subscription's row menu (**Manage Event Grid** once connected) to receive Azure resource-change events in real time — resource writes, deletes and actions such as VM start/stop and SQL operations.

### GCP — Enable Real-Time Alerts

In **Admin → Integrations → Kubernetes & Cloud → GCP**, choose **Enable Real-Time Alerts** in the project's row menu (**Manage Real-Time Alerts** once enabled). See [GCP](./GCP.md).

## Related

- [AWS](./AWS.md)
- [Cloud Synchronization & Missing Data Troubleshooting](./troubleshooting.md)
- [Troubleshoot](./troubleshoot-tab.md)
