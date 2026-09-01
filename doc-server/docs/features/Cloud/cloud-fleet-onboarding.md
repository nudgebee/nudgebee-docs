---
id: cloud-fleet-onboarding
title: Cloud Fleet Onboarding (AWS Organizations, Bulk Azure & GCP)
sidebar_label: Fleet Onboarding (AWS, Azure, GCP)
sidebar_position: 4
keywords: [aws organizations onboarding, bulk azure subscriptions, bulk gcp projects, multi-account onboarding, cloud fleet, management group]
intent: setup
provider: cloud
error_codes: [ORG_ONBOARDING_FAILED, SUBSCRIPTION_DISCOVERY_FAILED, PROJECT_DISCOVERY_FAILED]
---

# Cloud Fleet Onboarding (AWS Organizations, Bulk Azure & GCP)

Enterprise organizations typically operate tens or hundreds of cloud accounts across AWS, Azure, and GCP. Rather than manually onboarding individual accounts one at a time, NudgeBee provides automated **Fleet Onboarding** via AWS Organizations, Azure Management Groups, and GCP Organizations.

---

## 1. Fleet Onboarding Architecture

```mermaid
graph TD
    subgraph AWS Fleet [AWS Organizations]
        AWSMgmt[Management / Payer Account<br/>CloudFormation StackSet] -->|Auto-Deploy IAM Role| AWSMembers[All Member Accounts (Auto-Discovered)]
    end

    subgraph Azure Fleet [Azure Management Groups]
        AzureMG[Root Management Group<br/>Enterprise App / Service Principal] -->|Inherited Reader Role| AzureSubs[All Subscriptions (Bulk Onboarded)]
    end

    subgraph GCP Fleet [GCP Resource Hierarchy]
        GCPOrg[GCP Organization / Folder<br/>Org-Level Service Account] -->|BigQuery Billing Export| GCPProjects[All Projects (Auto-Discovered)]
    end

    AWSFleet -->|Continuous Ingestion| NB[NudgeBee Cloud Collector]
    AzureFleet -->|Continuous Ingestion| NB
    GCPFleet -->|Continuous Ingestion| NB
```

---

## 2. AWS Organizations Fleet Onboarding

### How It Works
1. You deploy a primary CloudFormation stack in your AWS **Management (Payer) Account**.
2. An AWS CloudFormation **StackSet** automatically provisions the NudgeBee Cross-Account IAM Role across all existing and newly created AWS member accounts.
3. An Amazon SNS Topic and SQS queue stream real-time account lifecycle events to NudgeBee. When a new AWS account is created in your AWS Organization, NudgeBee automatically registers it without manual steps.

### Step-by-Step Setup:
1. In NudgeBee Console, go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ AWS Organization**.
2. Enter your **Payer Account ID** and primary S3 bucket for the Cost and Usage Report (CUR).
3. Click **Launch Stack in AWS Console**. This opens the CloudFormation wizard with pre-filled template parameters.
4. Check the capability acknowledgement box: `I acknowledge that AWS CloudFormation might create IAM resources with custom names`.
5. Click **Create Stack**.

---

## 3. Bulk Azure Subscriptions Onboarding

### How It Works
By granting permissions at the **Management Group** root level, the NudgeBee Microsoft Entra (Azure AD) Enterprise Application automatically inherits visibility across all linked Azure subscriptions.

### Step-by-Step Setup:
1. Go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ Azure**.
2. Select **Bulk Subscription Discovery (Management Group)**.
3. Follow the Azure Cloud Shell script to register the Service Principal:
   ```bash
   # Assign Reader and Cost Management Reader at the Management Group scope
   az role assignment create \
     --assignee "<NUDGEBEE_APP_CLIENT_ID>" \
     --role "Reader" \
     --scope "/providers/Microsoft.Management/managementGroups/<YOUR_ROOT_MG_ID>"

   az role assignment create \
     --assignee "<NUDGEBEE_APP_CLIENT_ID>" \
     --role "Cost Management Reader" \
     --scope "/providers/Microsoft.Management/managementGroups/<YOUR_ROOT_MG_ID>"
   ```
4. Click **Discover Subscriptions**. NudgeBee lists all discovered subscriptions with check boxes to select which subscriptions to activate.

---

## 4. Bulk GCP Projects Onboarding

### How It Works
A single Google Cloud Service Account created at the **Organization** or **Folder** level allows NudgeBee to discover all active GCP projects and stream BigQuery billing export records.

### Step-by-Step Setup:
1. Go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ GCP**.
2. Select **Organization / Multi-Project**.
3. Grant the required roles to the NudgeBee Service Account at the Organization node:
   - `roles/viewer` (Resource Discovery)
   - `roles/billing.viewer` (Billing Data)
   - `roles/bigquery.dataViewer` (on the BigQuery Billing export dataset)
4. Upload the Service Account private key JSON and click **Verify & Discover Projects**.

---

## 5. Initial Synchronization Expectations & Timelines

When onboarding a cloud fleet, data arrives in three distinct phases:

| Phase | Expected Duration | What Becomes Available |
| :--- | :--- | :--- |
| **1. Resource Discovery** | 5 – 15 minutes | Cloud inventory (EC2, RDS, VMs, Buckets, Subnets) populates the Semantic Knowledge Graph. |
| **2. Spends Ingestion** | 1 – 4 hours | Historical billing data from CUR / BigQuery is aggregated into cost breakdown charts. |
| **3. Recommendations** | 2 – 6 hours | Rightsizing, idle waste, and security posture algorithms complete analysis across the fleet. |

---

## 6. Safe Resynchronization & Offboarding

- **Resyncing an Account**: If an account reports stale data or was temporarily offline, click **Sync Now** on the account card in the console.
- **Decommissioning an Account**: When an AWS member account is closed or Azure subscription deleted, NudgeBee automatically marks it as `ARCHIVED`, preserving historical cost data while halting live API queries.
