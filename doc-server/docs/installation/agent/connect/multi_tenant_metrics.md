---
sidebar_position: 6
---

# Multi-cluster Prometheus Setup

When several clusters share one Prometheus-compatible backend, every stored series must carry a stable cluster label. Each NudgeBee agent must also identify the label value for its own cluster, otherwise queries can combine identically named workloads from different clusters.

## Choose the isolation model

| Requirement | Configuration |
|---|---|
| Add the cluster selector to NudgeBee-generated PromQL | Set `globalConfig.prometheus_additional_labels` for each agent release. |
| Enforce tenant isolation even if a query omits the selector | Put a label-enforcing proxy in front of the shared backend and give each agent its own proxy endpoint. |

The chart-level label is query scoping, not a security boundary. The relay substitutes it into NudgeBee's cluster-aware query templates, but the shared Prometheus endpoint remains capable of answering unscoped queries. Use the proxy model when one cluster or tenant must never query another tenant's data.

## Scope NudgeBee queries with an additional label

For a backend whose series carry `cluster="prod-us-east-1"`:

```yaml
globalConfig:
  prometheus_url: "https://shared-prometheus.example.com"
  prometheus_additional_labels:
    cluster: prod-us-east-1
```

Use a different value in every cluster's agent release. After upgrading, open **Agent Health** and confirm that **Additional Labels** shows the expected map.

Before blaming the agent for empty results, verify the label exists upstream:

```promql
count by (cluster) (up)
```

If the remote-write pipeline uses a different label such as `k8s_cluster`, configure that exact name. Label names and values are case-sensitive.

## Enforce isolation with prom-label-proxy

[prom-label-proxy](https://github.com/prometheus-community/prom-label-proxy) sits in front of Prometheus and rewrites every incoming query so it can only match one label value.

Point NudgeBee at the proxy instead of at Prometheus, and the cluster sees its own metrics and nothing else. Queries cannot escape the boundary, because the proxy injects the label selector after the query arrives.

## Install the proxy

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install label-proxy prometheus-community/prom-label-proxy \
  --namespace prometheus --create-namespace \
  --set config.listenAddress=0.0.0.0:8080 \
  --set config.upstream="http://<vmselect-service>.<namespace>.svc:<port>/select/multitenant/prometheus" \
  --set config.label=<YOUR_LABEL> \
  --set config.extraArgs[0]=--label-value=<YOUR_LABEL_VALUE> \
  --set config.extraArgs[1]=--enable-label-apis=true \
  --set config.extraArgs[2]=--error-on-replace=true
```

What each setting does:

- `config.upstream` is the real Prometheus or VictoriaMetrics endpoint. The path above is VictoriaMetrics' multitenant select endpoint; for plain Prometheus it is just `http://prometheus.prometheus.svc:9090`.
- `config.label` is the label that identifies a tenant, such as `cluster` or `vm_account_id`. The chart defaults it to `namespace`, so set it explicitly.
- `--label-value` pins the value this proxy allows. **Do not skip it.** Without it the proxy expects each request to carry the tenant value as a query parameter or header, and NudgeBee sends neither, so every query fails.
- `--enable-label-apis` extends the enforcement to the label and series endpoints, not just queries.
- `--error-on-replace` rejects a query that already carries the label instead of quietly overwriting it, so a misconfigured client fails loudly.

Check it came up:

```bash
kubectl get pods -n prometheus -l app.kubernetes.io/name=prom-label-proxy
```

## Point NudgeBee at it

```yaml
globalConfig:
  prometheus_url: "http://label-proxy.prometheus.svc:8080"
```

Every PromQL query the agent runs now goes through the proxy and comes back scoped to the one label value. You can also set `prometheus_additional_labels` to the same label and value so Agent Health records the cluster scope explicitly; the proxy remains the enforcement layer.

## One proxy per tenant

Because the allowed value is baked into the release, each tenant needs its own proxy. For two clusters distinguished by `cluster="dev"` and `cluster="test"`:

```bash
helm upgrade --install label-proxy-dev prometheus-community/prom-label-proxy \
  --namespace prometheus \
  --set config.upstream=http://prometheus.prometheus.svc:9090 \
  --set config.label=cluster \
  --set config.extraArgs[0]=--label-value=dev

helm upgrade --install label-proxy-test prometheus-community/prom-label-proxy \
  --namespace prometheus \
  --set config.upstream=http://prometheus.prometheus.svc:9090 \
  --set config.label=cluster \
  --set config.extraArgs[0]=--label-value=test
```

Then give each cluster's agent the matching `prometheus_url`: `http://label-proxy-dev.prometheus.svc:8080` for the dev cluster, `http://label-proxy-test.prometheus.svc:8080` for test.

## If metrics come back empty

The usual cause is a label mismatch: the value in `--label-value` has to exist on the metrics in the backend. Query the upstream directly for one series and check the label is there and spelled the same way. A proxy that enforces a label nothing carries returns an empty result rather than an error, which looks the same as a broken Prometheus URL from inside NudgeBee.

## Reference

- [prom-label-proxy on GitHub](https://github.com/prometheus-community/prom-label-proxy)
- [Prometheus Metrics Integrations](./metrics.md)
