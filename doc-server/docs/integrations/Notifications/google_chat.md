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