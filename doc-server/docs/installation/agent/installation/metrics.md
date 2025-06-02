---
sidebar_position: 2
---

# Prometheus Metrics Integrations

Nudgebee speaks “Prometheus” out of the box, but you can also wire it up to Last9, VictoriaMetrics (single-node or clustered), or Chronosphere with zero fuss. During installation we auto-detect any in-cluster Prometheus. If none is found, you’ll be prompted to install one—or simply point Nudgebee at your existing endpoint using one of these supported providers!

---

## 🔌 Supported Backends

| Provider                         | URL Template                                                                                     |
|----------------------------------|--------------------------------------------------------------------------------------------------|
| **Prometheus (in-cluster)**      | `http://<prometheus-service>.<namespace>.svc:9090`                                               |
| **Last9**                        | `https://<user>:<password>@read-app-tsdb.last9.io/hot/v1/metrics/<PID>/sender/<account>`         |
| **VictoriaMetrics (single-node)**| `http://<vmsingle-service>.<namespace>.svc.cluster.local:8429`                                   |
| **VictoriaMetrics (cluster-mode)**| `http://<vmselect-service>.<namespace>.svc.cluster.local:8481`                                   |
| **Chronosphere**                 | `https://<your-org>.chronosphere.io/data/metrics/api/v1/read`                        |

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
  # prometheus_url: "https://<your-org>.chronosphere.io/data/metrics/api/v1/prom/remote/read"
  
  # 2️⃣ Optional HTTP Basic / Bearer auth
  #    SecretStr allows something like "user:pass" or "Bearer <TOKEN>"
  prometheus_auth: "${PROM_AUTH_SECRET}"        # e.g. "username:password" or "Bearer eyJ…"

  # 3️⃣ Additional query-string parameters appended to every PromQL request
  #    e.g. “?timeout=30s&dedup=true”
  prometheus_url_query_string: "timeout=30s"

  # 4️⃣ Custom headers for all API requests (raw JSON or YAML block)
  #    You might send JSON, an API key, tracing headers, etc.
  prometheus_headers: |
    X-Api-Key: ${PROM_API_KEY}
    X-Custom-Header: hello-world


opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"
        # Optional for Chronosphere:
      #bearerToken: "{{ .Values.globalConfig.prometheus_bearer_token }}"
```

---

## 🚀 Installation Flow

1. **Auto-Discovery**  
   If you leave all providers commented, the installer will scan your cluster for a Prometheus instance.  
2. **Manual Override**  
   Uncomment the block for your chosen backend and paste in your real endpoint (and token).  
3. **Deploy & Go!**  
   Run your Helm install/upgrade and watch Nudgebee start pulling metrics—and surfacing insights—instantly!

Enjoy metrics without the headaches—Nudgebee has you covered. 🚀