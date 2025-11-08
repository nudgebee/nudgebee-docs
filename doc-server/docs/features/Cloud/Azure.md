## Add Azure Account Integration

To connect your Azure account, you must first create an **App Registration** in Azure, which generates a **Service Principal** (an identity for your application). You will then grant this Service Principal access to your subscription.

### Prerequisites

Before filling out this form, you must:
1.  **[Create an App Registration](https://learn.microsoft.com/en-us/entra/identity-platform/howto-create-service-principal-portal)** in the Azure Portal.
2.  **Assign the required roles** to this App Registration (Service Principal) at the subscription level. You can find details on all built-in roles in the **[Azure built-in roles documentation](https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles)**. The required roles are:
    * **Cost Management Reader** (for accessing billing and cost data)
    * **Reader** (for accessing general resource information)
3.  **Create a Client Secret** for that App Registration.

### Configuration Fields

Here is a guide to finding the values for each required field.

* **Display Name \*** (Required)
    * A friendly, custom name for this integration (e.g., "Azure Production Account"). This is for your reference.

* **Directory (tenant) ID \*** (Required)
    * **What it is:** The unique identifier for your Azure Active Directory (Microsoft Entra ID) instance.
    * **Where to find it:**
        1.  Log in to the [Azure Portal](https://portal.azure.com).
        2.  Navigate to **Microsoft Entra ID** (or search for "Azure Active Directory").
        3.  On the **Overview** page, you will find the **Tenant ID**. Copy this value.

* **Application (client) ID \*** (Required)
    * **What it is:** The unique ID for the **App Registration** you created for this integration.
    * **Where to find it:**
        1.  In **Microsoft Entra ID**, go to **App registrations**.
        2.  Click on the name of the application you created.
        3.  On its **Overview** page, you will find the **Application (client)ID**. Copy this value.

* **Client Secret \*** (Required)
    * **What it is:** A password for your application. **Treat this value like a password and store it securely.**
    * **Where to find it:**
        1.  In your **App registration**, navigate to the **Certificates & secrets** blade.
        2.  Click **New client secret**.
        3.  Add a description and choose an expiration period.
        4.  **Important:** After you click "Add," the secret's **Value** will be displayed *one time only*. You must copy this value immediately. It will be permanently hidden after you leave the page.

* **Subscription ID \*** (Required)
    * **What it is:** The unique identifier for the specific Azure subscription you want to connect to.
    * **Where to find it:**
        1.  In the Azure Portal's top search bar, search for **Subscriptions**.
        2.  Click on the name of the subscription you are connecting.
        3.  On its **Overview** page, you will find the **Subscription ID**. Copy this value.

---

After entering all the details, click **Save** to complete the integration.
