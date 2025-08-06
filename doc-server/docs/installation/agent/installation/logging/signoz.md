---
sidebar_position: 3
---
# Signoz

Signoz is an open-source observability platform.

## NudgeBee Agent Configuration
If Signoz is deployed as external service then need to provide external Signoz URL as below in values

```yaml
runner:
  signoz:
    enabled: false
    url: ""
    user_email: ""
    user_password: ""
    apiKey: ""
```
