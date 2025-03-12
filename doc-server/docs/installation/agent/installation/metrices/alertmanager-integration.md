---
sidebar_position: 5
---

# Alertmanager

Prometheus Alertmanager is a component of the Prometheus monitoring and alerting toolkit. It handles alerts sent by client applications such as Prometheus server and deduplicates, groups.


## Configuration Steps

If using existing Prometheus integration, then add following configurations for alertmanager integration.

Modify the Helm values file to include a new webhook receiver configuration and update the route configuration to include the newly defined webhook receiver. Here's an example of how to configure it:

```yaml
alertmanager:
  config:
    receivers:
      - name: 'nudgebee-agent'
        webhook_configs:
          - url: 'http://nudgebee-agent-runner.nudgebee-agent.svc/api/alerts'
            send_resolved: true

    route:
      group_by: ["alertgroup", "job"]
      group_wait: 10s
      group_interval: 5m
      repeat_interval: 3h
      receiver: 'nudgebee-agent'
      routes:
        - receiver: 'nudgebee-agent'
          group_by: [ '...' ]
          matchers:
            - severity =~ ".*"
          repeat_interval: 4h
          continue: true 
```

