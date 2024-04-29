---
sidebar_position: 2
---
# Logging

## Overview
Nudgebee support integration with Loki and provies UI iterface to view logs data using Loki query format. 

## Installation
By default nudgebee auto discovers Loki if agent is installed in same cluster as Loki. 

If Loki is deployed as external service then need to provide external Loki URL as below in values

```yaml
runner:
  loki:
    url: "http://loki:3100"
    user: ""
    password: ""
    headers: "a:b;c:d"
```