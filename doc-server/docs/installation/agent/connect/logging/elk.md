---
sidebar_position: 2
---

# Elasticsearch & OpenSearch (ELK)

Integrate your existing Elasticsearch or OpenSearch cluster with the NudgeBee Kubernetes Agent for centralized log querying and automated incident analysis.

The agent supports:
- **Elasticsearch**: Elasticsearch 7.x, 8.x, and Elastic Cloud.
- **OpenSearch**: Amazon OpenSearch Service, self-hosted OpenSearch, and Logz.io (via OpenSearch PPL or standard Elasticsearch Query DSL).

---

## 1. NudgeBee Agent Configuration

Elasticsearch is **opt-in**. You must set `runner.es.enabled: true` **and** supply `runner.es.url`. Setting only the URL leaves Elasticsearch disabled so that accidental configuration does not override other providers.

```yaml
runner:
  es:
    # Explicit opt-in required (defaults to false)
    enabled: true
    # Cluster endpoint reachable from the agent runner pod
    url: "https://elasticsearch-es-internal-http.monitoring.svc:9200"
    
    # Auth Option A: API Key (takes precedence over username/password)
    apiKey: "<base64-encoded-api-key>"
    
    # Auth Option B: Basic Authentication
    username: "elastic"
    password: "<your-password>"
    
    # Custom headers: semicolon-separated "Key: Value" pairs
    # Useful for proxies or token-based providers (e.g. Logz.io uses X-API-TOKEN)
    headers: "X-API-TOKEN: <your-token>"
    
    # TLS verification for https URLs:
    # Defaults to false (skip certificate verification) for internal self-signed certs.
    # Set to true if your cluster uses a public CA or an injected trusted CA bundle.
    sslVerify: false
```

### Configuration Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `runner.es.enabled` | boolean | `false` | Enables Elasticsearch integration. Must be explicitly set to `true`. |
| `runner.es.url` | string | `""` | Base URL for Elasticsearch or OpenSearch (e.g., `http://elasticsearch:9200` or `https://...`). |
| `runner.es.apiKey` | string | `""` | Elasticsearch API key. When present, the agent adds `Authorization: ApiKey <apiKey>`. |
| `runner.es.username` | string | `""` | Basic auth username. Used only if `apiKey` is empty. |
| `runner.es.password` | string | `""` | Basic auth password. |
| `runner.es.headers` | string | `""` | Semicolon-separated extra headers (`Key: Value; Key2: Value2`) passed on every request. |
| `runner.es.sslVerify` | boolean | `false` | When connecting via HTTPS, whether to enforce TLS certificate verification. Defaults to `false`. |

