---
sidebar_position: 2
---
# Loki
## Overview
If you have existing loki instance you can integrate using below config

## Installation
By default nudgebee auto discovers Loki if agent is installed in same cluster as Loki. 

If Loki is deployed as external service then need to provide external Loki URL as below in values

```yaml
runner:
  loki:
    url: "http://loki:3100"
    user: ""
    password: ""
    headers: "X-Scope-OrgID:tenant1"
```