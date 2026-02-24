---
sidebar_position: 8
---
# Loggly

## Prerequisites

Before configuring the integration, ensure you have the following from your Loggly account:

- Your **Loggly subdomain** (the part before `.loggly.com` in your account URL)
- A **Loggly API token** with read access

---

## Loggly Integration Configuration

Navigate to **Integrations** > **Observability** tab and select **Loggly** to open the configuration form.

<!-- ![Loggly in Observability tab](../../../static/img/loggly_card.png) -->

### Configuration Fields

* **Account Id**
    * Select the NudgeBee account to link with this Loggly integration from the dropdown.

* **Integration Config Name**
    * A descriptive name for this integration (e.g., `Production Loggly Logs`).
    * Used to identify this configuration when multiple Loggly integrations exist.

* **Subdomain \*** (Required)
    * Your Loggly **customer subdomain**.
    * This is the part of your Loggly URL before `.loggly.com`. For example, if your Loggly URL is `https://mycompany.loggly.com`, your subdomain is `mycompany`.

* **API Token \*** (Required)
    * Your Loggly **API token** used for authentication.
    * To find or generate one: log into Loggly > **Settings** > **Tokens** > **Customer Tokens**. Copy an existing token or create a new one.

* **Default Log Provider**
    * Enable this to set Loggly as the default source for log queries across NudgeBee.

<!-- ![Loggly configuration form](../../../static/img/loggly_form.png) -->

---

## What Gets Connected

Once configured, NudgeBee queries your Loggly account for log data using the Loggly Search API:

| Signal | API | Example Query |
|--------|-----|---------------|
| Logs | Loggly Search API | `syslog.appName:"checkout-service" AND syslog.severity:error` |

### Log Capabilities

- **Full-text search** — query logs using Loggly's search syntax
- **Field discovery** — automatically discover available log fields and their values
- **Time-range filtering** — query logs within specific time windows
- **Log type filtering** — filter by Loggly log types and tags

---

## Verify the Integration

1. Save the configuration. If the subdomain and API token are valid, the integration is created without errors.
2. Navigate to any Kubernetes workload in NudgeBee.
3. Open the **Logs** tab.
4. Confirm that log data from Loggly appears in the query results.

---

## Notes

- Loggly is a **log-only** integration. It does not provide metrics or traces.
- Log queries use the Loggly Search API at `https://<subdomain>.loggly.com/apiv2/search`.
- Both the subdomain and API token are validated on save to ensure the connection is working.
