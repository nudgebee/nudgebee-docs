---
sidebar_position: 5
---

# Logz.io

Logz.io exposes OpenSearch-compatible APIs, so it is configured through the Elasticsearch integration. Authentication is the one difference: Logz.io expects an `X-API-TOKEN` header rather than an API key or basic auth, so the token goes in `headers`.

```yaml
runner:
  es:
    enabled: true
    url: https://api.logz.io
    headers: "X-API-TOKEN: <your-logzio-api-token>"
```

Both `enabled: true` and `url` are required — a URL on its own leaves Elasticsearch switched off.

Get the token from Logz.io under **Settings → Manage tokens → API tokens**. Use the region-specific host if your account is not in the default region (for example `https://api-eu.logz.io`).

:::note Requires agent chart 0.1.22 or newer
`runner.es.headers` was added in chart 0.1.22. On older agents the value is ignored and queries to Logz.io fail authentication.
:::
