---
sidebar_position: 6
---

# Helm values

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| app.fullnameOverride | string | `"app"` |  |
| app.image.repository | string | `"nudgebee-app"` |  |
| app.image.tag | string | `"2024-02-22T08-01-30_1177b0f44d8fbc9ff460cb2528ebdc9e6e2b2a43"` |  |
| app.replicaCount | int | `1` |  |
| auto-pilot.fullnameOverride | string | `"auto-pilot"` |  |
| auto-pilot.image.server_repository | string | `"nudgebee-autopilot-server"` |  |
| auto-pilot.image.tag | string | `"2024-02-20T18-25-00_d247cd50a780c8801520fa4ba9cf71bb51629c28"` |  |
| auto-pilot.image.worker_repository | string | `"nudgebee-autopilot-worker"` |  |
| auto-playbook.enabled | bool | `true` |  |
| auto-playbook.image.orchestrator_repository | string | `"nudgebee-auto-playbook-orchestrator"` |  |
| auto-playbook.image.tag | string | `"2024-02-22T10-18-09_74650b6e7c07dfbf0ab0b858808e32c24753e768"` |  |
| auto-playbook.image.worker_repository | string | `"nudgebee-auto-playbook-worker"` |  |
| clickhouse.auth.existingSecret | string | `"clickhouse"` |  |
| clickhouse.auth.existingSecretKey | string | `""` |  |
| clickhouse.enabled | bool | `false` |  |
| clickhouse.fullnameOverride | string | `"clickhouse"` |  |
| clickhouse.replicaCount | int | `1` |  |
| clickhouse.shards | int | `2` |  |
| etl.fullnameOverride | string | `"etl-server"` |  |
| etl.image.repository | string | `"nudgebee-etl-server"` |  |
| etl.image.tag | string | `"2024-02-20T15-17-36_c46f481cbd2c016acb34245a725e57999e4c3378_amd64"` |  |
| global.image.imagePullSecrets[0].name | string | `"nudgebee-registry-secret"` |  |
| global.image.registry | string | `"registry.nudgebee.com"` |  |
| hasura.fullnameOverride | string | `"hasura"` |  |
| hasura.image.repository | string | `"hasura/graphql-engine"` |  |
| hasura.image.tag | string | `"v2.36.1-ce"` |  |
| hasura.replicaCount | int | `1` |  |
| k8s-collector.fullnameOverride | string | `"k8s-collector"` |  |
| k8s-collector.image.repository | string | `"nudgebee-k8s-collector"` |  |
| k8s-collector.image.tag | string | `"2024-02-21T07-41-30_9a5125e8c59e63c6a0e4d4293e7f5009a91bbd3a"` |  |
| ml-k8s-server.enabled | bool | `true` |  |
| ml-k8s-server.fullnameOverride | string | `"ml-server"` |  |
| ml-k8s-server.image.repository | string | `"nudgebee-ml-k8s-server"` |  |
| ml-k8s-server.image.tag | string | `"2024-02-21T17-14-49_acde1fe06949a7ab55592bdafc503e8c5229a884_arm64"` |  |
| notifications.enabled | bool | `true` |  |
| notifications.fullnameOverride | string | `"notifications"` |  |
| notifications.image.repository | string | `"nudgebee-notifications"` |  |
| notifications.image.tag | string | `"2024-02-22T08-40-44_74650b6e7c07dfbf0ab0b858808e32c24753e768"` |  |
| nudgebee_registry_secret.enabled | bool | `false` |  |
| nudgebee_registry_secret.password | string | `""` |  |
| nudgebee_registry_secret.username | string | `"nudgebee"` |  |
| nudgebee_secret.APP_DATABASE_URL | string | `"postgresql://postgres:password@postgresql:5432/postgres?sslmode=disable"` |  |
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
| postgres_migrations.fullnameOverride | string | `"postgres_migrations"` |  |
| postgres_migrations.image.repository | string | `"nudgebee-hasura-migrations"` |  |
| postgres_migrations.image.tag | string | `"2024-02-22T09-24-18_34a9c0635466a7cbf7beba2d5b5fcb9c27aa322c"` |  |
| postgresql.auth.existingSecret | string | `"postgresql"` |  |
| postgresql.enabled | bool | `true` |  |
| postgresql.fullnameOverride | string | `"postgresql"` |  |
| rabbitmq.auth.existingErlangSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.existingPasswordSecret | string | `""` |  |
| rabbitmq.auth.securePassword | bool | `false` |  |
| rabbitmq.enabled | bool | `true` |  |
| rabbitmq.fullnameOverride | string | `"rabbitmq"` |  |
| relay-server.fullnameOverride | string | `"relay-server"` |  |
| relay-server.image.repository | string | `"nudgebee-relay-server"` |  |
| relay-server.image.tag | string | `"2024-02-15T04-41-08_f3fc0994524cdb06d04b3fa9d9f15bd31bb0cef4"` |  |
| services-server.fullnameOverride | string | `"services-server"` |  |
| services-server.image.repository | string | `"nudgebee-services-server"` |  |
| services-server.image.tag | string | `"2024-02-21T17-51-38_afce3e555fb108f0bedbe8d9adb0e90f7bb04ba5"` |  |
| ticket-server.enabled | bool | `true` |  |
| ticket-server.fullnameOverride | string | `"ticket-server"` |  |
| ticket-server.image.repository | string | `"nudgebee-ticket-server"` |  |
| ticket-server.image.tag | string | `"2024-02-20T14-09-22_de6e13e06542e474135db03075d04e5b6b60ff08"` |  |
