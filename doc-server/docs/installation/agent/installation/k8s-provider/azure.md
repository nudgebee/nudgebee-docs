# Nudgebee Integration with Azure Monitor (Traces + Prometheus)

This guide explains how to integrate **Azure Monitor** with **Nudgebee** to collect **traces and Prometheus metrics** securely using an **Azure AD App**/**Service Principal**.  

---

## Prerequisites

- **Azure Monitor** enabled  
- **Prometheus Query endpoint** in Azure Monitor *(See the “[How to Find the Prometheus Endpoint](#how-to-find-the-prometheus-endpoint)” section below for more detail.)*  
- **Instrumentation Key** in Application Insights for traces *(See the “[How to Find the Instrumentation Key](#how-to-find-the-instrumentation-key)” section below for more detail.)*  
- **App Registration** in Azure for access *(If you don't have an app already, see [this guide](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/api/register-app-for-token?tabs=portal))*  

---

## Required Permissions for the Azure AD App (Service Principal)

The Nudgebee integration requires the Azure AD App to have the correct **role assignments** in Azure so it can query **Application Insights (traces)** and **Azure Monitor (Prometheus metrics)**.

---

### 1. Permissions for Traces (Application Insights)
- **Role needed**: `Monitoring Reader`  
- **Scope**: Application Insights resource  

**Steps:**
1. Go to the **Azure Portal** → **Application Insights** resource.  
2. Navigate to **Access Control (IAM)** → **Add role assignment**.  
3. Select:  
   - **Role**: `Monitoring Reader`  
   - **Assign access to**: User, group, or service principal  
   - **Select**: The app you created in **App Registrations** (search by name or service principal ID)  
4. Click **Save**.  

---

### 2. Permissions for Prometheus Metrics (Azure Monitor)
- **Role needed**: `Monitoring Reader` (for read-only access to metrics)  
- **Scope**: Azure Monitor workspace (or resource group)  

**Steps:**
1. Go to the **Azure Portal** → **Monitor** → **Metrics (Prometheus-enabled workspace)**.  
2. Navigate to **Access Control (IAM)** → **Add role assignment**.  
3. Select:  
   - **Role**: `Monitoring Reader`  
   - **Assign access to**: User, group, or service principal  
   - **Select**: The app you created (search by name or service principal ID)  
4. Click **Save**.  

---

### 3. Resource Group-Level Access (Optional but Recommended)
To simplify management, you can assign the role at the **resource group level** (instead of each resource).  

**Steps:**
1. Go to the **Azure Portal** → **Resource groups** → Select your resource group.  
2. Open **Access Control (IAM)**.  
3. Add role assignment:  
   - **Role**: `Monitoring Reader`  
   - **Assign access to**: Service principal (the app)  
4. Click **Save**.  

---

### Summary of Required Roles

| Resource                             | Role(s) Needed    | Scope                      |
|--------------------------------------|-------------------|----------------------------|
| Application Insights                 | Monitoring Reader | Resource level             |
| Azure Monitor Workspace (Prometheus) | Monitoring Reader | Workspace / Resource group |
| Resource group (optional)            | Monitoring Reader | Resource group level       |

---

**Important**:  
- If you only assign permissions at the **resource level**, ensure you do it for **both Application Insights and Azure Monitor Workspace**.  

---

## Endpoints in Azure Monitor

To integrate Nudgebee with Prometheus metrics from Azure Monitor, you need to obtain your workspace's Prometheus **query endpoint**.

### How to Find the Prometheus Endpoint
1. Go to your **Azure Monitor Workspace** in the Azure portal.  
2. Click on your monitoring workspace name.  
3. Open the **Overview** page.  
4. Copy the **"Prometheus query endpoint"** URL—this will be used as the `Prometheus URL` in Nudgebee.  

---

### Adding the Instrumentation Key to Nudgebee

You can add your App credentials to your values file as,

```yaml
additional_env_vars:
    - name: AZURE_TENANT_ID
      value: "<your-tenant-id>"
    - name: AZURE_CLIENT_ID
      value: "<app-client-id>"
    - name: AZURE_CLIENT_SECRET
      value: "<app-secret-key>"
    - name: PROMETHEUS_SSL_ENABLED
      values: true
```

## Instrumentation Key in Application Insights

To collect **traces**, you’ll need the **Instrumentation Key** from Application Insights.

### How to Find the Instrumentation Key
1. Navigate to your **Application Insights** resource in the Azure portal.  
2. Open the **Overview** page.  
3. Copy the **Instrumentation Key**.  

---

### Adding the Instrumentation Key to Nudgebee

Update your values file for otel as,

```yaml
opentelemetry-collector:
  enabled: true
  mode: deployment
  serviceMonitor:
    enabled: true
  config:
    exporters:
      azuremonitor:
        instrumentation_key: <app-instrumentation-key>
```