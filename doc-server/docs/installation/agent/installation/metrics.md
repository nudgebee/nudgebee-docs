---
sidebar_position: 2
---

# Prometheus Metrics Integrations

NudgeBee speaks “Prometheus” out of the box, but you can also wire it up to Last9, VictoriaMetrics (single-node or clustered), or Chronosphere with zero fuss. During installation we auto-detect any in-cluster Prometheus. If none is found, you’ll be prompted to install one—or simply point NudgeBee at your existing endpoint using one of these supported providers!

---

## 🔌 Supported Backends

| Provider                         | URL Template                                                                                     |
|----------------------------------|--------------------------------------------------------------------------------------------------|
| **Prometheus (in-cluster)**      | `http://<prometheus-service>.<namespace>.svc:9090`                                               |
| **Last9**                        | `https://<user>:<password>@read-app-tsdb.last9.io/hot/v1/metrics/<PID>/sender/<account>`         |
| **VictoriaMetrics (single-node)**| `http://<vmsingle-service>.<namespace>.svc.cluster.local:8429`                                   |
| **VictoriaMetrics (cluster-mode)**| `http://<vmselect-service>.<namespace>.svc.cluster.local:8481`                                   |
| **Chronosphere**                 | `https://<your-org>.chronosphere.io/data/metrics`                        |

---

## ⚙️ Configuration Snippet

Pick the backend you already have, uncomment its block, and fill in your real endpoint (and token for Chronosphere) to get rolling:

```yaml
globalConfig:
  # 1️⃣ Prometheus (in-cluster)
  prometheus_url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

  # 2️⃣ Last9 (hosted TSDB)
  # prometheus_url: "https://<user>:<password>@read-app-tsdb.last9.io/hot/v1/metrics/ZZZ/sender/<account>"

  # 3️⃣ VictoriaMetrics (single-node)
  # prometheus_url: "http://vmsingle-victoria-victoria-metrics-k8s-stack.victoria.svc.cluster.local:8429"

  # 4️⃣ VictoriaMetrics (cluster-mode)
  # prometheus_url: "http://vmselect-victoria-metrics-cluster.victoria.svc.cluster.local:8481"

  # 5️⃣ Chronosphere (hosted Prometheus API)
  # prometheus_url: "https://<your-org>.chronosphere.io/data/metrics"
  
  # Additional query-string parameters appended to every PromQL request
  # e.g. “?timeout=30s&dedup=true”
  # prometheus_url_query_string: "timeout=30s"

  # Custom headers for all API requests (semicolon-separated string)
  # Format: "Key1: Value1;Key2: Value2"
  # prometheus_headers: "Authorization: Bearer ${CHRONOSPHERE_API_TOKEN};X-Custom-Header: hello-world"


opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
      #bearer_token: ""
      #bearer_token_key: DB_BEARER_TOKEN
```

---

## 🚀 Installation Flow

1. **Auto-Discovery**  
   If you leave all providers commented, the installer will scan your cluster for a Prometheus instance.  
2. **Manual Override**  
   Uncomment the block for your chosen backend and paste in your real endpoint (and token).  
3. **Deploy & Go!**  
   Run your Helm install/upgrade and watch NudgeBee start pulling metrics—and surfacing insights—instantly!

---

## 🚨 Need Alerting?

If your setup doesn't have Prometheus Alertmanager installed, you'll need it for alert handling. Check out our [VMAlert and VMAlertmanager Setup guide](./alertmanager.md) for a lightweight alternative that works great with managed Prometheus services like Chronosphere.

Enjoy metrics without the headaches—NudgeBee has you covered. 🚀