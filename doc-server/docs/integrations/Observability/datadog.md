---
sidebar_position: 1
---
# Datadog

## Datadog Integration Configuration

To successfully integrate Datadog, you will need to provide the following information in the configuration form.

### Configuration Fields

* **Account Id**
    * Select the target account you wish to link with this Datadog integration from the dropdown menu.

* **Api Key \*** (Required)
    * Enter your Datadog API Key. This key is used to send data *to* your Datadog account.
    * You can find or generate this key in your Datadog account under **Integrations** > **APIs** > **API Keys**.

* **App Key \*** (Required)
    * Enter your Datadog Application Key. This key is used for authentication to *read* data *from* your Datadog account.
    * You can find or generate this key in your Datadog account under **Integrations** > **APIs** > **Application Keys**.

* **Default Log Provider**
    * Check this box if you want to set Datadog as the default destination for all log data within this platform.

* **Default Metrics Provider**
    * Check this box if you want to set Datadog as the default destination for all metrics data.

* **Default Traces Provider**
    * Check this box if you want to set Datadog as the default destination for all trace data (APM).

* **Integration Config Name**
    * Provide a unique and descriptive name for this specific integration setup (e.g., "Production Web App Datadog"). This helps you identify it later.

* **Site \*** (Required)
    * Specify your Datadog site/region. This determines which Datadog datacenter your data is sent to.
    * Common values are:
        * `app.datadoghq.com` (US1 site)
        * `app.datadoghq.eu` (EU1 site)
        * `us3.datadoghq.com` (US3 site)
        * `us5.datadoghq.com` (US5 site)
        * `ap1.datadoghq.com` (AP1 site)
    * Select the one that matches your organization's Datadog account.
    * **Note:** Do not use the bare marketing domain (e.g., `datadoghq.com`). Use the `app.*` prefixed domain shown above.

### Required Permissions

The Datadog API Key and Application Key used for this integration require **at minimum Datadog Reader role** permissions. Admin access is not required.

The integration reads the following data from Datadog:
* Logs
* Traces (APM)
* Metrics
* Monitors
* Dashboards

---

After filling in all the required fields, click the "Save" or "Connect" button (not fully visible) to complete the integration.

---

## Troubleshooting Datadog Integration

### 1. `403 Forbidden` / Connection Test Failed
* **Symptom**: Clicking **Test Connection** fails with `403 Forbidden: Invalid API or Application Key`.
* **Root Causes**:
  * **API Key vs App Key Inversion**: The API Key and Application Key fields were swapped in the form.
  * **Missing Scopes**: The Datadog Application Key was created with restricted scopes and lacks `metrics_read`, `logs_read_data`, or `apm_read`.
* **Remediation**:
  1. Test authentication with Datadog API directly:
     ```bash
     curl -X GET "https://api.datadoghq.com/api/v1/validate" \
       -H "DD-API-KEY: <YOUR_API_KEY>"
     ```
  2. Verify that the Application Key has the **Datadog Standard** or **Datadog Read Only** role in Datadog $\rightarrow$ Organization Settings $\rightarrow$ Application Keys.

---

### 2. Site / Region Endpoint Mismatch
* **Symptom**: Connection test hangs or fails with `Account not found`.
* **Root Cause**: The Datadog site was set to `app.datadoghq.com` (US1), but your organization is hosted on EU (`app.datadoghq.eu`), US3 (`us3.datadoghq.com`), or US5 (`us5.datadoghq.com`).
* **Remediation**:
  Check your browser URL when logged into Datadog and select the matching site in the **Site** dropdown.

---

### 3. Metric Evidence Not Appearing in Incident Triage
* **Symptom**: Datadog is connected, but incident evidence cards show `No metrics found in Datadog for this workload`.
* **Root Cause**: The Kubernetes cluster name or namespace tag in Datadog (`kube_cluster_name`, `cluster_name`) differs from the cluster name registered in NudgeBee.
* **Remediation**:
  Ensure your Datadog Agent `datadog.yaml` contains `tags: ["kube_cluster_name:<CLUSTER_NAME>"]` matching the cluster identifier in NudgeBee.
