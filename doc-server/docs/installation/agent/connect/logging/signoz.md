---
sidebar_position: 3
---
# Signoz

Signoz is an open-source observability platform.

## NudgeBee Agent Configuration
If Signoz is deployed as external service then need to provide external Signoz URL as below in values

Authenticate with either an API key or a user and password. If both are set, the API key wins.

```yaml
runner:
  signoz:
    url: "https://signoz.signoz:3301"
    apiKey: "<signoz-api-key>"
    # or, instead of apiKey:
    user: "user@example.com"
    password: "<your-password>"
```

Setting `url` is what turns the integration on; there is no `enabled` flag.
