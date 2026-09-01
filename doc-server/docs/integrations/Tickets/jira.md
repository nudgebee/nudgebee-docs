---
sidebar_position: 1
---
# Jira

<div style={{position: "relative", paddingBottom: "56.25%", height: 0}}><iframe src="https://www.loom.com/embed/5ef4865527ba4bb7a78d506ba53d3db1?sid=e955487f-bdd1-4969-8283-d2f0ed7d3d99" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

## Creating the API token in JIRA

1. Log in to https://id.atlassian.com/manage/api-tokens.
2. Click 'Create API token.'
3. From the dialog that appears, enter a memorable and concise 'Label' for your token and click 'Create.'
4. Use 'Copy to clipboard' and paste the token into the JIRA API token field on the JIRA account user page.

Note:
- For security reasons it isn't possible to view the token after closing the creation dialog; if necessary, create a new token.
- You should store the token securely, just as for any password.

---

## Troubleshooting Jira Integration

### 1. Connection Test Failed (`401 Unauthorized`)
* **Symptom**: Clicking **Test Connection** returns `Authentication failed: Invalid credentials`.
* **Root Causes**:
  * **Email vs Username**: In Jira Cloud (Atlassian Cloud), you **must** use the account email address as the username, combined with an API token (not your Atlassian password).
  * **Jira Server / Data Center**: If using Jira Data Center, ensure you provide a Personal Access Token (PAT) or valid service account credentials.
* **Remediation**:
  1. Generate a new API token at `https://id.atlassian.com/manage/api-tokens`.
  2. Verify that the email matches the exact account that generated the token.
  3. Ensure the Jira Base URL is `https://<your-domain>.atlassian.net` (without trailing `/secure` or `/jira`).

---

### 2. Ticket Creation Fails (`Field 'customfield_XXXXX' cannot be set`)
* **Symptom**: Automated ticket creation fails with `Error creating Jira issue: Field customfield_10024 is mandatory`.
* **Root Cause**: Your Jira Project's Issue Type Scheme requires specific mandatory custom fields (e.g. *Environment*, *Team*, *Root Cause Category*) that are not mapped in the NudgeBee ticket template.
* **Remediation**:
  1. Check the required fields for the issue type by hitting the Jira Create Metadata API:
     ```bash
     curl -u user@example.com:<API_TOKEN> \
       https://your-domain.atlassian.net/rest/api/3/issue/createmeta?projectKeys=PROD&expand=projects.issuetypes.fields
     ```
  2. Navigate to **Settings $\rightarrow$ Integrations $\rightarrow$ Tickets $\rightarrow$ Jira**.
  3. Under **Custom Field Mappings**, map the required Jira fields to default values or dynamic template expressions (e.g., `{{ event.labels.environment }}`).

---

### 3. Assignee User Not Found (`User does not exist or has no permission`)
* **Symptom**: Ticket creation fails when specifying a default assignee.
* **Root Cause**: Jira Cloud uses Atlassian `accountId` (e.g. `5b10ac8d82e05b22cc7d4ef5`) instead of usernames, and the user must have the **Assignable User** permission in the target project.
* **Remediation**:
  1. In Jira Project Settings $\rightarrow$ Permissions, verify the user has **Assignable User** and **Create Issues** rights.
  2. In Jira Cloud, enter the target user's `accountId` or leave assignee empty to allow Jira's default component lead assignment.

---

### 4. Bidirectional Status Sync Not Updating NudgeBee
* **Symptom**: Resolving a Jira issue in Jira does not update the linked incident in NudgeBee.
* **Remediation**:
  1. In Jira $\rightarrow$ Settings $\rightarrow$ System $\rightarrow$ **WebHooks**, verify a webhook is registered pointing to:
     ```
     https://<your-nudgebee-host>/api/webhooks/jira/status_sync
     ```
  2. Ensure the webhook events include `Issue: updated` and `Issue: resolved`.