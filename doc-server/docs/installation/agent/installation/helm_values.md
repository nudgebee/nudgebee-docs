---
sidebar_position: 6
---

# Helm Chart Values

NudgeBee Helm chart for Kubernetes

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://charts.bitnami.com/bitnami | clickhouse | 3.1.* |
| https://open-telemetry.github.io/opentelemetry-helm-charts | opentelemetry-collector | 0.52.* |
| https://opencost.github.io/opencost-helm-chart | opencost | 1.28.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| kubewatch.additional_env_vars | list | `[]` |  |
| kubewatch.annotations | object | `{}` |  |
| kubewatch.config.namespace | string | `""` |  |
| kubewatch.config.resource.clusterrole | bool | `true` |  |
| kubewatch.config.resource.clusterrolebinding | bool | `true` |  |
| kubewatch.config.resource.configmap | bool | `true` |  |
| kubewatch.config.resource.coreevent | bool | `false` |  |
| kubewatch.config.resource.daemonset | bool | `true` |  |
| kubewatch.config.resource.deployment | bool | `true` |  |
| kubewatch.config.resource.event | bool | `true` |  |
| kubewatch.config.resource.hpa | bool | `true` |  |
| kubewatch.config.resource.ingress | bool | `true` |  |
| kubewatch.config.resource.job | bool | `true` |  |
| kubewatch.config.resource.namespace | bool | `true` |  |
| kubewatch.config.resource.node | bool | `true` |  |
| kubewatch.config.resource.persistentvolume | bool | `true` |  |
| kubewatch.config.resource.pod | bool | `true` |  |
| kubewatch.config.resource.replicaset | bool | `true` |  |
| kubewatch.config.resource.replicationcontroller | bool | `false` |  |
| kubewatch.config.resource.secret | bool | `false` |  |
| kubewatch.config.resource.serviceaccount | bool | `true` |  |
| kubewatch.config.resource.services | bool | `true` |  |
| kubewatch.config.resource.statefulset | bool | `true` |  |
| kubewatch.image | string | `"us-central1-docker.pkg.dev/genuine-flight-317411/devel/kubewatch:v2.5"` |  |
| kubewatch.imagePullPolicy | string | `"IfNotPresent"` |  |
| kubewatch.imagePullSecrets | list | `[]` |  |
| kubewatch.nodeSelector | string | `nil` |  |
| kubewatch.pprof | bool | `true` |  |
| kubewatch.resources.limits.cpu | string | `nil` |  |
| kubewatch.resources.requests.cpu | string | `"10m"` |  |
| kubewatch.resources.requests.memory | string | `"512Mi"` |  |
| kubewatch.tolerations | list | `[]` |  |
| nodeAgent.enabled | bool | `true` |  |
| nodeAgent.fullnameOverride | string | `""` |  |
| nodeAgent.image.pullPolicy | string | `"IfNotPresent"` |  |
| nodeAgent.image.repository | string | `"registry.nudgebee.com/nudgebee-node-agent"` |  |
| nodeAgent.image.tag | string | `"2024-04-11T12-14-36_d70ec9cecc6d09aee7b7ab26638765be622f16ac"` |  |
| nodeAgent.imagePullSecrets | list | `[]` |  |
| nodeAgent.nameOverride | string | `""` |  |
| nodeAgent.podAnnotations | object | `{}` |  |
| nodeAgent.priorityClassName | string | `""` |  |
| nodeAgent.resources.limits.cpu | string | `"1"` |  |
| nodeAgent.resources.limits.memory | string | `"1Gi"` |  |
| nodeAgent.resources.requests.cpu | string | `"50m"` |  |
| nodeAgent.resources.requests.memory | string | `"50Mi"` |  |
| nodeAgent.tracesEndpoint | string | `"http://nudgebee-agent-opentelemetry-collector:4318/v1/traces"` |  |
| opencost.enabled | bool | `false` |  |
| opencost.opencost.prometheus.external.enabled | bool | `true` |  |
| opencost.opencost.prometheus.external.url | string | `""` |  |
| opencost.opencost.prometheus.internal.enabled | bool | `false` |  |
| opencost.opencost.service.labels.app | string | `"opencost"` |  |
| opencost.opencost.ui.enabled | bool | `false` |  |
| openshift.createPrivilegedScc | bool | `false` |  |
| openshift.createScc | bool | `true` |  |
| openshift.enabled | bool | `false` |  |
| openshift.privilegedSccName | string | `nil` |  |
| openshift.privilegedSccPriority | string | `nil` |  |
| openshift.sccName | string | `nil` |  |
| openshift.sccPriority | string | `nil` |  |
| opentelemetry-collector.config.exporters.clickhouse.database | string | `"default"` |  |
| opentelemetry-collector.config.exporters.clickhouse.endpoint | string | `"tcp://nudgebee-agent-clickhouse:9000?dial_timeout=10s&compress=lz4"` |  |
| opentelemetry-collector.config.exporters.clickhouse.logs_table_name | string | `"otel_logs"` |  |
| opentelemetry-collector.config.exporters.clickhouse.metrics_table_name | string | `"otel_metrics"` |  |
| opentelemetry-collector.config.exporters.clickhouse.password | string | `"${env:CLICKHOUSE_PASSWORD}"` |  |
| opentelemetry-collector.config.exporters.clickhouse.retry_on_failure.enabled | bool | `true` |  |
| opentelemetry-collector.config.exporters.clickhouse.retry_on_failure.initial_interval | string | `"5s"` |  |
| opentelemetry-collector.config.exporters.clickhouse.retry_on_failure.max_elapsed_time | string | `"300s"` |  |
| opentelemetry-collector.config.exporters.clickhouse.retry_on_failure.max_interval | string | `"30s"` |  |
| opentelemetry-collector.config.exporters.clickhouse.timeout | string | `"5s"` |  |
| opentelemetry-collector.config.exporters.clickhouse.traces_table_name | string | `"otel_traces"` |  |
| opentelemetry-collector.config.exporters.clickhouse.ttl_days | int | `7` |  |
| opentelemetry-collector.config.exporters.clickhouse.username | string | `"default"` |  |
| opentelemetry-collector.config.processors.batch.send_batch_size | int | `100000` |  |
| opentelemetry-collector.config.processors.batch.timeout | string | `"5s"` |  |
| opentelemetry-collector.config.service.pipelines.logs.exporters[0] | string | `"clickhouse"` |  |
| opentelemetry-collector.config.service.pipelines.logs.processors[0] | string | `"batch"` |  |
| opentelemetry-collector.config.service.pipelines.logs.receivers[0] | string | `"otlp"` |  |
| opentelemetry-collector.config.service.pipelines.traces.exporters[0] | string | `"clickhouse"` |  |
| opentelemetry-collector.config.service.pipelines.traces.processors[0] | string | `"batch"` |  |
| opentelemetry-collector.config.service.pipelines.traces.receivers[0] | string | `"otlp"` |  |
| opentelemetry-collector.enabled | bool | `false` |  |
| opentelemetry-collector.extraEnvs[0].name | string | `"CLICKHOUSE_PASSWORD"` |  |
| opentelemetry-collector.extraEnvs[0].valueFrom.secretKeyRef.key | string | `"admin-password"` |  |
| opentelemetry-collector.extraEnvs[0].valueFrom.secretKeyRef.name | string | `"nudgebee-agent-clickhouse"` |  |
| opentelemetry-collector.mode | string | `"deployment"` |  |
| opentelemetry-collector.ports.jaeger-compact.enabled | bool | `false` |  |
| opentelemetry-collector.ports.jaeger-grpc.enabled | bool | `false` |  |
| opentelemetry-collector.ports.jaeger-thrift.enabled | bool | `false` |  |
| opentelemetry-collector.ports.zipkin.enabled | bool | `false` |  |
| runner.additional_env_vars[0].name | string | `"POPEYE_IMAGE_OVERRIDE"` |  |
| runner.additional_env_vars[0].value | string | `"popeye:v0.11.1"` |  |
| runner.additional_env_vars[1].name | string | `"CLICKHOUSE_HOST"` |  |
| runner.additional_env_vars[1].value | string | `"nudgebee-agent-clickhouse"` |  |
| runner.additional_env_vars[2].name | string | `"CLICKHOUSE_PORT"` |  |
| runner.additional_env_vars[2].value | string | `"8123"` |  |
| runner.additional_env_vars[3].name | string | `"CLICKHOUSE_USER"` |  |
| runner.additional_env_vars[3].value | string | `"default"` |  |
| runner.additional_env_vars[4].name | string | `"CLICKHOUSE_DB"` |  |
| runner.additional_env_vars[4].value | string | `"default"` |  |
| runner.annotations | object | `{}` |  |
| runner.clickhouse_enabled | bool | `false` |  |
| runner.clickhouse_secret | string | `"nudgebee-agent-clickhouse"` |  |
| runner.customClusterRoleRules | list | `[]` |  |
| runner.extraVolumeMounts | list | `[]` |  |
| runner.extraVolumes | list | `[]` |  |
| runner.image.repository | string | `"registry.nudgebee.com/nudgebee-agent"` |  |
| runner.image.tag | string | `"2024-04-12T19-29-20_32b7e3bd4b8e0ec4c5d1a00408945675c9e6cbd5"` |  |
| runner.imagePullPolicy | string | `"IfNotPresent"` |  |
| runner.imagePullSecrets | list | `[]` |  |
| runner.image_registry | string | `"registry.nudgebee.com"` |  |
| runner.krr_image_override | string | `"krr-public:2024-04-04T09-10-41_95900bd12662309ddeb0767d4ca4353d6d1bd3fb"` |  |
| runner.log_level | string | `"INFO"` |  |
| runner.nodeSelector | string | `nil` |  |
| runner.nudgebee.auth_secret_key | string | `""` |  |
| runner.nudgebee.endpoint | string | `"https://collector.nudgebee.com"` |  |
| runner.nudgebee.publish_window | string | `"3600"` |  |
| runner.profiler_image_override | string | `"2024-03-30T14-28-13_540b6ffa8b81eb5f5dfaefa731c2e9dd28ce5355"` |  |
| runner.relay_address | string | `"wss://relay.nudgebee.com/register"` |  |
| runner.resources.limits.cpu | string | `nil` |  |
| runner.resources.requests.cpu | string | `"250m"` |  |
| runner.resources.requests.memory | string | `"1500Mi"` |  |
| runner.tolerations | list | `[]` |  |
| runner.victoria_metrics_enabled | bool | `false` |  |
| runnerServiceAccount.imagePullSecrets | list | `[]` |  |
