---
sidebar_position: 2
---

# ELK stack

If you have existing ELK stack you can integrate using below config

## NudgeBee Agent Configuration
Elasticsearch is off by default. Turn it on and point the agent at your cluster, authenticating with either an API key or basic auth:

```yaml
runner:
  es:
    enabled: true
    url: "https://elasticsearch-es-internal-http.monitoring.svc:9200"
    apiKey: "my-api-key"
    username: ""
    password: ""
    # verify the server certificate on https URLs
    sslVerify: false
```

Both `enabled: true` and `url` are required; setting only the URL leaves Elasticsearch off. `apiKey` takes precedence over `username`/`password` when both are set.

To generate new API key use below steps:
1. Generate api key using steps mentioned in [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html)
A successful call returns a JSON structure that provides API key information.
```  {
    "id": "VuaCfGcBCdbkQm-e5aOx",
    "name": "my-api-key",
    "expiration": 1544068612110,
    "api_key": "xxxxxxxxxx",
    "encoded": "xxxxxxx=="
  }
```

2. On a Unix-like system, the encoded value can be created with the following command:
replace id and api_key from above
```bash
 echo -n "<id>:<api_key>" | base64
 ```
3. Use above generated keys as apiKey in below agent values config
