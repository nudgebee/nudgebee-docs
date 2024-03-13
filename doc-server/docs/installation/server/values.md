---
sidebar_position: 2
---
# Helm values

![Version: 0.2](https://img.shields.io/badge/Version-0.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: V0.2](https://img.shields.io/badge/AppVersion-V0.2-informational?style=flat-square)

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
| clickhouse.auth.existingSecretKey | string | `"admin-password"` |  |
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
| nudgebee_secret.JWT_PRIVATE_KEY | string | `"-----BEGIN PRIVATE KEY-----\n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\nn6CyHiH8Y4k3DB49LWu/rTV61akh\n-----END PRIVATE KEY-----\n"` |  |
| nudgebee_secret.JWT_PUBLIC_KEY | string | `"{\"type\":\"RS256\",\"key\": \"-----BEGIN PUBLIC KEY-----\\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA01J5+bNA9UOhgYsqvQGk\\ncCn94EIAmARtal5PYIkTd42YUuH0pbUWA2h4IxyZmA+InDN++ULAfnFSPlv1XFyx\\nBHtYBCM0FzaOTDmDpx8TzfAHOQWa6pbmHbI4+RMl65kpkBZJ+jaCLlC10MZE6QE/\\n6uIo4omOfbfP0K6WGw+l8oGW9ngkBsat5sUpUEgKMcHEshY5lvhZL0DSbWkjhicE\\nsSgCOG7awg62zYL2PxUcdghIB+bcrnj7qwJk0nl8Lcsu9LeoxEpUEqnWzQVEfbxx\\nVtiYE1bF3p4rMp7K4Lo1VB2qgMreqnc00kLqfxHhMZ57AnH5cKT10uWM1iooEmYD\\nGxvAVJmEc4pQGKUJKUf+lhP8csBTJAnSbrKcZN4tRcHBNx0DY/DBQoNCVlTJrDFl\\nREid3sCEs9Ftxnfd8HGm4MhX2/2TGKxHSAx88BukOh2PUmfEVd4fdHkxkmTEiK+k\\nOPk2fz1l3lJQx9f9HZt0e5PpDBme5dEi2hvqSTnfxVAYlJAS5izhCMPHpY2ztBJl\\nK5zWZlLZ9JSsNfe1SLN0SYOefqPN49wyfQnCMCmAwcGrVEOoms5bYBmsoIuzlIER\\nkLVlZpmQyVMZ6Ro17pUnAl7WddpXJeMGQUZLXyyfmVVQqhZTxcWQq3WeBd0uJ0Sp\\nXwLt8zgSpLmK4lctXABPwjMCAwEAAQ==\\n-----END PUBLIC KEY-----\",\"claims_format\": \"stringified_json\"}\n"` |  |
| nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY | string | `"3030303030303030303030303030303030303030303030303030303030303030"` |  |
| nudgebee_secret.NUDGEBEE_LICENSE | string | `""` |  |
| nudgebee_secret.RELAY_SERVER_SECRET_KEY | string | `""` |  |
| postgres_migrations.fullnameOverride | string | `"postgres_migrations"` |  |
| postgres_migrations.image.repository | string | `"nudgebee-hasura-migrations"` |  |
| postgres_migrations.image.tag | string | `"2024-02-22T09-24-18_34a9c0635466a7cbf7beba2d5b5fcb9c27aa322c"` |  |
| postgresql.auth.existingSecret | string | `"postgresql"` |  |
| postgresql.enabled | bool | `true` |  |
| postgresql.fullnameOverride | string | `"postgresql"` |  |
| rabbitmq.auth.existingErlangSecret | string | `"rabbitmq"` |  |
| rabbitmq.auth.existingPasswordSecret | string | `"rabbitmq"` |  |
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
