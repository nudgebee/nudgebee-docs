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
  roles/bigquery.dataViewer roles/bigquery.jobUser roles/recommender.viewer; do
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

If you see permission errors in NudgeBee for specific GCP services, the most common cause is that the required API is not enabled on your project. For example, an error like `recommender.serviceusage.services.use - PermissionDenied` means the **Recommender API** needs to be enabled.

To fix, enable the missing API:

```bash
gcloud services enable recommender.googleapis.com --project=your-project-id
```

Or enable it from the [APIs & Services](https://console.cloud.google.com/apis/library) page in the GCP Console.
