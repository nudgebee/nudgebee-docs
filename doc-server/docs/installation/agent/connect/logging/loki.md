---
sidebar_position: 1
---

# Grafana Loki

Grafana Loki is a horizontally scalable, multi-tenant log aggregation system. The NudgeBee Agent runner connects to Loki over its HTTP API to execute LogQL range queries, stream label discovery, and fetch targeted logs during root cause analysis (RCA).

## Deployment Architectures

Loki can be deployed in two primary topologies:
* **[Monolithic Loki](https://grafana.com/docs/loki/latest/setup/install/helm/install-monolithic)**: Runs all Loki components (distributor, ingester, querier, query-frontend) inside a single pod or binary. The agent connects directly to the service port (usually `http://loki:3100`).
* **[Scalable / Microservices Loki](https://grafana.com/docs/loki/latest/setup/install/helm/install-scalable/)**: Deploys separate read, write, and backend stateful sets fronted by an NGINX gateway (`loki-gateway`). The agent connects to the gateway service (usually port `80` or `3100`).

---

## NudgeBee Agent Configuration

### Auto-Discovery vs. Explicit Configuration

If `runner.loki.url` is omitted from your Helm values, the runner attempts to auto-discover in-cluster Loki instances by scanning for services matching these Kubernetes label selectors:
- `app=loki`
- `app.kubernetes.io/instance=loki`

If Loki is installed under a custom release name (e.g. `loki-distributed`, `grafana-loki`), runs in a separate namespace, or is hosted externally (e.g., Grafana Cloud), you must provide the explicit URL in `values.yaml`.

### Helm Values Reference

```yaml
runner:
  loki:
    # URL pointing to the Loki query frontend, gateway, or monolithic service
    url: "http://loki-gateway.monitoring.svc.cluster.local:80"

    # Optional HTTP Basic-Auth credentials (surfaces as LOKI_USERNAME / LOKI_PASSWORD)
    username: ""
    password: ""

    # Semicolon-separated "Header: Value" pairs (surfaces as LOKI_EXTRA_HEADER)
    # Use semicolons (;) to separate multiple headers
    headers: "X-Scope-OrgID: tenant1; Authorization: Bearer <OPTIONAL_TOKEN>"

    # Optional URL for managing Loki recording/alerting rules via the runner
    # rulesUrl: "http://loki-ruler.monitoring.svc:3100"
```

:::caution Use Semicolon Delimiters for Headers
Always separate multiple headers using semicolons (`;`). Do not use commas, as comma-splitting breaks headers whose values contain commas.
:::

Apply your values with `helm upgrade`:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  --reuse-values \
  -f values.yaml
```

---

## Troubleshooting Loki Integration {#troubleshooting}

### Scenario 1: Agent Health Displays `Logs: Disconnected`

#### Root Cause
The runner probes the configured Loki backend periodically with a 5-second timeout. If the probe returns a non-2xx HTTP status code or fails to connect, Agent Health marks the log provider **Disconnected**.

:::important The Gateway `/ready` Trap
Many guides recommend testing Loki via `http://<host>:3100/ready`. However, when Loki is deployed in scalable microservices mode behind `loki-gateway`, the NGINX gateway **only exposes `/loki/...` API paths**, and `/ready` returns `404 Not Found`.

The NudgeBee runner specifically probes `GET <LOKI_URL>/loki/api/v1/status/buildinfo` because it is served through both gateways and monolithic instances.
:::

#### Verification Command
Execute an in-cluster probe from the `nudgebee-agent` namespace:

```bash
kubectl run -n nudgebee-agent loki-check --rm -i --restart=Never \
  --image=curlimages/curl -- -fsS \
  "http://<LOKI_SERVICE_HOST>:<PORT>/loki/api/v1/status/buildinfo"
```

**Expected Response (HTTP 200)**:
```json
{"version":"3.1.0","revision":"...","branch":"HEAD","buildUser":"...","buildDate":"...","goVersion":"go1.22.x"}
```

**Common Failures & Fixes:**
- **`curl: (6) Could not resolve host`**: CoreDNS cannot resolve short service names across namespaces. Use the Fully Qualified Domain Name (FQDN), e.g., `http://loki-gateway.monitoring.svc.cluster.local:80`.
- **`curl: (7) Failed to connect / connection timed out`**: A Kubernetes `NetworkPolicy` in the Loki namespace is blocking ingress from `nudgebee-agent`. Ensure port `80` or `3100` allows ingress traffic from namespace `nudgebee-agent`.
- **`curl: (22) The requested URL returned error: 404`**: The URL includes an extraneous path suffix (e.g. `/loki/api/v1/query`). Configure only the base URL: `http://loki.monitoring.svc:3100`.

---

### Scenario 2: Multi-Tenant Rejection (`400 org id not found` or `401 Unauthorized`)

#### Root Cause
When Loki runs with `auth_enabled: true`, every incoming HTTP request must specify an organization/tenant ID via the `X-Scope-OrgID` header. If missing or invalid, Loki rejects requests with:
```text
no org id
```
or HTTP `400 Bad Request`.

#### Verification & Fix
1. Test querying Loki with the tenant header:
   ```bash
   kubectl run -n nudgebee-agent loki-check --rm -i --restart=Never \
     --image=curlimages/curl -- -fsS -H "X-Scope-OrgID: <YOUR_TENANT_ID>" \
     "http://<LOKI_SERVICE_HOST>:<PORT>/loki/api/v1/labels"
   ```
2. Update your `values.yaml` to pass the `X-Scope-OrgID` header:
   ```yaml
   runner:
     loki:
       headers: "X-Scope-OrgID: <YOUR_TENANT_ID>"
   ```

---

### Scenario 3: Incident Triage Returns Zero Logs (Label Schema Mismatches)

#### Root Cause
During automated root-cause analysis, NudgeBee queries Loki using LogQL selectors based on standard Kubernetes metadata:
```logql
{app="<workload-name>"}
{namespace="<namespace>", pod="<pod-name>"}
```
If your log shipper (Promtail, Fluent Bit, or Grafana Alloy) does not attach these exact label names—for example, if it emits `k8s.pod.name` instead of `pod`, or `container_name` instead of `container`—LogQL queries return 0 rows even though logs exist in Loki!

#### How to Inspect Active Labels in Loki
Query Loki directly to see what label keys are indexed:

```bash
kubectl run -n nudgebee-agent loki-check --rm -i --restart=Never \
  --image=curlimages/curl -- -fsS \
  "http://<LOKI_SERVICE_HOST>:<PORT>/loki/api/v1/labels"
```

Inspect values for the `app` label:
```bash
kubectl run -n nudgebee-agent loki-check --rm -i --restart=Never \
  --image=curlimages/curl -- -fsS \
  "http://<LOKI_SERVICE_HOST>:<PORT>/loki/api/v1/label/app/values"
```

#### Remediation
In your log shipper configuration (Promtail/Fluentbit/Alloy):
- Ensure standard Kubernetes labels (`app`, `namespace`, `pod`, `container`) are preserved as indexed stream labels.
- In Promtail `scrape_configs`, verify `__meta_kubernetes_pod_label_app` is mapped to `app`.

---

### Scenario 4: Query Timeouts on High-Volume Streams

#### Root Cause
The runner's internal HTTP client enforces a 60-second timeout for LogQL queries (`GET /loki/api/v1/query_range`). On clusters with large log volumes or unindexed regex searches, Loki query-frontend may exceed 60 seconds.

#### Remediation
- Ensure LogQL queries take advantage of stream selectors (e.g. `{namespace="prod", app="checkout"} |= "error"`) rather than unbounded line filters (`{namespace="prod"} |= "error"`).
- In Loki's Helm values, tune querier concurrency and split queries by interval:
  ```yaml
  query_frontend:
    max_outstanding_per_tenant: 2048
  querier:
    max_concurrent: 16
  ```