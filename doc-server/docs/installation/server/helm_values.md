---
sidebar_position: 7
---

# Helm values

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| app.fullnameOverride | string | `"app"` |  |
| app.image.repository | string | `"nudgebee-app"` |  |
| app.image.tag | string | `""` |  |
| app.replicaCount | int | `1` |  |
| auto-pilot.fullnameOverride | string | `"auto-pilot"` |  |
| auto-pilot.image.repository | string | `"nudgebee-auto-pilot"` |  |
| auto-pilot.image.tag | string | `""` |  |
| clickhouse.auth.existingSecret | string | `"clickhouse"` |  |
| clickhouse.auth.existingSecretKey | string | `"admin-password"` |  |
| clickhouse.enabled | bool | `false` |  |
| clickhouse.fullnameOverride | string | `"clickhouse"` |  |
| clickhouse.replicaCount | int | `1` |  |
| clickhouse.shards | int | `2` |  |
| cloud-collector-server.fullnameOverride | string | `"cloud-collector-server"` |  |
| cloud-collector-server.image.repository | string | `"nudgebee-cloud-collector-server"` |  |
| cloud-collector-server.image.tag | string | `""` |  |
| etl.fullnameOverride | string | `"etl-server"` |  |
| etl.image.repository | string | `"nudgebee-etl-server"` |  |
| etl.image.tag | string | `""` |  |
| global.image.registry | string | `"registry.nudgebee.com"` |  |
| global.imagePullSecrets[0].name | string | `"nudgebee-registry-secret"` |  |
| hasura.fullnameOverride | string | `"hasura"` |  |
| hasura.image.repository | string | `"hasura/graphql-engine"` |  |
| hasura.image.tag | string | `"v2.36.1-ce"` |  |
| hasura.replicaCount | int | `1` |  |
| k8s-collector.fullnameOverride | string | `"k8s-collector"` |  |
| k8s-collector.image.repository | string | `"nudgebee-k8s-collector"` |  |
| k8s-collector.image.tag | string | `""` |  |
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
| nudgebee_registry_secret.enabled | bool | `true` |  |
| nudgebee_registry_secret.existingSecretName | string | `""` |  |
| nudgebee_registry_secret.password | string | `""` |  |
| nudgebee_registry_secret.username | string | `"nudgebee"` |  |
| nudgebee_secret.APP_DATABASE_URL | string | `""` |  |
| nudgebee_secret.BASE_URL | string | `"http://localhost:3000"` |  |
| nudgebee_secret.EMAIL_FROM | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_HOST | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_PASSWORD | string | `""` |  |
| nudgebee_secret.EMAIL_SERVER_USER | string | `""` |  |
| nudgebee_secret.JWT_PRIVATE_KEY | string | `""` |  |
| nudgebee_secret.JWT_PUBLIC_KEY | string | `""` |  |
| nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY | string | `""` |  |
| nudgebee_secret.NUDGEBEE_LICENSE | string | `""` |  |
| nudgebee_secret.RELAY_SERVER_SECRET_KEY | string | `""` |  |
| nudgebee_secret.existingSecretName | string | `""` |  |
| postgres_migrations.fullnameOverride | string | `"postgres_migrations"` |  |
| postgres_migrations.image.repository | string | `"nudgebee-hasura-migrations"` |  |
| postgres_migrations.image.tag | string | `""` |  |
| postgresql.auth.existingSecret | string | `"postgresql"` |  |
| postgresql.enabled | bool | `true` |  |
| postgresql.fullnameOverride | string | `"postgresql"` |  |
| rabbitmq.auth.existingErlangSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.existingPasswordSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.securePassword | bool | `false` |  |
| rabbitmq.enabled | bool | `true` |  |
| rabbitmq.fullnameOverride | string | `"rabbitmq"` |  |
| rabbitmq.metrics.enabled | bool | `true` |  |
| rabbitmq.metrics.prometheusRule.enabled | bool | `true` |  |
| rabbitmq.metrics.serviceMonitor.enabled | bool | `true` |  |
| rabbitmq.metrics.serviceMonitor.path | string | `"/metrics/per-object"` |  |
| rabbitmq.registry | string | `"registry.nudgebee.com"` |  |
| rabbitmq.repository | string | `"rabbitmq"` |  |
| rabbitmq.tag | string | `"3.13.7-debian-12-r5-nb-1"` |  |
| rag-server.enabled | bool | `true` |  |
| rag-server.fullnameOverride | string | `"rag-server"` |  |
| rag-server.image.repository | string | `"nudgebee-rag-server"` |  |
| rag-server.image.tag | string | `""` |  |
| relay-server.fullnameOverride | string | `"relay-server"` |  |
| relay-server.image.repository | string | `"nudgebee-relay-server"` |  |
| relay-server.image.tag | string | `""` |  |
| services-server.fullnameOverride | string | `"services-server"` |  |
| services-server.image.repository | string | `"nudgebee-services-server"` |  |
| services-server.image.tag | string | `""` |  |
| ticket-server.enabled | bool | `true` |  |
| ticket-server.fullnameOverride | string | `"ticket-server"` |  |
| ticket-server.image.repository | string | `"nudgebee-ticket-server"` |  |
| ticket-server.image.tag | string | `""` |  |

----------------------------------------------