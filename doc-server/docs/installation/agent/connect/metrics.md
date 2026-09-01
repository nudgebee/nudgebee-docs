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

  # Custom headers sent with every query (comma-separated "Key: Value" pairs)
  # prometheus_headers: "Authorization: Bearer <token>,X-Scope-OrgID: tenant-a"

  # Labels appended to every PromQL query (multi-cluster backends)
  # prometheus_additional_labels: {k8s_cluster: aws-prod}
```

A static header does not work for backends that sign each request. For Amazon Managed Prometheus, Azure Monitor, or Coralogix, fill in `runner.prometheus.auth` instead: see [Metrics backend](../operate/helm_values.md#metrics-backend).

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

Alerts only reach NudgeBee if your Alertmanager is configured to forward them to the agent — see [Alert Forwarding](./alertmanager.md). That page covers kube-prometheus-stack, operator-managed Alertmanager (including Thanos-based stacks), plain Alertmanager, and external/central Alertmanagers.

If your setup has no Alertmanager at all — common with managed metrics backends like Chronosphere — the same page's [VMAlert + VMAlertmanager](./alertmanager.md#vmalert--vmalertmanager) section covers a lightweight alternative.

Enjoy metrics without the headaches—NudgeBee has you covered. 🚀