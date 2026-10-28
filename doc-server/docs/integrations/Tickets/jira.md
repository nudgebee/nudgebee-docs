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

## Connect Jira in NudgeBee

1. Go to **Admin → Integrations → Ticketing → Jira** and click **Add Jira Account**.
2. Fill in the form:

   | Field | What to enter |
   |---|---|
   | **Name** | A name for this connection |
   | **Account URL** | Your Jira URL, for example `https://your-domain.atlassian.net`. For Jira Data Center on a context path, include it — for example `https://jira.example.com/jira` |
   | **Authentication method** | **Username + API Token** (Jira Cloud, or Data Center with a password) or **Data Center PAT** |
   | **User Name** | The account's email address (Cloud) or username (Data Center). Hidden for **Data Center PAT** |
   | **Token** | The API token (Cloud), the password (Data Center), or the personal access token (**Data Center PAT**) |

3. Click **Test Connection** — NudgeBee lists one project to confirm the credentials work — then save.

NudgeBee calls Jira directly from its servers, so a Jira Data Center instance must be reachable from NudgeBee.

---

## Troubleshooting Jira Integration

### 1. Connection Test Failed (`401 Unauthorized`)
* **Symptom**: Clicking **Test Connection** returns `Authentication failed: Invalid credentials`.
* **Root Causes**:
  * **Email vs Username**: In Jira Cloud (Atlassian Cloud), you **must** use the account email address as the username, combined with an API token (not your Atlassian password).
  * **Jira Server / Data Center**: Choose **Data Center PAT** and paste a personal access token, or use **Username + API Token** with the username and password.
* **Remediation**:
  1. Generate a new API token at `https://id.atlassian.com/manage/api-tokens`.
  2. Verify that the email matches the exact account that generated the token.
  3. For Jira Cloud, use `https://<your-domain>.atlassian.net` (no trailing `/secure`). For Data Center, include the context path if Jira is served under one (for example `/jira`).

---

### 2. Ticket Creation Fails (`Field 'customfield_XXXXX' cannot be set`)
* **Symptom**: Automated ticket creation fails with `Error creating Jira issue: Field customfield_10024 is mandatory`.
* **Root Cause**: Your Jira Project's Issue Type Scheme requires specific mandatory custom fields (e.g. *Environment*, *Team*, *Root Cause Category*) that are not mapped in the NudgeBee ticket template.
* **Remediation**:
  1. Check the required fields for the issue type by hitting the Jira Create Metadata API:
     ```bash
     curl -u user@example.com:<API_TOKEN> \
       "https://your-domain.atlassian.net/rest/api/3/issue/createmeta?projectKeys=PROD&expand=projects.issuetypes.fields"
     ```
  2. Navigate to **Admin → Integrations → Ticketing → Jira**.
  3. Inspect the ticket creation form or workflow ticket task and supply the fields required by the selected project and issue type. Use the available field metadata; do not assume every field accepts workflow template expressions.

---

### 3. Assignee User Not Found (`User does not exist or has no permission`)
* **Symptom**: Ticket creation fails when specifying a default assignee.
* **Root Cause**: Jira Cloud uses Atlassian `accountId` (e.g. `5b10ac8d82e05b22cc7d4ef5`) instead of usernames, and the user must have the **Assignable User** permission in the target project.
* **Remediation**:
  1. In Jira Project Settings $\rightarrow$ Permissions, verify the user has **Assignable User** and **Create Issues** rights.
  2. In Jira Cloud, enter the target user's `accountId` or leave assignee empty to allow Jira's default component lead assignment.

---

### 4. Jira Ticket Status Is Stale

The ticket server synchronizes Jira ticket details by fetching the linked issues and updating NudgeBee ticket records. There is no `/api/webhooks/jira/status_sync` endpoint to configure for this flow.

1. Confirm the issue is accessible using the integration's configured account.
2. Check the linked ticket ID and integration configuration.
3. Ask an administrator to inspect ticket-server synchronization errors and the sync job if the record remains stale.

A synchronized ticket status is separate from the linked event's NudgeBee triage status. Do not assume closing a Jira issue automatically resolves that event.

## Related

- [Ticket integrations](./index.md)
- [Ticket integration troubleshooting](./ticket-integrations-troubleshooting.md)
