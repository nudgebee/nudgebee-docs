---
sidebar_position: 6
---

# Label-based Multitenant Prometheus Setup

When several teams share one Prometheus or VictoriaMetrics, you usually do not want each NudgeBee cluster to be able to query all of it. [prom-label-proxy](https://github.com/prometheus-community/prom-label-proxy) solves that without splitting the backend: it sits in front of Prometheus and rewrites every incoming query so it can only match one label value.

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

Nothing else in the agent changes. Every PromQL query the agent runs now goes through the proxy and comes back scoped to the one label value.

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
