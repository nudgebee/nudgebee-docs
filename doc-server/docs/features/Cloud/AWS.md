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
The AWS console now steers you towards **Data Exports** (CUR 2.0), which produces
**Parquet** files. NudgeBee cannot read those. You need the older report type,
created from **Cost & Usage Reports**, with Daily granularity and CSV output.
:::

### Creating a CUR

1. In the AWS Console, open **Billing and Cost Management → Cost & Usage Reports**.
2. Click **Create report**, and choose the **Legacy CUR (CUR 1.0)** report type —
   not Data Exports / CUR 2.0.
3. Give the report a name (e.g. `nudgebeeReport`) and note it — you may need it
   for Edit Billing Config.
4. Set **Time granularity** to **Daily**.
5. Set the report format to **text/csv**, with **GZIP** compression.
6. Choose or create an S3 bucket to deliver the report to, and accept the default
   delivery policy.
7. Create the report.

AWS delivers the first report within 24 hours. NudgeBee picks it up on the next
daily sync — you do not need to re-onboard the account.

The IAM role or user also needs `cur:DescribeReportDefinitions` and
`s3:GetBucketLocation` / `s3:ListBucket` / `s3:GetObject` on that bucket. All of these
are in the [least-privilege policy](#least-privilege-iam-policy-manual-role-creation)
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

The role must allow `sts:AssumeRole`, `cur:DescribeReportDefinitions`, and `s3:GetBucketLocation` / `s3:ListBucket` on the CUR bucket.

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

If you prefer to create a custom IAM role manually instead of using the managed CloudFormation template, attach the following least-privilege policy document to your cross-account role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "NudgeBeeCloudWatchDiscovery",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DescribeAlarms",
        "cloudwatch:DescribeAlarmsForMetric",
        "cloudwatch:GetMetricData",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeEKSDiscovery",
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "*"
    },
    {
      "Sid": "NudgeBeeCostAndUsageDiscovery",
      "Effect": "Allow",
      "Action": [
        "cur:DescribeReportDefinitions",
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetDimensionValues"
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
    }
  ]
}
```

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
