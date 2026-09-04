---
id: cloud-fleet-onboarding
title: Cloud Fleet Onboarding (AWS Organizations, Bulk Azure & GCP)
sidebar_label: Fleet Onboarding (AWS, Azure, GCP)
sidebar_position: 4
keywords: [aws organizations onboarding, bulk azure subscriptions, bulk gcp projects, multi-account onboarding, cloud fleet, management group]
intent: setup
provider: cloud
---

# Cloud Fleet Onboarding (AWS Organizations, Bulk Azure & GCP)

Enterprise organizations typically operate tens or hundreds of cloud accounts across AWS, Azure, and GCP. NudgeBee supports AWS Organization onboarding and lets Azure and GCP users discover the subscriptions or projects accessible to the credentials they provide.

---

## 1. Fleet Onboarding Architecture

```mermaid
graph TD
    subgraph AWS Fleet [AWS Organizations]
        AWSMgmt[Management / Payer Account<br/>CloudFormation StackSet] -->|Auto-Deploy IAM Role| AWSMembers[All Member Accounts (Auto-Discovered)]
    end

    subgraph Azure Fleet [Azure subscriptions]
        AzureSP[Microsoft Entra service principal] -->|Discover accessible subscriptions| AzureSubs[Selected subscriptions]
    end

    subgraph GCP Fleet [GCP projects]
        GCPSA[GCP service account] -->|Discover accessible projects| GCPProjects[Selected projects]
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
3. NudgeBee uses the organization setup to discover and onboard member accounts. Check the organization status in the Console after the StackSet deployment completes.

### Step-by-Step Setup:
1. In NudgeBee Console, go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ AWS Organization**.
2. Enter your **Payer Account ID** and primary S3 bucket for the Cost and Usage Report (CUR).
3. Click **Launch Stack in AWS Console**. This opens the CloudFormation wizard with pre-filled template parameters.
4. Check the capability acknowledgement box: `I acknowledge that AWS CloudFormation might create IAM resources with custom names`.
5. Click **Create Stack**.

---

## 3. Bulk Azure Subscriptions Onboarding

### How It Works
NudgeBee lists the subscriptions that the supplied Microsoft Entra service principal can access. The scope at which you grant its roles determines which subscriptions appear.

### Step-by-Step Setup:
1. Go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ Azure**.
2. Enter the tenant ID, client ID, and client secret for the service principal.
3. Grant the service principal the required roles at each subscription, or at a parent scope whose permissions are inherited by those subscriptions. For example, at a management-group scope:
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
NudgeBee lists projects accessible to the supplied Google Cloud service-account key. Granting roles at an organization or folder can make those roles available to descendant projects, subject to your Google Cloud IAM policy.

### Step-by-Step Setup:
1. Go to **Cloud $\rightarrow$ Add Cloud Account $\rightarrow$ GCP**.
2. Paste the service-account JSON key and use **Check Permissions**.
3. Grant the required roles at the appropriate project or inherited parent scope:
   - `roles/viewer` (Resource Discovery)
   - `roles/billing.viewer` (Billing Data)
   - `roles/bigquery.dataViewer` (on the BigQuery Billing export dataset)
4. Click **Next**, then **Discover Projects** and select the projects to monitor. You can also enter project IDs manually.

---

## 5. Initial Synchronization Expectations & Timelines

When onboarding a cloud fleet, data populates progressively across three phases (exact durations are approximate and depend on cloud provider export delivery schedules and account fleet size):

| Phase | Typical Duration (Approximate) | What Becomes Available |
| :--- | :--- | :--- |
| **1. Resource Discovery** | Initial discovery sweep (~minutes) | Cloud inventory (VMs, databases, buckets, networking) populates the Knowledge Graph. |
| **2. Spends Ingestion** | Dependent on provider billing export availability | Billing reports (CUR / Cost Export / BigQuery) aggregate into cost breakdown charts. |
| **3. Recommendations** | Follows resource and spend processing | Rightsizing, idle waste, and cost optimization algorithms complete analysis. |

---

## 6. Safe Resynchronization & Offboarding

- **Resyncing an Account**: If an account reports stale data or was temporarily offline, open **Agent Health** for that cloud account and click **Sync Now**.
- **Decommissioning an Account**: Remove or disable the account in NudgeBee when it should no longer be queried. Do not rely on cloud-provider deletion alone to change its NudgeBee status.
