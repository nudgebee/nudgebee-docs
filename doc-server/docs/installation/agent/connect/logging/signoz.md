---
sidebar_position: 3
---
# SigNoz

Integrate [SigNoz](https://signoz.io/) with the NudgeBee Kubernetes Agent for unified log analysis, trace correlation, and automated incident triage.

The agent queries SigNoz through its v3 query APIs:
- **Log Queries**: `POST /api/v3/query_range`
- **Attribute Autocomplete**: `GET /api/v3/autocomplete/attribute_keys` and `GET /api/v3/autocomplete/attribute_values`

---

## 1. NudgeBee Agent Configuration

To enable SigNoz, specify the `runner.signoz.url` in your Helm values. Setting a non-empty `url` automatically activates the integration (no separate `enabled` toggle is required).

```yaml
runner:
  signoz:
    # URL to the SigNoz query service or frontend/gateway
    url: "http://signoz-query-service.platform.svc:8080"
    
    # Auth Option A: API Key (Recommended, takes precedence)
    apiKey: "<your-signoz-api-key>"
    
    # Auth Option B: User / Password (exchanges for JWT via /api/v1/login)
    user: "admin@example.com"
    password: "<your-password>"
```

### Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `runner.signoz.url` | string | `""` | Base URL of your SigNoz instance. Setting this enables SigNoz logging actions. |
| `runner.signoz.apiKey` | string | `""` | SigNoz API key. Sent in the `SIGNOZ-API-KEY` request header. |
| `runner.signoz.user` | string | `""` | SigNoz user email. Used for JWT login if `apiKey` is not provided. |
| `runner.signoz.password` | string | `""` | SigNoz user password. Used in conjunction with `runner.signoz.user`. |

:::tip Provider Precedence
The agent checks logging providers in the following order:
**Pinot → Elasticsearch → SigNoz → Loki**.
SigNoz takes precedence over Loki. However, if Elasticsearch is explicitly enabled (`runner.es.enabled: true`), Elasticsearch takes precedence over SigNoz. See [Logging Overview](./index.md#provider-precedence).
:::

---

## 2. Authentication Modes

### Option A: SigNoz API Key (Recommended)

When `apiKey` is provided, the agent attaches the `SIGNOZ-API-KEY` HTTP header to all outbound queries.

1. Navigate to **Settings → API Keys** in your SigNoz console.
2. Create a new API key with query permissions.
3. Configure `runner.signoz.apiKey` in your Helm `values.yaml`.

### Option B: User / Password (Automated JWT Login)

If using basic user credentials instead of an API key:
1. Provide `runner.signoz.user` (email) and `runner.signoz.password`.
2. The agent automatically calls `POST /api/v1/login` against the SigNoz endpoint to obtain an access JWT.
3. The JWT token is securely cached in memory and refreshed automatically when it approaches expiration. Outbound queries carry `Authorization: Bearer <jwt>`.

*(Note: If both `apiKey` and `user`/`password` are configured, `apiKey` takes precedence.)*

---

## 3. Health Probing & Version Detection

The Kubernetes Agent automatically monitors SigNoz connectivity by probing:
```http
GET <SIGNOZ_URL>/api/v1/health
```

In addition, the agent queries:
```http
GET <SIGNOZ_URL>/api/v1/version
```
The reported version (e.g. `v0.52.0`) is published to the NudgeBee Console and used to ensure API compatibility.

### Testing Connection from In-Cluster Pod

Verify connectivity and health using a temporary `curl` container:

```bash
# 1. Test unauthenticated health endpoint
kubectl run signoz-health-check --rm -i --restart=Never --image=curlimages/curl -- \
  curl -fsS http://signoz-query-service.platform.svc:8080/api/v1/health

# 2. Test version endpoint
kubectl run signoz-version-check --rm -i --restart=Never --image=curlimages/curl -- \
  curl -fsS http://signoz-query-service.platform.svc:8080/api/v1/version

# 3. Test API Key authentication
kubectl run signoz-auth-check --rm -i --restart=Never --image=curlimages/curl -- \
  curl -fsS -H "SIGNOZ-API-KEY: <your-api-key>" \
  http://signoz-query-service.platform.svc:8080/api/v3/autocomplete/attribute_keys?dataSource=logs
```

A healthy `/api/v1/health` endpoint returns HTTP 200 with an empty body or JSON status.

---

## 4. Troubleshooting Common Issues {#troubleshooting}

### Scenario 1: `HTTP 401 Unauthorized` / Login Failures

* **Symptom**: Agent logs show `signoz login: HTTP 401` or queries return `HTTP 401 Unauthorized`.
* **Root Cause**: Invalid API key or expired credentials.
* **Resolution**:
  1. If using `apiKey`, verify that the key is active in the SigNoz UI under **Settings → API Keys**.
  2. If using `user`/`password`, confirm that the email and password are valid by testing a login call directly:
     ```bash
     curl -X POST http://<signoz-url>/api/v1/login \
       -H "Content-Type: application/json" \
       -d '{"email":"admin@example.com","password":"your-password"}'
     ```
  3. Ensure no trailing whitespace exists in secret values.

### Scenario 2: Elasticsearch Overriding SigNoz

* **Symptom**: `runner.signoz.url` is configured, but Agent Health indicates the active provider is `ES` (Elasticsearch).
* **Root Cause**: `runner.es.enabled: true` was left enabled in Helm values. By precedence rules, Elasticsearch ranks higher than SigNoz.
* **Resolution**:
  Set `runner.es.enabled: false` in your Helm values so that SigNoz becomes the selected provider:
  ```yaml
  runner:
    es:
      enabled: false
    signoz:
      url: "http://signoz-query-service.platform.svc:8080"
      apiKey: "<api-key>"
  ```

### Scenario 3: `HTTP 400 invalid operator` on Older SigNoz Versions

* **Symptom**: Log autocompletion fails with `invalid operator:`.
* **Root Cause**: Self-hosted SigNoz versions ≤ v0.51 reject attribute queries when `aggregateOperator` is omitted.
* **Resolution**: The NudgeBee Agent automatically injects `aggregateOperator=noop` and `dataSource=logs` on autocomplete requests. If you are using custom external scripts or proxies, ensure these query parameters are passed.

### Scenario 4: Connection Refused or Timeout Behind Ingress

* **Symptom**: Agent Health reports `Logs: Disconnected` with `dial tcp: i/o timeout` or `connection refused`.
* **Root Cause**: The agent cannot route to the configured SigNoz URL.
* **Resolution**:
  1. Check whether SigNoz is deployed in the same cluster or external.
  2. For in-cluster deployments, target the internal Kubernetes Service (e.g. `http://signoz-query-service.platform.svc.cluster.local:8080` or port `3301` depending on your Helm chart values) rather than an external load balancer.
  3. Inspect NetworkPolicies to verify that the `nudgebee-agent` namespace can egress to the `signoz` namespace on the target port.

