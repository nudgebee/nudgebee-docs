---
sidebar_position: 6
---
# GCP Cloud Monitoring Webhook

Receive GCP Cloud Monitoring alert notifications directly into NudgeBee. When an alert policy fires, NudgeBee automatically creates an event enriched with metric details, resource information, and a link to the GCP Console.

---

## Setup Options

There are two ways to set up the GCP Monitoring webhook:

- **Auto-setup** — NudgeBee creates the notification channel in GCP and attaches it to all enabled alert policies automatically. Requires the service account to have the **Monitoring Editor** role.
- **Manual setup** — You create the notification channel in the GCP Console and attach it to alert policies yourself. Works with any permission level.

---

## Prerequisites

### For Auto-Setup

Your GCP service account needs the **Monitoring Editor** role (`roles/monitoring.editor`) to automatically create notification channels and attach them to alert policies.

#### Using `gcloud` CLI

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com" \
  --role="roles/monitoring.editor"
```

#### Using Google Cloud Console

1. Open the [IAM page](https://console.cloud.google.com/iam-admin/iam) for your project.
2. Find your NudgeBee service account.
3. Click the pencil icon to edit permissions.
4. Click **Add Another Role** and select **Monitoring Editor**.
5. Click **Save**.

### For Manual Setup

No additional permissions are needed beyond the base **Viewer** role already required for the GCP integration.

---

## Auto-Setup: From the Account Menu

1. Go to **Admin** > **Integrations** > **Cloud** > **GCP**.
2. Find the GCP account you want to enable alerts for.
3. Click the **three-dots menu** (⋮) and select **Enable Real-Time Alerts**.
4. A 3-step wizard opens:

### Step 1: Prerequisites

Review the IAM permissions required for auto-setup. An expandable guide shows how to grant the Monitoring Editor role to your service account.

### Step 2: Verify Permissions

NudgeBee checks whether the service account has the permissions needed to create notification channels and update alert policies.

- **Pass**: A success message confirms the service account is ready.
- **Fail**: An error message explains what is missing, with a link to the GCP IAM Console to fix it.

You can proceed to the next step even if the check fails — NudgeBee will fall back to manual setup.

### Step 3: Enable Alerts

- If permissions are available, NudgeBee automatically:
  1. Creates a webhook integration and generates a unique webhook URL.
  2. Creates a **webhook notification channel** named "Nudgebee Monitoring Alerts" in your GCP project.
  3. Attaches the notification channel to all enabled alert policies.

- If auto-setup fails, NudgeBee displays the webhook URL and instructions for manual setup (see below).

---

## Auto-Setup: During GCP Onboarding

When adding new GCP accounts, the onboarding wizard includes a final step to set up real-time alerts for all selected projects. If the service account has the Monitoring Editor role, NudgeBee creates webhook notification channels and attaches them to alert policies for each project automatically.

---

## Manual Setup

If auto-setup is not available (e.g., the service account lacks Monitoring Editor permissions), you can set up the webhook manually.

### Step 1: Get the Webhook URL

When you enable real-time alerts (from the account menu or during onboarding), NudgeBee generates a webhook URL. If auto-setup fails or is skipped, the URL is displayed for you to copy. It follows this format:

```
https://<your-nudgebee-domain>/api/webhooks/gcp-monitoring?token=<generated-token>
```

### Step 2: Create a Webhook Notification Channel in GCP

1. Open the [GCP Monitoring Notification Channels page](https://console.cloud.google.com/monitoring/alerting/notifications) for your project.
2. Under **Webhooks**, click **Add New**.
3. Configure the channel:
   - **Display Name**: enter a name (e.g., `Nudgebee Alerts`).
   - **Endpoint URL**: paste the webhook URL from Step 1.
4. Click **Save**.

### Step 3: Attach to Alert Policies

1. Go to **Monitoring** > **Alerting** in the GCP Console.
2. Edit each alert policy you want to forward to NudgeBee.
3. In the **Notifications** section, add the webhook notification channel you created.
4. Save the policy.

---

## How It Works

When GCP Cloud Monitoring sends a webhook payload to NudgeBee, the following processing occurs:

### State Mapping

| GCP Incident State | NudgeBee Status |
|--------------------|-----------------|
| `open` | **Firing** |
| `closed` | **Resolved** |

### Priority Mapping

Priority is derived from the `severity` user label on the GCP alert policy.

| Alert Policy User Label `severity` | NudgeBee Priority |
|------------------------------------|-------------------|
| `critical`, `high` | High |
| `medium`, `warning` | Medium |
| `low`, `info` | Low |
| _(not set)_ | High |

:::tip
To control alert priority in NudgeBee, add a `severity` user label to your GCP alert policies (e.g., `severity: medium`).
:::

### Event Details

Each alert event includes:

- **Title**: `GCP Monitoring Alert: <policy name>`
- **Description**: Summary, metric info (observed value vs threshold), resource details, and a link to the GCP Console incident page.
- **Labels**: `project_id`, `resource_type`, `metric_type`, `observed_value`, `threshold_value`, resource labels, and policy user labels.

### Event Deduplication

Events are deduplicated using a stable fingerprint derived from the alert condition. Repeated webhook calls for the same alert update the existing event instead of creating duplicates.

### Auto-Sync

When NudgeBee syncs your GCP account, it verifies that the webhook notification channel still exists and attaches it to any new alert policies created since the initial setup.

---

## Verify the Integration

1. In GCP Console, go to **Monitoring** > **Alerting**.
2. Trigger a test alert or wait for an existing alert policy to fire.
3. In NudgeBee, navigate to **Events** and verify the alert appears with:
   - Correct title and priority
   - Alert details (metric, threshold, resource)
   - Link to the GCP Console incident page

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Auto-setup fails or permission check shows missing permissions | Grant the **Monitoring Editor** role (`roles/monitoring.editor`) to the service account. This single role covers all permissions needed for auto-setup. |
| Events not appearing after manual setup | Verify the webhook URL is correct, the notification channel is enabled in GCP, and it is attached to at least one alert policy. |
| Events created but missing details | Ensure the alert policy has conditions configured with metrics and thresholds. Log-based alerts may have fewer details. |
| Duplicate notification channels | NudgeBee checks for an existing channel named "Nudgebee Monitoring Alerts" before creating a new one. If you manually renamed or deleted it, auto-setup will create a new one. |
| Webhook URL returns 401 | The `token` query parameter is invalid. Delete the integration in NudgeBee and re-enable real-time alerts to generate a new token. |
