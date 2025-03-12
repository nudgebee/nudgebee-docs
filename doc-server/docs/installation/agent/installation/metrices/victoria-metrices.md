---
sidebar_position: 3
---

# Victoria Metrices
If you have existing victoria prometheus then you will need to follow belows steps to configure with nudgebee


## Existing Victoria Metrics

Following configurations can be used for configring existing victoria metrics.

### Configuration

```yaml
existingPrometheus:
 url: "http://vmsingle-victoria-victoria-metrics-k8s-stack.victoria.svc.cluster.local:8429"

opencost:
 opencost:
   prometheus:
     external:
       url: "http://vmsingle-victoria-victoria-metrics-k8s-stack.victoria.svc.cluster.local:8429"
```

## Additional Prometheus Rules

Please refer [Application Failure Alerts](./application-failure-alerts.md) for configuring additional prometheus rules.

If victoria is installled with helm then you will need to update `additionalVictoriaMetricsMap` in values to include rules

### Alert manager Config

Please refer [Alert Manager Integration](./alertmanager-integration.md) for configuring alert manager if you are using existing alert manager.