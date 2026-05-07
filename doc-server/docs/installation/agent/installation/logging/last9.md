---
sidebar_position: 4
---

# Last9

Last9 exposes Loki apis and can be configured using Loki integrations.

## NudgeBee Agent Configuration

```yaml
runner:
  loki:
    enabled: true
    url: 'https://otlp-aps1.last9.io/loki'
    username: 'XXX'
    password: 'xxxx'
    headers: ''
```