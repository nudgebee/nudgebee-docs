---
sidebar_position: 1
---
# Google Kubernentes Engine

To enable Nudgebee cost model to fetch pricing information from your GCP project, you must generate an API key to replace the default key in the CLOUD_PROVIDER_API_KEY environment variable. You will need to follow the instructions provided in Get Google Cloud pricing information:

1. [Activate the Cloud Billing API](https://console.cloud.google.com/apis/enableflow?apiid=cloudbilling.googleapis.com&pli=1).
2. [Generate an API key with the appropriate access permissions](https://cloud.google.com/docs/authentication/api-keys#create).

Optionally, you can edit the key to restrict its access to the Cloud Billing API.
Add the GCP API Key to Nudgebee agent values
```
opencost:
  opencost:
    exporter:
      cloudProviderApiKey: "op3nco57op3Nco57OP3Nco57op3nco57op3Nco57"
```
