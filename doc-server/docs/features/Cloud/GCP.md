## Add GCP Account Integration

To connect your GCP account, you must first create a **Service Account** in Google Cloud, which is an identity for applications to access resources. You will then create a JSON key for this Service Account and grant it the necessary permissions.

### Prerequisites

Before filling out this form, you must:
1. **Create a Service Account** in the Google Cloud Console.
2. **[Assign the required IAM roles](https://console.cloud.google.com/iam-admin/iam)** to this Service Account at the project level. The required roles are:
   * **Viewer** (`roles/viewer`) - for accessing general resource information
   * **Monitoring Viewer** (`roles/monitoring.viewer`) - for accessing monitoring metrics
   * **Logs Viewer** (`roles/logging.viewer`) - for accessing logs
   * **BigQuery Data Viewer** (`roles/bigquery.dataViewer`) - for accessing billing data
   * **BigQuery Job User** (`roles/bigquery.jobUser`) - for running billing queries
3. **Create a JSON key** for that Service Account.
4. **Enable BigQuery Billing Export** in your GCP project:
   * Navigate to [Billing → Billing Export](https://console.cloud.google.com/billing/export) in the GCP Console
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
      1. In the Google Cloud Console, navigate to [**IAM & Admin → Service Accounts**](https://console.cloud.google.com/iam-admin/serviceaccounts).
      2. Click on the service account you created for this integration.
      3. Go to the **Keys** tab.
      4. Click **Add Key → Create new key**.
      5. Select **JSON** as the key type and click **Create**.
      6. **Important:** The JSON key file will be downloaded to your computer *one time only*. You must save this file securely.
      7. Open the downloaded JSON file and copy its entire contents.
      8. Paste the entire JSON content into the **Service Account Key (JSON)** field.

* **Billing Dataset Name \*** (Required)
   * **What it is:** The BigQuery dataset name where billing data is exported.
   * **Where to find it:**
      1. In the Google Cloud Console, navigate to **Billing → Billing export**.
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
