---
sidebar_position: 3
---

# Logz

You can integrate logz.io using ES integration as logz.io exposes Opensearch Apis

## NudgeBee Agent Configuration

```yaml
runner:
  es:
    enabled: true
    url: https://api.logz.io
    headers: "X-API-TOKEN:XXXX"
```