:::tip Provider Precedence
When multiple logging integrations are defined, the agent applies strict priority ordering:
**Pinot → Elasticsearch → SigNoz → Loki**.
If `runner.es.enabled: true` is set alongside `runner.loki.url`, the agent queries **Elasticsearch**. See the [Logging Overview](./index.md#provider-precedence) for details.
:::

---

## 2. Authentication Methods

### Method 1: Elasticsearch API Key (Recommended)

Elasticsearch API keys allow granular permissions without sharing user passwords.

1. Generate an API key using the Elasticsearch REST API or Kibana Dev Tools:

```json
POST /_security/api_key
{
  "name": "nudgebee-agent",
  "role_descriptors": {
    "nudgebee-log-reader": {
      "cluster": ["monitor"],
      "index": [
        {
          "names": ["filebeat-*", "logs-*", "k8s-*"],
          "privileges": ["read", "view_index_metadata"]
        }
      ]
    }
  }
}
```

2. The response contains both the plaintext fields and the pre-encoded key:

```json
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "nudgebee-agent",
  "api_key": "s0m3R4nd0mK3yV4lu3",
  "encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6czBtM1I0bmQwbUszeVY0bHVl"
}
```

3. Copy the `encoded` value directly into `runner.es.apiKey`:

```yaml
runner:
  es:
    enabled: true
    url: "https://elasticsearch-es-internal-http.monitoring.svc:9200"
    apiKey: "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6czBtM1I0bmQwbUszeVY0bHVl"
```

*(If creating an encoded key manually from `id` and `api_key`, run `echo -n "<id>:<api_key>" | base64`.)*

### Method 2: Basic Authentication

If using dedicated service accounts or internal Elasticsearch users:

```yaml
runner:
  es:
    enabled: true
    url: "https://elasticsearch-es-internal-http.monitoring.svc:9200"
    username: "nudgebee-agent"
    password: "StrongServicePassword123!"
```

### Method 3: Custom Headers (OpenSearch & Logz.io)

For OpenSearch installations behind API gateways or managed services like Logz.io, supply the required authentication token in `headers`:

```yaml
runner:
  es:
    enabled: true
    url: "https://api.logz.io:9200"
    headers: "X-API-TOKEN: <your-logzio-token>"
```

---

## 3. OpenSearch & PPL Support

The NudgeBee Agent natively supports OpenSearch clusters:
- **Elasticsearch Query DSL**: Standard `POST /{index}/_search` queries work across both Elasticsearch and OpenSearch.
- **Piped Processing Language (PPL)**: The agent transparently invokes `POST /_plugins/_ppl` when queries utilize OpenSearch PPL expressions.

---

## 4. Health Probing & Diagnostics

The Kubernetes Agent periodically validates connection health by probing:
```http
GET <ES_URL>/_cluster/health
```
The request includes the configured `Authorization: ApiKey ...` or Basic Auth header.

### Testing Connection from In-Cluster Pod

You can test connectivity and authentication directly from the cluster using a temporary `curl` container:

```bash
# Test with API Key:
kubectl run es-health-check --rm -i --restart=Never --image=curlimages/curl -- \
  curl -k -fsS -H "Authorization: ApiKey <encoded-api-key>" \
  https://elasticsearch-es-internal-http.monitoring.svc:9200/_cluster/health

# Test with Basic Auth:
kubectl run es-health-check --rm -i --restart=Never --image=curlimages/curl -- \
  curl -k -fsS -u "elastic:<password>" \
  https://elasticsearch-es-internal-http.monitoring.svc:9200/_cluster/health
```

A healthy response returns JSON with `"status": "green"` or `"status": "yellow"`.

---

## 5. Troubleshooting Common Issues {#troubleshooting}

### Scenario 1: `HTTP 401 Unauthorized` in Health Check or Agent Logs

* **Symptom**: Agent Health badge shows `Logs: Disconnected` with error `HTTP 401: Unauthorized`.
* **Root Cause**: Invalid API key or username/password credentials.
* **Resolution**:
  1. Confirm whether `apiKey` or `username`/`password` is being used. If both are set, `apiKey` takes precedence.
  2. Test the API key against `/_cluster/health` using the `curl` pod command above.
  3. Ensure the API key has not expired.

### Scenario 2: `HTTP 403 Forbidden` / Missing Cluster Privileges

* **Symptom**: Health check fails with `HTTP 403: action [cluster:monitor/health] is unauthorized`.
* **Root Cause**: The API key or user role lacks cluster-level monitoring permissions.
* **Resolution**:
  Assign the minimum required roles to the service user or API key:
  - **Cluster Privilege**: `monitor` (needed for `/_cluster/health` and index inspection).
  - **Index Privileges**: `read`, `view_index_metadata` on your log index patterns (e.g. `filebeat-*`, `logs-*`).

### Scenario 3: `x509: certificate signed by unknown authority`

* **Symptom**: Health check or query fails during TLS handshake with an internal self-signed certificate.
* **Root Cause**: The agent pod does not trust the cluster's internal Certificate Authority.
* **Resolution**:
  - **Quick Fix**: Set `runner.es.sslVerify: false` in your Helm values to disable strict TLS verification.
  - **Production Fix**: Mount your internal CA certificate into the runner deployment or add it to the cluster's trusted CA bundle.

### Scenario 4: Empty Log Query Results (`index_not_found_exception`)

* **Symptom**: Queries succeed but return 0 hits, or agent logs report `index_not_found_exception [no such index]`.
* **Root Cause**: The queried index pattern does not match the actual index names or data streams in Elasticsearch.
* **Resolution**:
  1. List existing indices from the cluster:
     ```bash
     kubectl run es-indices --rm -i --restart=Never --image=curlimages/curl -- \
       curl -k -fsS -u "elastic:<password>" \
       https://elasticsearch-es-internal-http.monitoring.svc:9200/_cat/indices?v
     ```
  2. Check data stream aliases if using modern Elastic Agent or Fleet:
     ```bash
     kubectl run es-data-streams --rm -i --restart=Never --image=curlimages/curl -- \
       curl -k -fsS -u "elastic:<password>" \
       https://elasticsearch-es-internal-http.monitoring.svc:9200/_data_stream
     ```
  3. If your logs reside in non-standard index names (e.g., `app-logs-*`), configure the index pattern appropriately or set `ELASTICSEARCH_LOG_INDEX` in runner environment variables.

### Scenario 5: Elasticsearch Configured but Agent Shows Loki / SigNoz

* **Symptom**: You added `runner.es.url`, but the agent still reports logs via Loki or SigNoz.
* **Root Cause**: `runner.es.enabled` was not set to `true`. Unlike Loki or SigNoz (which turn on whenever their URL is non-empty), Elasticsearch is an explicit opt-in.
* **Resolution**:
  Ensure both `runner.es.enabled: true` and `runner.es.url` are set:
  ```yaml
  runner:
    es:
      enabled: true
      url: "https://elasticsearch:9200"
  ```

