---
sidebar_position: 1
---
# Confluence

## Overview

NudgeBee integrates with Atlassian Confluence to sync your knowledge base content. Imported Confluence pages are used by the AI engine to provide context-aware troubleshooting recommendations based on your organization's documented procedures, runbooks, and solutions.

---

## Prerequisites

Before configuring the integration, ensure you have:

- An **Atlassian Confluence** account (Cloud or Data Center)
- A Confluence **API token** (for Cloud) or password (for Data Center)
- The **Confluence host URL** (e.g., `yourcompany.atlassian.net`)
- A user account with read access to the spaces you want to sync

---

## Generate a Confluence API Token

1. Log in to [https://id.atlassian.com/manage/api-tokens](https://id.atlassian.com/manage/api-tokens).
2. Click **Create API token**.
3. Enter a label (e.g., `NudgeBee Confluence Integration`) and click **Create**.
4. Copy the token — it will not be shown again.

---

## Confluence Integration Configuration

Navigate to **Settings** > **Integrations** and select **Confluence** to open the configuration form.

### Configuration Fields

* **Username \*** (Required)
    * Your Confluence username or the email address associated with your Atlassian account.

* **Token \*** (Required)
    * Your Confluence API token (Cloud) or password (Data Center).
    * This value is stored encrypted in NudgeBee.

* **Host \*** (Required)
    * Your Confluence instance URL (e.g., `yourcompany.atlassian.net`).

* **Namespace**
    * The Confluence space key to scope the sync. If specified, only pages from this space are imported.
    * Leave blank to sync from all accessible spaces.

* **Account ID**
    * Select the target account to link with this Confluence integration.

* **Integration Config Name**
    * A unique name for this integration (e.g., `Engineering Wiki`).

---

## Capabilities

Once configured, NudgeBee uses Confluence for:

| Capability | Description |
|-----------|-------------|
| **Knowledge Base Sync** | Import Confluence pages into NudgeBee's knowledge base |
| **AI Context** | Provide Confluence content as context for AI-powered troubleshooting |
| **RAG (Retrieval Augmented Generation)** | Use Confluence documentation to enhance LLM responses with your organization's specific knowledge |

---

## Verify the Integration

1. Save the configuration. NudgeBee will test connectivity to your Confluence instance.
2. Navigate to the knowledge base section in NudgeBee.
3. Verify that Confluence pages are being imported and indexed.
4. Test by asking the AI a question that should be answered by your Confluence documentation.

---

## Notes

- Both **Confluence Cloud** (Atlassian-hosted) and **Confluence Data Center** (self-hosted) are supported.
- The sync imports page content for use in AI-powered troubleshooting. It does not modify any Confluence content.
- For large Confluence instances, use the **Namespace** field to limit sync to relevant spaces (e.g., your engineering or operations wiki).
- API tokens are the recommended authentication method for Confluence Cloud. For Data Center, use your account password.
