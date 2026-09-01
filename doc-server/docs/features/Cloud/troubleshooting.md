---
id: cloud-sync-troubleshooting
title: "Cloud Synchronization & Missing Data Troubleshooting"
sidebar_label: Cloud Sync & Missing Data
sidebar_position: 9
keywords: [cloud sync troubleshooting, missing billing data, aws assume role failed, cur missing, azure cost missing, gcp bigquery error, cloud throttling]
intent: diagnose
provider: cloud
error_codes: [CLOUD_ASSUME_ROLE_FAILED, CUR_BUCKET_ACCESS_DENIED, BIGQUERY_DATASET_NOT_FOUND, CLOUD_RATE_LIMITED]
---

# Cloud Synchronization & Missing Data Troubleshooting

This guide provides targeted troubleshooting steps when cloud accounts in **AWS**, **Azure**, or **GCP** are missing billing data, showing incomplete resource inventories, or failing cross-account synchronization.

---

## 1. Diagnostic Decision Tree for Cloud Synchronization

```mermaid
flowchart TD
    Start[Cloud Account Issue] --> Problem{What is the primary symptom?}
    
    Problem -->|Spends Missing / $0| S1{Check Billing Export}
    S1 -->|AWS| S2[Verify S3 CUR Bucket Path & Parquet Format]
    S1 -->|Azure| S3[Verify Cost Management Export Scope & Blob SAS]
    S1 -->|GCP| S4[Verify BigQuery Billing Export Dataset & IAM]
    
    Problem -->|Resources Missing| R1{Check IAM Permissions}
    R1 -->|AWS| R2[Test sts:AssumeRole from NudgeBee Backend Role]
    R1 -->|Azure| R3[Check Reader Role on Subscription / MG]
    R1 -->|GCP| R4[Check roles/viewer on Project / Org]
    
    Problem -->|Sync Degraded / Slow| T1{Check Cloud Throttling}
    T1 --> T2[Check CloudWatch / Azure Monitor for 429 & Throttling Limits]
```

---

## 2. Troubleshooting Missing Spends & Billing Data

---

### A. AWS Cost & Usage Report (CUR) Missing or Unread
* **Symptom**: Cloud Account details show resources and events, but the Spends chart shows `$0` or `No Spends Data Available`.
* **Root Causes**:
  1. **S3 Bucket Policy**: The S3 bucket storing CUR parquet files lacks read permissions for the NudgeBee Cloud Collector IAM role.
  2. **CUR Compression / Format**: NudgeBee requires CUR format set to **Parquet (GZIP / Snappy)** with Athena/Glue integration. Legacy CSV CUR files cannot be parsed.
* **Remediation**:
  1. In AWS Billing Console $\rightarrow$ Cost and Usage Reports, ensure report format is **Parquet**.
  2. Add the following statement to the S3 CUR bucket policy:
     ```json
     {
       "Sid": "AllowNudgeBeeCURRead",
       "Effect": "Allow",
       "Principal": {
         "AWS": "arn:aws:iam::<NUDGEBEE_ACCOUNT_ID>:role/nudgebee-cloud-collector"
       },
       "Action": [
         "s3:GetObject",
         "s3:ListBucket"
       ],
       "Resource": [
         "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>",
         "arn:aws:s3:::<YOUR_CUR_BUCKET_NAME>/*"
       ]
     }
     ```

---

### B. GCP BigQuery Billing Export Permission Error
* **Symptom**: GCP account sync log displays `bigquery.tables.getData: Access Denied`.
* **Root Cause**: The Service Account has `Viewer` on the GCP project, but lacks the specific `BigQuery Data Viewer` role on the **Billing Export Dataset**.
* **Remediation**:
  In Google Cloud Console $\rightarrow$ BigQuery, locate the `gcp_billing_export_v1_*` dataset and grant `roles/bigquery.dataViewer` to the NudgeBee Service Account email.

---

## 3. Troubleshooting Cross-Account IAM & Role Assumption

### AWS: `sts:AssumeRole` Failed
* **Symptom**: Account status shows `Disconnected` with message `The role cannot be assumed or does not exist`.
* **Root Causes**:
  1. **External ID Mismatch**: If an `ExternalId` condition was specified during onboarding, it must match the account's registered secret in NudgeBee.
  2. **Trust Policy Condition**: The IAM Role's trust policy restricts access to an outdated NudgeBee backend ARN.
* **Verification Command** (run from AWS CLI with administrator privileges):
  ```bash
  aws sts assume-role \
    --role-arn "arn:aws:iam::<TARGET_ACCOUNT_ID>:role/NudgeBeeCrossAccountRole" \
    --role-session-name "NudgeBeeTestSession"
  ```

---

## 4. NuBi Cloud Diagnostic Prompts

Ask NuBi in chat:
- *"Diagnose why spends data is missing for AWS account [account-id]."*
- *"Test assume role permissions for cloud account [account-name]."*
- *"Check BigQuery billing dataset connectivity for GCP project [project-id]."*
