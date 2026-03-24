## Add GCP Account Integration

To connect your GCP account, you must first enable the required APIs, create a **Service Account** in Google Cloud, and grant it the necessary permissions.

### Prerequisites

#### Option A: Using `gcloud` CLI

```bash
# Set your project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Step 1: Enable required GCP APIs
gcloud services enable \
  compute.googleapis.com \
  storage.googleapis.com \
  bigquery.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  recommender.googleapis.com \
  sqladmin.googleapis.com \
  container.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  pubsub.googleapis.com \
  aiplatform.googleapis.com

# Step 2: Create a service account
gcloud iam service-accounts create nudgebee-sa \
  --display-name="NudgeBee Service Account"

# Step 3: Assign required roles
for ROLE in roles/viewer roles/monitoring.viewer roles/logging.viewer \
  roles/bigquery.dataViewer roles/bigquery.jobUser roles/recommender.viewer \
  roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="$ROLE"
done

# Step 4: Create and download JSON key
gcloud iam service-accounts keys create nudgebee-sa-key.json \
  --iam-account="nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com"
```

#### Option B: Using Google Cloud Console

##### 1. Enable Required GCP APIs

NudgeBee needs certain GCP APIs enabled on your project to collect resource data, metrics, and recommendations. If an API is not enabled, NudgeBee will not be able to monitor the corresponding service.

