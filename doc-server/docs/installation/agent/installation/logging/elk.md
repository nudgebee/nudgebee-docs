---
sidebar_position: 2
---
# ELK stack
## Overview
If you have existing ELK stack you can integrate using below config

## Nudgebee Agent Configuration
By default ELK stack flag is disabled and to enabled same and provide config use below config

You can configure nudgebee using API Key or with Basic Auth

```yaml
runner:
  es:
    enabled: true
    url: "https://elasticsearch-es-internal-http.monitoring.svc:9200"
    apiKey: "my-api-key"
    username: ""
    password: ""
    headers: ""
```

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
