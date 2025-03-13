---
sidebar_position: 4
---

# Last9

Nudgebee can be configured to use Last9 prometehus metrics endpoints

### Configuration

```yaml

existingPrometheus:
  url: 'https://<user>:<password>@read-app-tsdb.last9.io/hot/v1/metrics/ZZZ/sender/<account>'

opencost:
 opencost:
   prometheus:
     external:
       url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
```