# Amazon Web Services (AWS)

NudgeBee connects to your AWS accounts to discover resources, collect CloudWatch alarms, and analyze Cost & Usage Reports (CUR) for cost optimization. You can connect a **single account** using one of three methods, or onboard an **entire AWS Organization** at once.

## Prerequisite — Cost & Usage Report

Cost features (spend tracking, rightsizing, and cost recommendations) read an AWS
**Cost & Usage Report (CUR)**. Everything else — resource discovery, CloudWatch
alarms, events, and recommendations that are not cost-based — works without one.

* **Method 1 (CloudFormation)** creates the CUR for you. Nothing to do.
* **Methods 2 and 3 (IAM Role ARN / Access Keys)** need a CUR that already
  exists in the account. If none is found, the account is still created — you
  will see a warning that cost data is unavailable, and you can attach a report
  later with **Edit Billing Config** (see [Adding a CUR later](#adding-a-cur-later)).

NudgeBee can only ingest a report with **Daily** granularity and **text/csv**
format.

:::warning
The default export type in the AWS console is **Standard data export** (CUR 2.0).
NudgeBee cannot use those exports: they are managed by a different API, so
NudgeBee does not even discover them, and their column layout differs from the
legacy report. Choose the **Legacy CUR export** type instead, with Daily
granularity and gzip text/csv output.
:::

### Creating a CUR

1. In the AWS Console, open **Billing and Cost Management** and choose
   **Data Exports** in the navigation pane. The standalone *Cost & Usage Reports*
   page no longer exists — legacy reports are created and listed here.
2. Click **Create**. Under **Export type**, choose **Legacy CUR export** — not
   *Standard data export* (CUR 2.0).
3. Enter an **Export name** (e.g. `nudgebeeReport`) and note it — you may need it
   for Edit Billing Config.
4. Under **Export content**, tick **Include resource IDs**. Without it the report
   has no per-resource line items: total spend still shows, but per-resource
   cost and rightsizing savings stay empty.
5. Under **Data table delivery options**, set **Time granularity** to **Daily**.
   Either **Report versioning** option works; the CloudFormation template uses
   *Overwrite existing report*.
6. Leave every **Report data integration** option unticked. Selecting Amazon
   Athena switches the file format to Parquet, which NudgeBee cannot read.
7. Set **Compression type and file format** to **gzip – text/csv**.
8. Under **Data export storage settings**, choose or create an S3 bucket, accept
   the generated bucket policy, and optionally set an S3 path prefix.
9. Click **Create report**.

AWS delivers the first report within 24 hours. NudgeBee picks it up on the next
daily sync — you do not need to re-onboard the account.

The IAM role or user also needs `cur:DescribeReportDefinitions` and
`s3:GetBucketLocation` / `s3:ListBucket` / `s3:GetObject` on that bucket. All of these
are in the [manual role policy](#least-privilege-iam-policy-manual-role-creation)
below.

---

## Connecting a Single Account

Open **Admin → Integrations → AWS → Add AWS Account**. The form offers three connection methods as tabs — **CloudFormation**, **IAM Role ARN**, and **Access Keys** — so you can pick whichever fits your AWS setup.

![Switching between the three AWS connection methods — CloudFormation, IAM Role ARN, and Access Keys — in the Add AWS Account form](./img/aws-connection-methods.gif)

### Fields Common to All Methods

* **Display Name** (required) — a friendly name to identify this account in NudgeBee (e.g. `aws-production`).
* **Access Mode** — choose **Standard** (read + write, allows NudgeBee to create CloudWatch alarms and apply recommendations) or **Read-Only** (monitoring only).
* **Enable SSM Parameter Store access** (CloudFormation method) — lets NudgeBee read SSM parameter values. Only enable this if your parameters do not contain secrets.

---

### Method 1 — CloudFormation (Recommended)

This method uses an AWS CloudFormation stack to create the required IAM role automatically, and NudgeBee detects the account once the stack is created — **no values need to be copied back**.

![The CloudFormation connection method in the Add AWS Account form](./img/aws-cloudformation.png)

1. **Give the account a name** — enter a **Display Name**.
2. **Click "Connect via AWS Console"** — you are redirected to the AWS CloudFormation console in a new tab with the template pre-loaded. **Do not change any pre-filled values.** Acknowledge that the stack may create IAM resources and click **Create stack**.
3. **Wait for auto-detection** — once the CloudFormation stack reaches `CREATE_COMPLETE`, the account is detected and registered automatically. There is no need to copy a Role ARN back into NudgeBee.

In the AWS Console, the **Quick create stack** page opens with the NudgeBee template and stack name pre-filled. Leave the values unchanged, acknowledge the IAM capabilities at the bottom, and click **Create stack**.

![The pre-filled AWS CloudFormation Quick create stack page launched from NudgeBee, showing the NudgeBee template URL and stack name](./img/aws-cloudformation-console.png)

---

### Method 2 — IAM Role ARN

Use this flow if you already have a **cross-account IAM role** that NudgeBee can assume.

The role's **trust policy** must let NudgeBee's principal call `sts:AssumeRole`, and its
**permissions policy** must grant at least the read-only set in
[Least-Privilege IAM Policy](#least-privilege-iam-policy-manual-role-creation) — including
`cur:DescribeReportDefinitions` and `s3:GetBucketLocation` / `s3:ListBucket` / `s3:GetObject`
on the CUR bucket if you want cost data.

1. Enter a **Display Name** and choose an **Access Mode**.
2. Paste the **IAM Role ARN** (e.g. `arn:aws:iam::123456789012:role/NudgebeeRole`).
3. Optionally provide an **External ID** — required only if the role's trust policy specifies one.
4. Click **Validate** — NudgeBee probes STS, Cost & Usage Report discovery, and CUR S3 access upfront — then click **Connect**.

Only the STS check has to pass. If no usable CUR is found, the checks show a
warning and **Connect** stays enabled: the account is created without cost data,
which you can add later.

---

### Method 3 — Access Keys

Use this flow when you **cannot grant a cross-account role** (for example, segregated billing accounts or dev/test accounts). Create an IAM user with the same CUR + read-only permissions as the CloudFormation template, then provide its keys.

1. Enter a **Display Name** and choose an **Access Mode**.
2. Paste the **AWS Access Key ID** and **AWS Secret Access Key**.
3. Set the **AWS Region** used to bootstrap the AWS SDK (CUR discovery always runs in `us-east-1`).
4. Click **Validate**, then **Connect**. As with the Role ARN method, a missing
   CUR is a warning rather than a blocker.

---

## Onboarding an Entire AWS Organization

To connect many accounts at once, use **AWS Organization** onboarding, which deploys a CloudFormation **StackSet** across your organization.

![AWS Organization onboarding — set an organization name, then deploy a CloudFormation StackSet to register member accounts automatically](./img/aws-org-onboarding.png)

1. **Set Organization Name** — enter a display name for the organization.
2. **Generate credentials** — NudgeBee creates a verification token and a StackSet template URL for you.
3. **Deploy the StackSet** — launch the CloudFormation StackSet in your AWS **Management Account** console using service-managed permissions, targeting your entire organization or selected OUs (with automatic deployment for new accounts).
4. **Automatic registration** — member accounts appear in NudgeBee automatically as the StackSet deploys to each one.

:::note
StackSets deploy only to **member** accounts, not the management account itself. If you also want to monitor your management account, add it separately using **Add AWS Account**.
:::

---

## Least-Privilege IAM Policy (Manual Role Creation)

Use this if you cannot run the CloudFormation template and want to create the
cross-account role yourself. It takes two policies: a **trust policy** that lets
NudgeBee assume the role, and a **permissions policy** that grants what NudgeBee
reads.

A manually created role supports the **Read-Only** access mode. The write
permissions behind **Standard** mode and the EventBridge event pipeline are only
deployed by the CloudFormation template — see
[Standard access mode](#standard-access-mode-with-a-manual-role) below.

### Step 1 — Trust policy

NudgeBee assumes your role from its own IAM principal. To find that principal's
ARN, open **Add AWS Account**, stay on the **CloudFormation** tab and click
**Connect via AWS Console**: the Quick create page lists it as the
`NudgebeeIamRole` parameter. Copy the value and close the tab without creating
the stack. On a self-hosted install it is the `NUDGEBEE_INSTANCE_ROLE` value from
the Helm values.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "<NUDGEBEE_IAM_PRINCIPAL_ARN>" },
      "Action": "sts:AssumeRole",
      "Condition": { "StringEquals": { "sts:ExternalId": "<YOUR_EXTERNAL_ID>" } }
    }
  ]
}
```

The `Condition` block is optional. If you keep it, enter the same value in the
**External ID** field when you connect the account — NudgeBee sends it on every
`sts:AssumeRole` call, and a trust policy that requires it rejects calls without it.

### Step 2 — Permissions policy

Pick one of the two options.

**Option A — mirror the CloudFormation template.** Attach the AWS-managed
`arn:aws:iam::aws:policy/ReadOnlyAccess` policy, plus this inline policy. This is
what the template grants in Read-Only mode and keeps working as NudgeBee adds
support for more AWS services.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "NudgebeeBillingReadOnly",
      "Effect": "Allow",
      "Action": [
        "budgets:Describe*",
        "budgets:View*",
        "ce:Get*",
        "ce:Describe*",
        "ce:List*",
        "cur:Describe*",
        "pricing:*",
        "organizations:Describe*",
        "organizations:List*",
        "savingsplans:Describe*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgebeeLogsQueryAccess",
      "Effect": "Allow",
      "Action": ["logs:StartQuery", "logs:StopQuery"],
      "Resource": "arn:aws:logs:*:*:log-group:*:*"
    },
    {
      "Sid": "NudgebeeCURS3Access",
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation", "s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>",
        "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>/*"
      ]
    }
  ]
}
```

**Option B — explicit least privilege.** If `ReadOnlyAccess` is too broad for
your policy, attach the following instead. It lists every read action the
current NudgeBee collector calls, grouped by feature so you can drop a statement
for a service you do not use — discovery of that service then reports
`AccessDenied` and is skipped. Because it is a snapshot of today's collector,
re-check it after NudgeBee upgrades; new AWS services need new actions here,
whereas Option A picks them up automatically.

Object reads (`s3:GetObject`) are deliberately limited to the CUR bucket; NudgeBee
reads bucket configuration everywhere but never reads objects outside it.

<details>
<summary><strong>Option B policy document</strong> (seven statements, about 230 read actions)</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "NudgeBeeBillingAndRecommendations",
      "Effect": "Allow",
      "Action": [
        "cur:DescribeReportDefinitions",
        "ce:GetReservationPurchaseRecommendation",
        "ce:GetSavingsPlansPurchaseRecommendation",
        "pricing:GetProducts",
        "cost-optimization-hub:ListRecommendations",
        "compute-optimizer:GetEnrollmentStatus",
        "compute-optimizer:GetEC2InstanceRecommendations",
        "compute-optimizer:GetEBSVolumeRecommendations",
        "compute-optimizer:GetECSServiceRecommendations",
        "compute-optimizer:GetLambdaFunctionRecommendations",
        "support:DescribeTrustedAdvisorChecks",
        "support:DescribeTrustedAdvisorCheckResult"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeCURS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>",
        "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>/*"
      ]
    },
    {
      "Sid": "NudgeBeeMonitoring",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DescribeAlarms",
        "cloudwatch:DescribeAlarmsForMetric",
        "cloudwatch:GetMetricData",
        "cloudwatch:ListMetrics",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:DescribeMetricFilters",
        "logs:FilterLogEvents",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:GetQueryResults",
        "logs:ListTagsForResource",
        "pi:GetResourceMetrics",
        "pi:GetDimensionKeyDetails",
        "xray:GetEncryptionConfig",
        "xray:GetGroups",
        "xray:GetSamplingRules",
        "xray:ListTagsForResource",
        "cloudtrail:DescribeTrails",
        "cloudtrail:GetTrailStatus",
        "cloudtrail:ListTags",
        "cloudtrail:LookupEvents",
        "cloudtrail:ListEventDataStores",
        "cloudtrail:GetEventDataStore"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeComputeDiscovery",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeAddresses",
        "ec2:DescribeFlowLogs",
        "ec2:DescribeInstanceTypes",
        "ec2:DescribeInstances",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeNatGateways",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeRegions",
        "ec2:DescribeRouteTables",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSpotPriceHistory",
        "ec2:DescribeSubnets",
        "ec2:DescribeVolumes",
        "ec2:DescribeVolumesModifications",
        "ec2:DescribeVpcEndpoints",
        "ec2:DescribeVpcs",
        "ec2:GetInstanceTypesFromInstanceRequirements",
        "autoscaling:DescribeAutoScalingInstances",
        "application-autoscaling:DescribeScalableTargets",
        "ecs:DescribeCapacityProviders",
        "ecs:DescribeClusters",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListClusters",
        "ecs:ListServices",
        "ecs:ListTasks",
        "eks:DescribeCluster",
        "eks:DescribeNodegroup",
        "eks:ListClusters",
        "eks:ListNodegroups",
        "lambda:GetFunction",
        "lambda:GetFunctionConcurrency",
        "lambda:ListFunctionUrlConfigs",
        "lambda:ListFunctions",
        "lambda:ListProvisionedConcurrencyConfigs",
        "lambda:ListTags",
        "elasticbeanstalk:DescribeApplications",
        "elasticbeanstalk:DescribeEnvironmentHealth",
        "elasticbeanstalk:DescribeEnvironmentResources",
        "elasticbeanstalk:DescribeEnvironments",
        "elasticbeanstalk:ListTagsForResource",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:DescribeLoadBalancerAttributes",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTags",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetHealth",
        "cloudformation:DescribeStacks",
        "cloudformation:ListStacks",
        "sagemaker:DescribeEndpoint",
        "sagemaker:DescribeNotebookInstance",
        "sagemaker:ListEndpoints",
        "sagemaker:ListNotebookInstances",
        "sagemaker:ListTags",
        "bedrock:GetCustomModel",
        "bedrock:GetModelInvocationLoggingConfiguration",
        "bedrock:GetProvisionedModelThroughput",
        "bedrock:ListCustomModels",
        "bedrock:ListProvisionedModelThroughputs",
        "bedrock:ListTagsForResource",
        "states:DescribeStateMachine",
        "states:ListExecutions",
        "states:ListStateMachines",
        "states:ListTagsForResource",
        "ssm:DescribeDocument",
        "ssm:DescribeInstanceInformation",
        "ssm:DescribeInstancePatches",
        "ssm:DescribeMaintenanceWindows",
        "ssm:DescribeParameters",
        "ssm:DescribePatchBaselines",
        "ssm:ListAssociations",
        "ssm:ListDocuments",
        "ssm:ListTagsForResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeDataAndMessagingDiscovery",
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds:DescribeDBSnapshots",
        "rds:DescribeReservedDBInstances",
        "dynamodb:DescribeContinuousBackups",
        "dynamodb:DescribeTable",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:ListTables",
        "dynamodb:ListTagsOfResource",
        "elasticache:DescribeCacheClusters",
        "elasticache:DescribeCacheEngineVersions",
        "elasticache:ListTagsForResource",
        "redshift:DescribeClusters",
        "es:DescribeElasticsearchDomains",
        "es:ListDomainNames",
        "es:ListTags",
        "kafka:DescribeClusterV2",
        "kafka:ListClusters",
        "kafka:ListClustersV2",
        "efs:DescribeFileSystems",
        "efs:DescribeLifecycleConfiguration",
        "efs:DescribeMountTargets",
        "s3:ListAllMyBuckets",
        "s3:GetBucketAcl",
        "s3:GetEncryptionConfiguration",
        "s3:GetLifecycleConfiguration",
        "s3:GetBucketLocation",
        "s3:GetBucketLogging",
        "s3:GetBucketPolicyStatus",
        "s3:GetBucketTagging",
        "s3:GetBucketVersioning",
        "s3:GetBucketPublicAccessBlock",
        "backup:DescribeBackupVault",
        "backup:GetBackupPlan",
        "backup:GetBackupVaultAccessPolicy",
        "backup:ListBackupPlans",
        "backup:ListBackupVaults",
        "backup:ListTags",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl",
        "sqs:ListQueueTags",
        "sqs:ListQueues",
        "sns:GetTopicAttributes",
        "sns:ListSubscriptionsByTopic",
        "sns:ListTagsForResource",
        "sns:ListTopics",
        "ses:DescribeConfigurationSet",
        "ses:GetIdentityDkimAttributes",
        "ses:GetIdentityMailFromDomainAttributes",
        "ses:GetIdentityNotificationAttributes",
        "ses:GetIdentityVerificationAttributes",
        "ses:ListConfigurationSets",
        "ses:ListIdentities",
        "ecr:DescribeRepositories",
        "ecr:ListTagsForResource",
        "ecr-public:DescribeRepositories",
        "ecr-public:ListTagsForResource",
        "codeartifact:GetRepositoryPermissionsPolicy",
        "codeartifact:ListRepositories",
        "codeartifact:ListTagsForResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeNetworkAndEdgeDiscovery",
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistribution",
        "cloudfront:ListDistributions",
        "cloudfront:ListTagsForResource",
        "route53:GetDNSSEC",
        "route53:GetHealthCheckStatus",
        "route53:ListHealthChecks",
        "route53:ListHostedZones",
        "route53:ListQueryLoggingConfigs",
        "route53:ListResourceRecordSets",
        "route53:ListTagsForResource",
        "directconnect:DescribeConnections",
        "directconnect:DescribeLags",
        "directconnect:DescribeLoa",
        "directconnect:DescribeTags",
        "directconnect:DescribeVirtualInterfaces",
        "wafv2:GetIPSet",
        "wafv2:GetLoggingConfiguration",
        "wafv2:GetWebACL",
        "wafv2:ListIPSets",
        "wafv2:ListRegexPatternSets",
        "wafv2:ListResourcesForWebACL",
        "wafv2:ListTagsForResource",
        "wafv2:ListWebACLs"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeSecurityPosture",
      "Effect": "Allow",
      "Action": [
        "iam:GetAccessKeyLastUsed",
        "iam:GetAccountPasswordPolicy",
        "iam:GetAccountSummary",
        "iam:ListAccessKeys",
        "iam:ListAttachedUserPolicies",
        "iam:ListGroups",
        "iam:ListMFADevices",
        "iam:ListRoleTags",
        "iam:ListRoles",
        "iam:ListUserPolicies",
        "iam:ListUserTags",
        "iam:ListUsers",
        "kms:DescribeKey",
        "kms:GetKeyPolicy",
        "kms:GetKeyRotationStatus",
        "kms:ListKeys",
        "kms:ListResourceTags",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets",
        "guardduty:GetDetector",
        "guardduty:ListDetectors",
        "securityhub:DescribeHub",
        "securityhub:DescribeStandards",
        "securityhub:GetFindings",
        "inspector2:BatchGetAccountStatus",
        "inspector2:ListCoverage",
        "inspector2:ListFindings",
        "config:DescribeComplianceByConfigRule",
        "config:DescribeConfigRuleEvaluationStatus",
        "config:DescribeConfigRules",
        "config:DescribeConfigurationAggregators",
        "config:DescribeConfigurationRecorderStatus",
        "config:DescribeConfigurationRecorders",
        "config:DescribeConformancePackCompliance",
        "config:DescribeConformancePacks",
        "config:DescribeDeliveryChannels",
        "config:ListTagsForResource",
        "config:SelectResourceConfig"
      ],
      "Resource": "*"
    }
  ]
}
```

</details>

### Standard access mode with a manual role

**Standard** mode lets NudgeBee create CloudWatch alarms and apply
recommendations. These are the write actions NudgeBee uses for that; add them to
your role only if you want those features. The CloudFormation template grants
the same set, except the RDS cluster start/stop actions, which only the
collector uses today:

| Feature | Actions |
|---|---|
| CloudWatch alarms | `cloudwatch:PutMetricAlarm`, `cloudwatch:DeleteAlarms` |
| Log-based alarms | `logs:CreateLogGroup`, `logs:TagLogGroup`, `logs:PutMetricFilter`, `logs:DeleteMetricFilter` |
| EC2 remediations | `ec2:StartInstances`, `ec2:StopInstances`, `ec2:RebootInstances`, `ec2:ModifyVolume` |
| RDS remediations | `rds:StartDBInstance`, `rds:StopDBInstance`, `rds:RebootDBInstance`, `rds:StartDBCluster`, `rds:StopDBCluster` |
| ECS remediations | `ecs:UpdateService` |
| Run Command on instances | `ssm:SendCommand`, `ssm:GetCommandInvocation`, `ssm:ListCommandInvocations`, `ssm:DescribeInstanceInformation` |

The template also deploys EventBridge rules in every region that forward
resource state-change events to NudgeBee. A manual role cannot provide that;
without it, NudgeBee learns about changes on its daily sync rather than in near
real time.

---

## Troubleshooting

### "No Cost & Usage Report found matching the required format (DAILY + textORcsv)"

The account has no CUR that NudgeBee can read. The most common cause is having
created a **Data Export / CUR 2.0** report, which is in Parquet format — NudgeBee needs the
legacy report type with **Daily** granularity and **text/csv** format. See
[Creating a CUR](#creating-a-cur).

Since this is a warning and not a blocker, the account itself connects fine.
Resource discovery, alarms, and events all work; only spend, rightsizing, and
cost recommendations stay empty until a readable report exists.

Other causes worth checking:

* The report exists but its granularity is **Hourly** or **Monthly**.
* The report exists but the role or user is missing `cur:DescribeReportDefinitions`.
* The report exists but its S3 bucket was deleted, or CUR lost permission to write
  to it — AWS shows the report in an `ERROR_NO_BUCKET` / `ERROR_PERMISSIONS` state.
  Fix or delete the broken report, then retry.

### Adding a CUR later

For an account already connected without cost data:

1. Create the CUR in AWS if you have not already ([Creating a CUR](#creating-a-cur)).
2. In NudgeBee, open **Admin → Integrations → AWS**, find the account, and choose
   **Edit Billing Config** from its **⋮** menu.
3. Enter the **CUR Report Name**. The **CUR S3 Bucket** is optional — supply it
   only if several reports share a name.
4. Click **Validate**, then **Save**.

NudgeBee also discovers a newly created report on its own during the next daily
sync, so this step is only needed to pick a specific report or to confirm the
setup immediately.

### Cost data is empty but the report exists

AWS delivers a newly created CUR within 24 hours, and NudgeBee ingests it on the
next daily sync — so allow up to two days after creating the report. The account's
spend status is shown on the **Agent Health** page.

<!-- assets verified -->
