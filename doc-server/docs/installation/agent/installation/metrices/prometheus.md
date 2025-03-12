---
sidebar_position: 2
---

# Prometheus

Nudgebee supports Prometehus compatible metrics providers. By default nudgebee installer (install.sh) automatically detects prometheus in the cluster. If doesnt finds prometheus then it will ask for installing prometheus.


## Existing Prometheus

Following configurations can be used for configring existing prometheus.

### Configuration

```yaml
existingPrometheus:
 url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
 opencost:
   prometheus:
     external:
       url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
```


### Additional Prometheus Rules

Please refer [Application Failure Alerts](./application-failure-alerts.md) for configuring additional prometheus rules.


### Alert manager Config

Please refer [Alert Manager Integration](./alertmanager-integration.md) for configuring alert manager if you are using existing alert manager.