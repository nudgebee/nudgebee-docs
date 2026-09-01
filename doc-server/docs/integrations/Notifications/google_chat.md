---
sidebar_position: 3
---
# Google Chat

## How to configure Google Chat in your NudgeBee Account

- This loom below shows how to configure Google Chat in your account for notifications.

<div style={{position: "relative", paddingBottom: "55.625%", height: 0}}><iframe src="https://www.loom.com/embed/c6e8f388d22f487c94f315549c328109?sid=0d1d619d-12cc-4d7e-a162-effc256e6b3c" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>



## How to Configure Google Chat Integration in Your On-Prem NudgeBee

If you've already created an OAuth client for NudgeBee authentication, you're just a step away from enabling Google Chat integration.
To complete the setup, you need to add a redirect URI to your existing OAuth client.

Steps to add redirect URI:

1. Log in to your Google Cloud Console.
2. Navigate to *APIs & Services* → *Credentials*.
3. Under OAuth 2.0 Client IDs, click on the client used for NudgeBee authentication.
4. In section as *Authorised redirect URIs*  → click *Add URI*
5. Enter the following URI and click *Save*

    ``` https://your-base-url.com/api/integrations/callback/google```

Replace your-base-url with the actual domain where NudgeBee is hosted.

## Ensure the Following Secrets Are Configured in NudgeBee

These should typically be set during installation, but double-check if you're configuring things manually:

```
GOOGLE_CLIENT_ID: The Client id for OAuth Client.
GOOGLE_CLIENT_SECRET: The Secret id for OAuth Client.
BASE_URL: Your nudgebee base url.
```

Once this is set up, your NudgeBee instance will be ready to send messages to Google Chat.

---

## Troubleshooting Google Chat Integration

### 1. `400 Bad Request / redirect_uri_mismatch`
* **Symptom**: Authorizing Google Chat fails with Google OAuth error `redirect_uri_mismatch`.
* **Root Cause**: The redirect URI in Google Cloud Console does not match `https://<your-base-url>/api/integrations/callback/google`.
* **Remediation**:
  1. In Google Cloud Console $\rightarrow$ APIs & Services $\rightarrow$ Credentials $\rightarrow$ OAuth 2.0 Client IDs, verify the exact Authorised Redirect URI.
  2. Ensure your server's `BASE_URL` matches the external HTTPS ingress domain.

---

### 2. `403 Forbidden` / Webhook Target Space Access Denied
* **Symptom**: Incoming webhook fails to post message to target Google Chat Space.
* **Root Cause**: Webhook URL revoked or Space restricted by Google Workspace policy.
* **Remediation**:
  1. In Google Chat $\rightarrow$ Space Settings $\rightarrow$ **Apps & integrations** $\rightarrow$ **Manage webhooks**, regenerate the webhook URL.
  2. Test sending a raw test payload:
     ```bash
     curl -X POST -H "Content-Type: application/json" \
       -d '{"text":"NudgeBee integration test"}' \
       "<YOUR_GOOGLE_CHAT_WEBHOOK_URL>"
     ```
  3. Update the webhook URL in NudgeBee Notification Channels.