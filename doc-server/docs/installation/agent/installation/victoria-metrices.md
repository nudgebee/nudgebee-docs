---
sidebar_position: 3
---

# Victoria Metrices
If you have existing victoria prometheus then you will need to follow belows steps to configure with nudgebee

## Additional Prometheus Rules
Nudgebee provides additional metrices on top of which you can configure additional prometheus rules.

Detailed rules list can be found [here|https://github.com/nudgebee/k8s-agent/blob/main/extra-scrape-config.yaml]

If victoria is installled with helm then you will need to update `additionalVictoriaMetricsMap` in values to include rules

## Alert manager Config
Add nudgebee agent as reciver for alert manager alerts.

```
receivers:
  - name: 'nudgebee-agent'
    webhook_configs:
      - url: 'http://<helm-release-name>-runner.<namespace>.svc.cluster.local/api/alerts'
        send_resolved: true # 

route: # 
  routes:
    - receiver: 'nudgebee-agent'
      group_by: [ '...' ]
      group_wait: 1s
      group_interval: 1s
      matchers:
        - severity =~ ".*"
      repeat_interval: 4h
      continue: true # 
```