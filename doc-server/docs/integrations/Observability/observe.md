---
sidebar_position: 3
---
# Observe

## Observe Integration Configuration

To successfully integrate **Observe**, you will need to provide the following information in the configuration form.

### Configuration Fields

* **Account Id** (Required)
    * Select the target account you wish to link with this Observe integration from the dropdown menu.

* **Customer Id \*** (Required)
    * Enter your **Observe Customer ID**.
    * You can find this ID in your Observe account link example 119921059304 in https://119921059304.observeinc.com/.

* **Domain**
    * The Observe region your tenant lives in: `observeinc` (default), `ap-1.observeinc`, `au-1.observeinc`, `ca-1.observeinc` or `eu-1.observeinc`. It is the part of your Observe URL after the customer ID.

* **Auth Type**
    * `api_token` — authenticate with an Observe API token.
    * `email_password` — authenticate with an Observe user's email and password.

* **Default Log Provider**
    * Check this box if you want to set **Observe** as the default destination for all log data within this platform.

* **Integration Config Name** (Required)
    * Provide a unique and descriptive name for this integration setup (e.g., “Observe - Production Logs”).
      This helps you identify the integration later.

* **Log Dataset Id \*** (Required)
    * Enter the **Observe Log Dataset ID** where logs will be sent.
    * You can find this ID in your Observe workspace in the url link when opening logs in observe key as datasetId,

* **Api Token** (Required for `api_token`)
    * An API token for your Observe tenant.

* **User Email** (Required for `email_password`)
    * Enter the **email address** associated with your Observe account.
      This will be used to authenticate and connect the integration.

* **User Password** (Required for `email_password`)
    * Enter the **password** for the provided Observe user email to authenticate the integration securely.

---

After filling in all the required fields, click **Test Connection**. **Save** stays disabled until the test succeeds; then click **Save** to complete the integration setup.
If successful, Observe will be connected as a log provider for your account.

---

## Advanced Settings

To map the field names your logs use onto NudgeBee's concepts, such as pod and namespace, see [Advanced Settings: default filters and field mapping](./advanced-settings.md).
