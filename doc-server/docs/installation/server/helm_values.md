---
sidebar_position: 7
---

# Helm values

:::note[Defaults reflect the Enterprise chart]
The defaults in the table below are generated from the **Enterprise** chart
overlay. The **Community** chart (`oci://ghcr.io/nudgebee/charts/nudgebee`)
ships with a few different defaults — most notably:

- `global.image.registry` defaults to `ghcr.io/nudgebee` (not `registry.nudgebee.com`).
- `nudgebee_registry_secret.enabled` defaults to `false` (no registry secret needed).
- `nudgebee_secret.NUDGEBEE_LICENSE` defaults to empty (no license required).

See the [Server Installation Guide](./index.md) for the Community vs Enterprise
side-by-side examples.
:::

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| admin.email | string | `""` | Address the first admin and their organization are created from during install. **Required on a fresh install that has no license** — the chart fails otherwise. Never checked on upgrade. A license carries its own address and takes precedence; a conflicting value is ignored with a warning. See [`admin.email`](./index.md#admin-email). |
| agent.accessKey | string | `""` | GitOps only. Offline render (Argo CD, Flux) cannot read the existing credential back and the chart refuses to re-issue it on upgrade, so supply it from the live `nudgebee-bootstrap` Secret. Leave empty for ordinary `helm install` / `helm upgrade`. |
| agent.accessSecret | string | `""` | The other half of `agent.accessKey`. Both or neither. |
| agent.clusterName | string | `"nb-control-plane-k8s"` | Name the bundled agent registers its cluster under. More than 3 characters, max 40, no special characters; `Demo` is reserved. |
| agent.enabled | bool | `true` | Installs the NudgeBee agent alongside the server and connects the hosting cluster, so the first cluster needs no second install and no copied auth key. Set `false` when this cluster is already monitored by a separately installed agent. The agent shares this Helm release, so `helm uninstall` removes it too. See [the bundled agent](./index.md#bundled-agent). |
| nudgebee-agent.* | — | — | Passthrough to the bundled agent subchart. Anything the [agent chart](../agent/operate/helm_values.md) accepts can be set here. The node agent, the OpenTelemetry collector, and the agent's ClickHouse are **off** by default. |
| app.fullnameOverride | string | `"app"` |  |
| app.image.repository | string | `"nudgebee-app"` |  |
| app.image.tag | string | `""` |  |
| app.replicaCount | int | `1` |  |
| clickhouse.auth.existingSecret | string | `"clickhouse"` |  |
| clickhouse.auth.existingSecretKey | string | `"admin-password"` |  |
| clickhouse.enabled | bool | `false` |  |
| clickhouse.fullnameOverride | string | `"clickhouse"` |  |
| clickhouse.replicaCount | int | `1` |  |
| clickhouse.shards | int | `2` |  |
| cloud-collector-server.fullnameOverride | string | `"cloud-collector-server"` |  |
| cloud-collector-server.image.repository | string | `"nudgebee-cloud-collector-server"` |  |
| cloud-collector-server.image.tag | string | `""` |  |
| cost-server.enabled | bool | `true` |  |
| cost-server.fullnameOverride | string | `"cost-server"` |  |
| cost-server.image.repository | string | `"nudgebee-cost-server"` |  |
| cost-server.image.tag | string | `""` |  |
| global.existingNudgebeeSecretName | string | `""` | Name of the Secret the services and the migration job load their settings from (default `nudgebee`). Use together with `nudgebee_secret.existingSecretName` — see [Managing Secrets Externally](./index.md#managing-secrets-externally). Your Secret must hold every key the chart would otherwise generate. |
| global.storageClass | string | `""` | StorageClass for every volume the stack creates (PostgreSQL, Redis, RabbitMQ, ClickHouse, Qdrant, and the bundled agent's ClickHouse). Empty uses the cluster default. **Set it before the first install** — a volume's StorageClass can't be changed later. |
| global.initImages.postgres / global.initImages.curl | string | `ghcr.io/nudgebee/...` | Full image references for init containers. Not covered by `global.image.registry`. |
| global.testImage | string | `"ghcr.io/nudgebee/busybox:1.37.0"` | Image for `helm test` pods. |
| global.sizingProfile | string | — | A label the tier files set (`small`, `medium`, `large`); nothing changes based on it. Choose a tier with the `values-medium.yaml` / `values-large.yaml` files in the chart — see [Sizing tiers](./index.md#sizing-tiers). |
| additional_env_vars | map | `{}` | Extra environment variables for all services. Use this for any setting that isn't an accepted `nudgebee_secret` key. |
| global.image.registry | string | `"registry.nudgebee.com"` |  |
| global.imagePullSecrets[0].name | string | `"nudgebee-registry-secret"` |  |
| k8s-collector.fullnameOverride | string | `"k8s-collector"` |  |
| k8s-collector.image.repository | string | `"nudgebee-k8s-collector"` |  |
| k8s-collector.image.tag | string | `""` |  |
| llm-gateway.enabled | bool | `true` | AI Gateway — LLM passthrough, metering, auth and rate limits. |
| llm-gateway.fullnameOverride | string | `"llm-gateway"` |  |
| llm-gateway.image.repository | string | `"nudgebee-llm-gateway-server"` |  |
| llm-gateway.image.tag | string | `""` |  |
| llm-gateway.replicaCount | int | `2` | Multi-replica by default; rate-limit and routing state is shared via Redis/Postgres. |
| llm-server.enabled | bool | `true` |  |
| llm-server.fullnameOverride | string | `"llm-server"` |  |
| llm-server.image.repository | string | `"nudgebee-llm-server"` |  |
| llm-server.image.tag | string | `""` |  |
| ml-k8s-server.enabled | bool | `true` |  |
| ml-k8s-server.fullnameOverride | string | `"ml-server"` |  |
| ml-k8s-server.image.repository | string | `"nudgebee-ml-k8s-server"` |  |
| ml-k8s-server.image.tag | string | `""` |  |
| notifications.enabled | bool | `true` |  |
| notifications.fullnameOverride | string | `"notifications"` |  |
| notifications.image.repository | string | `"nudgebee-notifications"` |  |
| notifications.image.tag | string | `""` |  |
| nudgebee-qdrant-server.enabled | bool | `true` | Vector store backing RAG and knowledge-base search. |
| nudgebee-qdrant-server.fullnameOverride | string | `"nudgebee-qdrant-server"` |  |
| nudgebee-qdrant-server.image.repository | string | `"ghcr.io/nudgebee/qdrant"` | Full image reference; not covered by `global.image.registry`. |
| nudgebee-qdrant-server.image.tag | string | `"v1.19.0"` |  |
| nudgebee_registry_secret.enabled | bool | `true` |  |
| nudgebee_registry_secret.existingSecretName | string | `""` |  |
| nudgebee_registry_secret.password | string | `""` |  |
| nudgebee_registry_secret.username | string | `"nudgebee"` |  |
| nudgebee_secret.APP_DATABASE_URL | string | `"postgresql://postgres:password@postgresql:5432/postgres?sslmode=disable"` | Bundled database by default. With an external database, also set Temporal's datastores. |
| nudgebee_secret.AUTH_DEFAULT_ROLE | string | `"tenant_admin_readonly"` | Sets the default role for new users during self-onboarding. Valid options are `tenant_admin_readonly` and `tenant_admin`. |
| nudgebee_secret.BASE_URL | string | `"http://localhost:3000"` |  |
| nudgebee_secret.EMAIL_FROM | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_HOST | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_PASSWORD | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_USER | string | `""` |  |
| nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY | string | `"__REPLACE__"` | **Required.** The chart fails while it is empty or `__REPLACE__`. Generate with `openssl rand -hex 32`. |
| nudgebee_secret.NUDGEBEE_LICENSE | string | `""` |  |
| nudgebee_secret.RELAY_SERVER_SECRET_KEY | string | `""` |  |
| nudgebee_secret.existingSecretName | string | `""` | When set, the chart doesn't render its own `nudgebee` Secret (and skips its key checks). Pair with `global.existingNudgebeeSecretName`. |
| postgres_migrations.fullnameOverride | string | `"postgres_migrations"` |  |
| postgres_migrations.image.repository | string | `"nudgebee-migration"` | Community: `migrations`. |
| postgres_migrations.image.tag | string | `""` |  |
| postgresql.auth.existingSecret | string | `"postgresql"` |  |
| postgresql.enabled | bool | `true` |  |
| postgresql.fullnameOverride | string | `"postgresql"` |  |
| postgresql.auth.database | string | `"postgres"` | The bundled application database. |
| postgresql.primary.persistence.size | string | `"50Gi"` |  |
| postgresql.image.registry | string | `"ghcr.io/nudgebee"` | Not covered by `global.image.registry`. |
| rabbitmq.auth.existingErlangSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.existingPasswordSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.securePassword | bool | `false` |  |
| rabbitmq.enabled | bool | `true` |  |
| rabbitmq.fullnameOverride | string | `"rabbitmq"` |  |
| rabbitmq.metrics.enabled | bool | `true` |  |
| rabbitmq.metrics.prometheusRule.enabled | bool | `false` | Turn on with the chart's `values-monitoring.yaml`. |
| rabbitmq.metrics.serviceMonitor.enabled | bool | `false` | Turn on with the chart's `values-monitoring.yaml`. |
| rabbitmq.metrics.serviceMonitor.path | string | `"/metrics/per-object"` |  |
| rabbitmq.image.registry | string | `"ghcr.io/nudgebee"` | Not covered by `global.image.registry`. |
| rabbitmq.image.repository | string | `"rabbitmq"` |  |
| rabbitmq.image.tag | string | `"3.13.7-debian-12-r5-nb1"` |  |
| rag-server.enabled | bool | `true` |  |
| rag-server.fullnameOverride | string | `"rag-server"` |  |
| rag-server.image.repository | string | `"nudgebee-rag-server"` |  |
| rag-server.image.tag | string | `""` |  |
| redis.auth.existingSecret | string | `"redis"` |  |
| redis.auth.existingSecretPasswordKey | string | `"redis-password"` |  |
| redis.enabled | bool | `true` |  |
| redis.fullnameOverride | string | `"redis"` |  |
| redis.replica.replicaCount | int | `0` |  |
| redis.image.registry | string | `"ghcr.io/nudgebee"` | Not covered by `global.image.registry`. |
| services-server.env.NOVA_IMAGE / TRIVY_IMAGE / POPEYE_IMAGE / KUBE_BENCH_IMAGE | string | `ghcr.io/nudgebee/...` | Images for the security scanner jobs. Full references; mirror them for air-gapped installs. |
| llm-server.env.LLM_SERVER_AGENT_CODEAGENT_IMAGE | string | `"registry.nudgebee.com/code-analysis-agent:latest"` | Image for the code-analysis workspace. Community: `ghcr.io/nudgebee/code-analysis-agent:latest`. |
| nudgebee_secret.NEXT_PUBLIC_DEFAULT_IMAGE_REGISTRY | string | `"ghcr.io/nudgebee"` | Default for the *Image Registry* field in the UI's agent installer; a different value adds `-i` / `runner.image_registry` to the generated commands. The agent chart does not use that value, so agents still pull from `ghcr.io`; see [Air-gapped and private registries](../agent/installation/index.md#air-gapped-and-private-registries). |
| nudgebee_secret.RELAY_WSSERVER_ENDPOINT / K8S_COLLECTOR_ENDPOINT | string | in-cluster addresses | Relay and collector URLs used in the UI's agent install commands. Set to your public hosts for agents in other clusters. |
| relay-server.fullnameOverride | string | `"relay-server"` |  |
| relay-server.image.repository | string | `"nudgebee-relay-server"` |  |
| relay-server.image.tag | string | `""` |  |
| services-server.fullnameOverride | string | `"services-server"` |  |
| services-server.image.repository | string | `"nudgebee-services-server"` |  |
| services-server.image.tag | string | `""` |  |
| temporal.enabled | bool | `true` | Durable workflow execution behind Automations and Auto Optimize. Backed by Postgres — creates the `temporal` and `temporal_visibility` databases on first boot. |
| temporal.fullnameOverride | string | `"temporal"` |  |
| temporal.server.config.persistence.numHistoryShards | int | `512` | Fixed at cluster creation. Changing it on an existing deployment is not supported by Temporal. |
| temporal.server.replicaCount | int | `1` |  |
| temporal.web.enabled | bool | `false` | Temporal Web UI is disabled by default. |
| ticket-server.enabled | bool | `true` |  |
| ticket-server.fullnameOverride | string | `"ticket-server"` |  |
| ticket-server.image.repository | string | `"nudgebee-ticket-server"` |  |
| ticket-server.image.tag | string | `""` |  |
| workflow-server.enabled | bool | `true` | Workflow engine. Dials Temporal at startup and exits if it is unreachable. |
| workflow-server.fullnameOverride | string | `"workflow-server"` |  |
| workflow-server.image.repository | string | `"nudgebee-workflow-server"` |  |
| workflow-server.image.tag | string | `""` |  |

---

:::note ServiceMonitor & PrometheusRule CRDs
`rabbitmq.metrics.serviceMonitor.enabled` and `rabbitmq.metrics.prometheusRule.enabled` are **off by default**, because they need the **ServiceMonitor** and **PrometheusRule** CRDs (from [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) or the Prometheus Operator). If you have them, turn monitoring on with the `values-monitoring.yaml` file in the chart, or set them yourself:

```yaml
rabbitmq:
  metrics:
    serviceMonitor:
      enabled: true
    prometheusRule:
      enabled: true
```
:::

## Mirroring images (air-gapped) {#mirroring-images-air-gapped}

`global.image.registry` only applies to NudgeBee's own service images. To pull everything from a private registry, mirror and override these as well:

| Images | Values |
|---|---|
| Init and test images | `global.initImages.postgres`, `global.initImages.curl`, `global.testImage` |
| PostgreSQL, Redis, RabbitMQ | `postgresql.image.registry`, `redis.image.registry`, `rabbitmq.image.registry` |
| PostgreSQL metrics exporter (on by default) | `postgresql.metrics.image.registry` |
| App nginx sidecar | `app.nginx.image.registry` |
| Bundled agent | `nudgebee-agent.runner.image.repository`, `nudgebee-agent.kubewatch.image.repository`, `nudgebee-agent.nodeAgent.image.repository`, `nudgebee-agent.opentelemetry-collector.image.repository`, `nudgebee-agent.clickhouse.image.registry`, `nudgebee-agent.runner.profilerImage` |
| Qdrant | `nudgebee-qdrant-server.image.repository` |
| Temporal | `temporal.server.image.repository`, `temporal.admintools.image.repository`, `temporal.web.image.repository` |
| Security scanners | `services-server.env.NOVA_IMAGE`, `TRIVY_IMAGE`, `POPEYE_IMAGE`, `KUBE_BENCH_IMAGE` |
| Code-analysis workspace | `llm-server.env.LLM_SERVER_AGENT_CODEAGENT_IMAGE` |
| Agents installed from the UI's commands | Not set by `nudgebee_secret.NEXT_PUBLIC_DEFAULT_IMAGE_REGISTRY` (the agent chart ignores the registry it adds). Set the agent image values listed in [Air-gapped and private registries](../agent/installation/index.md#air-gapped-and-private-registries). |

## Related

- [Server Installation](./index.md)
- [Configuration Options](./secret_configs.md)
- [Upgrade](./upgrade.md)
