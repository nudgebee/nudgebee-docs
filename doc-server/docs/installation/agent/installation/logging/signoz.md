---
sidebar_position: 3
---
# Signoz

Signoz is an open-source observability platform.

## NudgeBee Agent Configuration
If Signoz is deployed as external service then need to provide external Signoz URL as below in values

**Note:** For authorization, provide either an API key or a user email and password.


```yaml
runner:
  signoz:
    enabled: false
    url: "https://signoz.signoz:3301"
    user_email: "xxx.yyy@nudgebee.com"
    user_password: "xxxx"
    apiKey: ""
```