Go to [**APIs & Services > Enable APIs and Services**](https://console.cloud.google.com/apis/library) and enable the following:

| API | What it's used for |
|-----|-------------------|
| **Compute Engine API** | Virtual machines, disks, networking |
| **Cloud Storage API** | Storage buckets |
| **BigQuery API** | Billing data queries |
| **Cloud Monitoring API** | Resource metrics and alerts |
| **Cloud Logging API** | Log data |
| **Recommender API** | Cost and performance recommendations |
| **Cloud SQL Admin API** | Cloud SQL instances |
| **Kubernetes Engine API** | GKE clusters |
| **Cloud Functions API** | Cloud Functions |
| **Cloud Run Admin API** | Cloud Run services |
| **Cloud Pub/Sub API** | Pub/Sub topics and subscriptions |
| **Vertex AI API** | Vertex AI endpoints and models |

:::tip
You only need to enable APIs for GCP services you actually use. For example, if you don't use Cloud Run, you can skip the Cloud Run Admin API. However, skipping an API means NudgeBee won't be able to collect data for that service.
:::

##### 2. Create a Service Account

Create a Service Account in the [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts).

##### 3. Assign IAM Roles

[Assign the required IAM roles](https://console.cloud.google.com/iam-admin/iam) to this Service Account at the project level:

   * **Viewer** (`roles/viewer`) - for accessing general resource information
   * **Monitoring Viewer** (`roles/monitoring.viewer`) - for accessing monitoring metrics
   * **Logs Viewer** (`roles/logging.viewer`) - for accessing logs
   * **BigQuery Data Viewer** (`roles/bigquery.dataViewer`) - for accessing billing data
   * **BigQuery Job User** (`roles/bigquery.jobUser`) - for running billing queries
   * **Recommender Viewer** (`roles/recommender.viewer`) - for accessing cost and performance recommendations
   * **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`) - required for API access across GCP services

##### 4. Create a JSON Key

Create a JSON key for that Service Account (IAM & Admin > Service Accounts > Keys > Add Key > JSON).

#### Enable BigQuery Billing Export

This is required for cost data. Enable it in the GCP Console:
   * Navigate to [Billing > Billing Export](https://console.cloud.google.com/billing/export)
   * Enable **BigQuery Export** and note the dataset and table name

### Configuration Fields

Here is a guide to finding the values for each required field.

* **Display Name \*** (Required)
   * A friendly, custom name for this integration (e.g., "GCP Production Account"). This is for your reference.

* **Project ID \*** (Required)
   * **What it is:** The unique identifier for your Google Cloud project.
   * **Where to find it:**
      1. Log in to the [Google Cloud Console](https://console.cloud.google.com).
      2. Click on the project dropdown at the top of the page.
      3. You will see your project name and **Project ID** listed. Copy the **Project ID** (not the Project Name).

* **Service Account Key (JSON) \*** (Required)
   * **What it is:** A JSON credential file for your service account. **Treat this value like a password and store it securely.**
   * **Where to find it:**
      1. In the Google Cloud Console, navigate to [**IAM & Admin > Service Accounts**](https://console.cloud.google.com/iam-admin/serviceaccounts).
      2. Click on the service account you created for this integration.
      3. Go to the **Keys** tab.
      4. Click **Add Key > Create new key**.
      5. Select **JSON** as the key type and click **Create**.
      6. **Important:** The JSON key file will be downloaded to your computer *one time only*. You must save this file securely.
      7. Open the downloaded JSON file and copy its entire contents.
      8. Paste the entire JSON content into the **Service Account Key (JSON)** field.

* **Billing Dataset Name \*** (Required)
   * **What it is:** The BigQuery dataset name where billing data is exported.
   * **Where to find it:**
      1. In the Google Cloud Console, navigate to **Billing > Billing export**.
      2. You will see the dataset name listed (e.g., `billing_export_dataset`).
      3. Copy this dataset name.

* **Billing Table Name \*** (Required)
   * **What it is:** The BigQuery table name where billing data is stored.
   * **Where to find it:**
      1. In the BigQuery export settings (same location as above), you will see the full table name.
      2. It typically follows this format: `gcp_billing_export_v1_XXXXXX_XXXXXX_XXXXXX`
      3. Copy this table name.

---

After entering all the details, click **Save** to complete the integration.

### Troubleshooting

#### Permission Errors After Setup

If you see permission errors in NudgeBee for specific GCP services, there are two common causes:

**1. Required API is not enabled**

An error like `serviceusage.services.use - PermissionDenied` for a specific service (e.g., `recommender`) often means the corresponding API is not enabled on your project.

To fix, enable the missing API:

```bash
gcloud services enable recommender.googleapis.com --project=your-project-id
```

Or enable it from the [APIs & Services](https://console.cloud.google.com/apis/library) page in the GCP Console.

**2. Missing Service Usage Consumer role**

The `serviceusage.services.use` permission error can also occur when the service account is missing the **Service Usage Consumer** role, even if the API is enabled. This role is required for the service account to interact with enabled APIs.

To fix, grant the role:

```bash
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:your-sa@your-project-id.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

Or add it from the [IAM](https://console.cloud.google.com/iam-admin/iam) page in the GCP Console.

---

### Real-Time Alerts via Webhook

NudgeBee can receive GCP Cloud Monitoring alerts in real-time via a webhook notification channel. When an alert policy fires, NudgeBee automatically creates an event enriched with metric details and resource information.

**Additional permission required**: To enable auto-setup, grant the **Monitoring Editor** role (`roles/monitoring.editor`) to your service account. This allows NudgeBee to automatically create the webhook notification channel and attach it to your alert policies.

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.editor"
```

You can enable real-time alerts from the account's three-dots menu (**Enable Real-Time Alerts**), or during the final step of GCP account onboarding.

For detailed setup instructions, see the [GCP Cloud Monitoring Webhook](../../integrations/Webhooks/gcp_monitoring_webhook.md) guide.

---

## Cloud Monitoring Alert Policies Permissions

NudgeBee can collect existing Cloud Monitoring alert policies, active incidents, and automatically create new alert policies based on cost optimization and performance recommendations.

### Required Permissions for Alert Collection (Read-Only)

To collect existing alert policies and incidents from Cloud Monitoring:

```bash
# Alert Policies
monitoring.alertPolicies.list
monitoring.alertPolicies.get

# Notification Channels (for webhook discovery)
monitoring.notificationChannels.list
monitoring.notificationChannels.get

# Metrics (for threshold calculations)
monitoring.timeSeries.list
```

**Recommended IAM Role:**
- **Monitoring Viewer** (`roles/monitoring.viewer`)

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"
```

### Required Permissions for Alert Creation & Webhook Setup

To enable NudgeBee to automatically create alert policies and set up webhook notification channels:

```bash
# Alert Policy Management
monitoring.alertPolicies.create
monitoring.alertPolicies.update
monitoring.alertPolicies.delete

# Notification Channel Management (for webhook auto-provisioning)
monitoring.notificationChannels.create
monitoring.notificationChannels.update
monitoring.notificationChannels.delete

# Permission Checking (for validating access)
monitoring.alertPolicies.*
monitoring.notificationChannels.*
```

**Recommended IAM Role:**
- **Monitoring Editor** (`roles/monitoring.editor`)

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.editor"
```

### Alert Policy Features Supported

#### 1. Simple Metric Threshold Conditions

Monitor single metrics with threshold-based alerting:

- **Aggregation aligners:** ALIGN_MEAN, ALIGN_SUM, ALIGN_MIN, ALIGN_MAX, ALIGN_COUNT, ALIGN_RATE
- **Comparison types:** `>`, `>=`, `<`, `<=`
- **Duration:** Minimum breach duration (e.g., 300s = 5 minutes)
- **Filters:** Resource labels and metric labels

#### 2. Metric Math (MQL - Monitoring Query Language)

Advanced alerting using MQL expressions for complex calculations:

- Multiple metric aggregations
- Rate calculations
- Ratio-based alerts (e.g., error rate = errors / total requests)

#### 3. Notification Channels

Supported notification channel types:

- **Webhook** (auto-provisioned by NudgeBee)
- Email
- SMS
- PagerDuty
- Slack
- Other third-party integrations

#### 4. Alert Combiner

Combine multiple conditions:

- **OR** - Alert if any condition is met
- **AND** - Alert only if all conditions are met

### Webhook Auto-Provisioning

When you enable real-time alerts, NudgeBee automatically:

1. **Creates a webhook notification channel** at:
   ```
   {nudgebee-base-url}/api/webhooks/gcp-monitoring?token={auth-token}
   ```

2. **Attaches the webhook to all enabled alert policies** - Ensures all future alerts are sent to NudgeBee in real-time

3. **Stores the channel reference** in the agent connection status (JSONB format)

**Required Role:** `roles/monitoring.editor` (Monitoring Editor)

**Manual Webhook Creation (if needed):**

```bash
gcloud alpha monitoring channels create \
  --display-name="NudgeBee Webhook" \
  --type=webhook_tokenauth \
  --channel-labels=url="https://your-nudgebee-instance.com/api/webhooks/gcp-monitoring?token=YOUR_TOKEN"
```

### Supported GCP Services for Alert Creation

NudgeBee can create alert policies for:

- **Compute Engine** (`gce_instance`) - VM CPU, memory, disk metrics
- **Cloud SQL** (`cloudsql_database`) - Database CPU, memory, connections
- **Cloud Storage** (`gcs_bucket`) - Storage size, request counts
- **GKE** (`k8s_container`, `k8s_pod`) - Container/pod resource usage
- **Cloud Functions** (`cloud_function`) - Execution time, error rate
- **Load Balancer** (`https_lb_rule`) - Request count, latency
- **BigQuery** (`bigquery_project`) - Query execution time, slot usage
- **Cloud Run** - Request latency, instance utilization
- **Pub/Sub** - Message backlog, delivery latency

### Example: Full Cloud Monitoring IAM Policy

If you want to grant only the minimum necessary permissions without using a predefined role, create a custom role:

```yaml
title: "NudgeBee Alert Manager"
description: "Custom role for NudgeBee to manage Cloud Monitoring alert policies"
stage: "GA"
includedPermissions:
  # Alert Policies
  - monitoring.alertPolicies.list
  - monitoring.alertPolicies.get
  - monitoring.alertPolicies.create
  - monitoring.alertPolicies.update
  - monitoring.alertPolicies.delete

  # Notification Channels
  - monitoring.notificationChannels.list
  - monitoring.notificationChannels.get
  - monitoring.notificationChannels.create
  - monitoring.notificationChannels.update
  - monitoring.notificationChannels.delete

  # Metrics
  - monitoring.timeSeries.list
```

Create the custom role:

```bash
gcloud iam roles create nudgebeeAlertManager \
  --project=$PROJECT_ID \
  --file=nudgebee-alert-role.yaml

# Assign the custom role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:nudgebee-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="projects/$PROJECT_ID/roles/nudgebeeAlertManager"
```

### Troubleshooting Alert Permissions

#### Error: "Permission denied on monitoring.alertPolicies.list"

**Cause:** Service account lacks the Monitoring Viewer or Monitoring Editor role.

**Solution:**

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:your-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.viewer"
```

#### Error: "Permission denied on monitoring.notificationChannels.create"

**Cause:** Service account lacks write permissions for notification channels.

**Solution:** Grant Monitoring Editor role (required for webhook auto-provisioning):

```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:your-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/monitoring.editor"
```

#### Error: "API [monitoring.googleapis.com] not enabled"

**Cause:** Cloud Monitoring API is not enabled on the project.

**Solution:**

```bash
gcloud services enable monitoring.googleapis.com --project=$PROJECT_ID
```

**Note:** Alert policy collection operates at the project level. Ensure the service account has the necessary IAM roles assigned at the correct project scope.
