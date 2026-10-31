---
sidebar_position: 6
---

# ClickHouse Logs

The NudgeBee Agent can collect container logs into the ClickHouse it ships with, so you can search logs without running a separate logging backend. This page covers that bundled ClickHouse, for operators who install the agent and anyone writing LogQL against these logs.

:::note Requires agent chart 0.1.31 or newer
Chart 0.1.30 accepts `logs.collection` but does not have the delivery behavior, disk guard or ClickHouse alerts this page describes. Self-hosted installs also need NudgeBee server 1.15.0 or newer. This page does not cover an agent installed through the NudgeBee server chart.
:::

## Where to find it

- **Turn on collection:** the agent's Helm values (`logs.collection`).
- **Choose ClickHouse as the logs provider:** **Admin → Integrations → Observability → OpenTelemetry**.
- **Search logs:** open a cluster, then **Monitoring → Query Log** or **Log Groups**.

## How it works

### Collection

The node-agent reads each container's log files on every node and sends the lines through the bundled OpenTelemetry collector to the `otel_logs` table in ClickHouse. The runner reads that table with a read-only user, `nudgebee_reader`.

- **No history.** On its first run on a node, the node-agent reads existing log files from their end. You get logs from the moment collection starts.
- **Namespaces not collected.** Logs from `kube-system` and the agent's own namespace are dropped before ClickHouse. To change this, override `opentelemetry-collector.config.processors.filter/drop_log_namespaces`. An override replaces the whole list.
- **Skipping a container.** The node-agent skips containers that set the environment variable `NUDGEBEE_LOG_MONITORING=disabled`.
- **Node logs.** Logs of systemd units on the node, such as `containerd.service`, can also be stored, with an empty `namespace`. The namespace filter does not drop them.
- **Rows are log records, not lines.** Multi-line messages such as stack traces are joined into one row, and blank lines are folded into the message before them. A row count can be lower than the line count from `kubectl logs`. A row's message is capped at 64 KiB.

### Choosing the provider

Turning on collection makes ClickHouse available. It does not make ClickHouse the logs provider:

- With no other logs provider and the **Logs** toggle off, the logs page shows **No Logs Available**, even though logs are being collected. A workload's **Logs** tab shows logs read through `kubectl` instead. **Agent Health** shows Logs as **Disconnected** on the **Agent** tab and **Not configured** on the **Observability** tab.
- With another logs provider connected, that provider stays in use. After you reload the logs page, **Otel Clickhouse** appears in the **Log Provider** menu. Choosing it there applies to that page only and does not change the default.
- Turning the **Logs** toggle on makes ClickHouse the account's default and clears the default from every other provider on that account. Turning it off clears only ClickHouse's default. It does not restore the provider you had before.
- If you turn off collection and leave the toggle on, the pick is skipped. Logs come from the agent's own provider or the one other provider. With several others and no default, the page shows `multiple logs providers are configured`, and you need to choose a default.

If ClickHouse is the default and is unreachable, NudgeBee shows an error and does not fall back to another provider.

### Delivery

Delivery is at least once. Each node-agent saves its position in every file under `/var/lib/nudgebee-node-agent/<namespace>-<release>` on the node and resumes from there after a restart. A restart can send some lines twice, so counts can read high around a restart.

While the collector or ClickHouse is down or slow, unsent lines wait in the node's log files and the collector holds up to 100,000 records in memory. An outage loses nothing while each container writes less than about one log file (`containerLogMaxSize`, 10 MiB by default). Lines can be lost in these cases, among others:

| Case | What is lost |
|---|---|
| A container writes more than about two log files during an outage, or its log file rotates more than once while the node-agent is down. The kubelet compresses older rotated files, and the node-agent does not read compressed files. | The lines in the skipped files. For loss during an outage, the node-agent logs a warning containing `lines are lost`. Rotations while it is down can lose lines with no warning. |
| The collector restarts or is killed while ClickHouse is down. | The records in its in-memory queue. |
| The node-agent is down for longer than 24 hours (`LOGS_POSITIONS_MAX_AGE`). | Its saved position is ignored, as on a first run, so lines from the gap are not read. |
| The collector rejects a batch with an error that a retry cannot fix (a 4xx other than 408 and 429). | That batch. `node_agent_log_records_dropped_total` counts it with `reason="rejected"`. |
| A pod is removed or a node is replaced during an outage. | Lines not yet sent, because their log files are gone. |

### Disk and retention

Logs, traces and metrics share one disk (`50Gi` by default) and one retention period (`168h` by default). Retention drops data by age, not by size.

When free disk falls below 5%, ClickHouse stops inserts into every table. Logs wait on the nodes as described above. Traces and metrics are retried for 300 seconds and then dropped.

The chart ships these alert rules:

| Alert | Fires when |
|---|---|
| `ClickHouseDiskFilling` | Disk is over 80% full for 10 minutes |
| `ClickHouseDiskAlmostFull` | Disk is over 90% full for 5 minutes |
| `ClickHouseInstanceDown` | ClickHouse is down or missing for 2 minutes |

They need the Prometheus operator, a ClickHouse scrape target, and labels your Prometheus selects. Without matching labels the rules load but never fire. `installation.sh` detects the labels. With Helm, set `prometheusStack.selectorLabels` to match the `ruleSelector` of your Prometheus, for example `--set-string prometheusStack.selectorLabels.release=<prometheus-release>` on kube-prometheus-stack.

## Use it

1. Open a cluster and go to **Monitoring → Query Log**.
2. Choose **Builder**, **Code** or **AI**. **Code** mode takes LogQL, for example:

   ```logql
   {namespace="shop", level="error"}
   {namespace="shop", container="checkout"} |= "timeout"
   {namespace="shop"} |~ "timeout|refused" != "healthz"
   {pod=~"checkout-.*", namespace="shop"} | logfmt | duration > 500
   ```

### Supported LogQL

| Area | Supported |
|---|---|
| Labels | `app`, `container`, `filename`, `job`, `level`, `namespace`, `node_name`, `pod`, `service_name`, `stream` |
| Selector operators | `=`, `!=`, `=~`, `!~`. At least one matcher must not match the empty string. |
| Line filters | <code>&#124;=</code>, `!=`, <code>&#124;~</code>, `!~` |
| Parsers | <code>&#124; json</code> and <code>&#124; logfmt</code>, one per query, without parameters |
| Label filters | Strings: `=`, `!=`, `=~`, `!~`. Numbers: `=`, `==`, `!=`, `>`, `>=`, `<`, `<=`. Combine with `and`, `or`, a comma or parentheses. |
| Metric queries | `count_over_time` and `rate`, alone or under `sum` or `sum by`. Not over <code>&#124; logfmt</code>. Over <code>&#124; json</code>, the query needs `__error__=""` and `sum` or `sum by`. |

Anything else is refused with an error that contains `unsupported LogQL:` and names the feature, so an unsupported feature never runs as an approximation. This includes `line_format`, `label_format`, `pattern`, `regexp`, `unpack`, `unwrap`, `topk`, `bottomk`, `avg`, `min`, `max`, `quantile_over_time`, `offset`, binary operations and comparisons in metric queries. Results can still differ from Loki on supported queries.

### Differences from Loki

| Topic | Behavior here |
|---|---|
| `app` | The owner workload's name (deployment, statefulset, daemonset or cronjob), not the pod's `app` label. Other pods, including those of a standalone Job, a ReplicaSet or a Rollout, use the pod name. |
| `job` | `<namespace>/<workload>` |
| `service_name` | Usually `/k8s/<namespace>/<workload>`, not a bare name. A bare pod holds `/k8s/<namespace>/<pod>/<container>`, and a cronjob pod holds `/k8s-cronjob/<namespace>/<cronjob>/<container>`. |
| `filename` | Accepted, but holds no values on logs from the node-agent |
| `level` | Always present in a selector: `critical`, `error`, `warning`, `info`, `debug` or `unknown`. `warn` and `fatal` also work. Any other value, such as `trace`, is refused. A `level` regex that names a value must be a list of these values, such as `level=~"warn\|error"`. |
| Other labels | Refused, with the list of supported labels, unless they follow a parser, where they read a key from the message. There is no `cluster` label, because each cluster has its own table. |
| JSON logs | See below. |

**JSON logs.** When a JSON log line has a non-empty string message field (`msg`, `message`, `@m`, `@mt`, `body` or `log`), that value becomes the log message. Level and timestamp fields are consumed, and the other fields are stored as attributes. Line filters and <code>&#124; json</code> read only the message, and the logs page does not show attributes. So:

- `|= "word"` does not find a word that appears only in another field.
- `| json | status >= 500` does not match on a field that was moved out of the message.
- `{level="error"}` works, because `level` in the selector comes from the stored severity. `| json | level="error"` returns nothing on these lines, because after a parser `level` reads a key from the message. Filter on `level` in the selector.

Plain text, logfmt and JSON without a message field are stored whole.

### Moving from Loki

Saved queries, knowledge base articles and runbooks written for your Loki labels can stop working:

- A query with a custom label such as `cluster` or `instance` is refused, and the error lists the supported labels.
- A query on `app` or `service_name` can return no rows, because these labels hold different values here. Use `namespace` and `pod`, or the owner workload's name for `app`.
- Loki alert rules are not carried over. ClickHouse logs do not support alerting.

## Set it up

### Before you start

- Install agent chart 0.1.31 or newer.
- Use the release name `nudgebee-agent`. The commands on this page assume it, and namespace `nudgebee-agent`. For any other release name, also set `clickhouse.fullnameOverride=nudgebee-agent-clickhouse`, because the collector's ClickHouse endpoint and Secret use that fixed name, and replace the names in the commands: the workloads are `<release>-nudgebee-agent-node-agent` and `<release>-nudgebee-agent-runner`. On an existing release that already runs ClickHouse, this override replaces it with a new, empty ClickHouse on a new volume. The old data stays on the old volume, which NudgeBee does not read.
- The node-agent must be allowed to run as a privileged pod with host paths.
- ClickHouse needs a `50Gi` volume and `2000Mi` of memory, and the collector up to `1024Mi`. The cluster needs a default StorageClass, or set `global.storageClass`.
- If `kubectl get crd podmonitors.monitoring.coreos.com` returns `NotFound`, add `--set enablePrometheusStack=false` to the commands below. Otherwise the install fails on `PodMonitor`.

Save these values as `ch-logs-values.yaml`:

```yaml
logs:
  collection: node-agent
nodeAgent:
  enabled: true
opentelemetry-collector:
  enabled: true
clickhouse:
  enabled: true
runner:
  clickhouse_enabled: true
```

Pass this file last, so it wins over earlier values files. Self-hosted installs also pass `runner.relay_address`, `runner.nudgebee.endpoint` and `runner.nudgebee.relay_signing_public_key` on a first install. An existing install keeps them through `current.yaml`.

:::warning Do not use `--reuse-values` for this upgrade
Across chart versions, `--reuse-values` keeps the old collector settings and the old node-agent image. Helm can accept the upgrade and the agent reports logs as collected, but the exporter that holds logs back during an outage and the saved positions are missing, so logs can be lost.
:::

:::warning Protect your values file
The commands below write `current.yaml`, which contains your agent key in clear text. Keep it private and delete it when you are done. Create it again with `helm get values` before any later upgrade. After a first upgrade with a password, `helm get values` also returns the ClickHouse password.
:::

### Turn on collection

Choose the steps for your cluster:

```bash
kubectl -n nudgebee-agent get secret nudgebee-agent-clickhouse
```

| Result | Steps |
|---|---|
| The agent is not installed | [Install with collection on](#install-with-collection-on) |
| The Secret exists | [Existing install with ClickHouse](#existing-install-with-clickhouse) |
| `NotFound` | [Existing install without ClickHouse](#existing-install-without-clickhouse). This is the state after the **Minimal install** command, which turns off the collector and ClickHouse. |

#### Install with collection on

Get your agent key as described in [Generate your auth key](../../installation/index.md#step-1-generate-your-auth-key).

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/ && helm repo update
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
  --version 0.1.31 \
  --namespace nudgebee-agent --create-namespace \
  --set runner.nudgebee.auth_secret_key="<KEY>" \
  -f ch-logs-values.yaml --wait --timeout 8m
```

#### Existing install with ClickHouse

No password is needed, because Helm reads the existing Secret.

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/ && helm repo update
helm get values nudgebee-agent -n nudgebee-agent -o yaml > current.yaml
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --version 0.1.31 -n nudgebee-agent \
  -f current.yaml -f ch-logs-values.yaml --wait --timeout 8m
```

#### Existing install without ClickHouse

The first upgrade needs a password and `--no-hooks`. Without a password, Helm stops with `PASSWORDS ERROR`, and the `kubectl get secret` command it suggests cannot help, because the Secret does not exist yet. With a password but with hooks on, the pre-upgrade job waits on a Secret and a ClickHouse that do not exist yet, and the upgrade times out.

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/ && helm repo update
helm get values nudgebee-agent -n nudgebee-agent -o yaml > current.yaml

helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --version 0.1.31 -n nudgebee-agent \
  -f current.yaml -f ch-logs-values.yaml \
  --set clickhouse.auth.password="$(openssl rand -hex 16)" \
  --no-hooks --wait --timeout 8m
```

Then run a normal upgrade straight away, so the schema job that `--no-hooks` skipped runs. It needs no password:

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --version 0.1.31 -n nudgebee-agent \
  -f current.yaml -f ch-logs-values.yaml --wait --timeout 8m
```

If an earlier attempt failed, you can run the first command without deleting anything first.

#### Later upgrades

Create `current.yaml` again with `helm get values`, then run the upgrade command from [Existing install with ClickHouse](#existing-install-with-clickhouse) with the target `--version`. Do not repeat the password or `--no-hooks`.

Do not re-run `installation.sh` or the install commands in the UI to upgrade. They have no flag for `logs.collection`, and Helm resets every value they do not pass:

- The **Minimal install** command removes the collector and ClickHouse, which stops traces as well as logs. The PersistentVolumeClaim stays. Turning collection back on then needs [Existing install without ClickHouse](#existing-install-without-clickhouse).
- The **Re-new Token** command turns collection off and keeps ClickHouse.

### Check the rollout

```bash
kubectl -n nudgebee-agent rollout status ds/nudgebee-agent-node-agent
kubectl -n nudgebee-agent rollout status deploy/nudgebee-agent-runner
```

`--wait` can return before the node-agent is ready, so check it separately. The collector can restart a few times until ClickHouse is ready. This is expected.

### Choose ClickHouse as the logs provider

1. Wait about a minute for the agent's next report, then go to **Admin → Integrations → Observability → OpenTelemetry**.
2. Open the row menu and choose **Edit**. The list is read when the screen opens, so reopen it if the **Logs** row is not there.
3. Turn **Logs** on for the cluster and choose **Done**.
4. Reload the logs page. It can keep the previous provider for up to an hour until you reload.

Nubi can take up to 30 minutes to use the changed provider.

### Check that logs arrive

**Agent Health → Observability** shows **Logs table present** and the source **Agent (ClickHouse)**. This means ClickHouse answers and the table exists, not that logs are arriving. To confirm logs are arriving, start a test pod in a namespace other than `kube-system` or the agent's own:

```bash
kubectl -n default run ch-logs-test --image=busybox:1.36 --restart=Never -- \
  sh -c 'while true; do echo ch-logs-test-line; sleep 5; done'
```

In **Query Log**, use **Code** mode to run `{namespace="default", pod="ch-logs-test"} |= "ch-logs-test-line"`. Then delete the pod.

### Turn it off

1. Turn the **Logs** toggle off, or choose another provider. If you skip this, the pick is skipped once collection stops.
2. Stop collecting and keep ClickHouse and traces:

   ```bash
   helm get values nudgebee-agent -n nudgebee-agent -o yaml > current.yaml
   helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
     --version <chart-version> -n nudgebee-agent \
     -f current.yaml -f ch-logs-values.yaml --set logs.collection=none --wait
   ```

   Existing rows stay until the retention period ends.
3. To remove ClickHouse, turn off the collector as well. This also stops traces. Setting `clickhouse.enabled=false` alone does not remove ClickHouse.

   ```bash
   helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
     --version <chart-version> -n nudgebee-agent \
     -f current.yaml -f ch-logs-values.yaml --set logs.collection=none \
     --set opentelemetry-collector.enabled=false --set clickhouse.enabled=false --wait
   ```

4. The PersistentVolumeClaim stays until you delete it. To delete it, first confirm that `kubectl -n nudgebee-agent get statefulset nudgebee-agent-clickhouse-shard0` returns `NotFound`, then run:

   ```bash
   kubectl -n nudgebee-agent delete pvc data-nudgebee-agent-clickhouse-shard0-0
   ```

   :::warning
   Deleting the PersistentVolumeClaim destroys the stored logs, traces and metrics.
   :::
5. Remove `/var/lib/nudgebee-node-agent/<namespace>-<release>` from each node once the agent is gone. It stays after collection is turned off and after `helm uninstall`.

## When to use it

Bundled ClickHouse logs are a fallback for clusters without a log store. If you already run one, keep using it. Other logs providers keep working alongside collection, as described in [Choosing the provider](#choosing-the-provider).

## Limits and troubleshooting

### Limits

| Limit | Value |
|---|---|
| Query window | 30 days. Data older than the retention period is gone. |
| Lines per query | 5,000. The **Query Log** screen offers up to 1,000. |
| Points per metric query | 50,000, or 11,000 per series. A larger query is refused, not cut short. |
| Query length | 64 KiB of LogQL, 256 KiB of generated SQL |
| Query time | 30 seconds on **Query Log** and **Log Groups**. Other callers can set a deadline of up to 600 seconds. |
| Label values listed | 1,000 |
| Lines scanned by **Log Groups** | The newest 1,000 error lines in the window, so its counts stop at that sample |
| Read-only user, per query | 2,000,000,000 rows, 1,500,000,000 bytes of memory (`clickhouse.reader.*`) |

Wide searches are the slowest. Add a `namespace` to the selector when you can.

### Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| The **Logs** toggle is missing | The agent does not report collection yet, it runs an older chart, or a self-hosted server is older than 1.15.0 | Check the rollout, wait a minute and reopen the screen |
| **No Logs Available** after turning on collection, or **Agent Health** shows Logs as **Disconnected** or **Not configured** | ClickHouse is not chosen as the provider | [Turn on the **Logs** toggle](#choose-clickhouse-as-the-logs-provider) |
| `the built-in logs provider (otel_clickhouse) is configured on this cluster but is not reachable right now`, then **No Logs Available** | ClickHouse is down. **No Logs Available** is misleading: a provider is configured. | Check the ClickHouse pod. Reload the page after it recovers. |
| **Could not load logs** on **Query Log** | ClickHouse is down and the page still holds the provider | Check the ClickHouse pod, then choose **Retry** |
| `this cluster does not collect its container logs into the agent's ClickHouse` | `logs.collection` is `none` on this cluster | [Turn on collection](#turn-on-collection) or read from another provider |
| `logs collection is not enabled on this cluster` | ClickHouse has no logs table | Check that collection is on and that the collector can reach ClickHouse |
| **Logs table present**, but searches return nothing | The table exists but nothing is arriving | Check the node-agent and collector pods. Check free disk with `kubectl -n nudgebee-agent exec nudgebee-agent-clickhouse-shard0-0 -c clickhouse -- df -h /bitnami/clickhouse`. Below 5% free, inserts stop. To add space, see [Storage and PVCs](../../operate/storage-and-pvcs.md#failure-3-disk-full-100-volume-usage). |
| `{namespace="kube-system"}` returns nothing | This namespace is [not collected](#collection) | Use `kubectl logs`, or change the filter |
| <code>&#124;= "word"</code> misses a line you can see in `kubectl logs` | The word is in a [JSON field outside the message](#differences-from-loki) | Search the message text, or use `kubectl logs` |
| `logs.collection=node-agent sends container logs to ClickHouse through the bundled OpenTelemetry collector` | The collector is off | Pass `ch-logs-values.yaml` last |
| `logs.collection=node-agent needs nodeAgent.enabled=true` | The node-agent is off | Pass `ch-logs-values.yaml` last |
| `PASSWORDS ERROR` | The cluster has no ClickHouse Secret yet | See [Existing install without ClickHouse](#existing-install-without-clickhouse) |
| `pre-upgrade hooks failed` | The first upgrade ran with hooks on | See [Existing install without ClickHouse](#existing-install-without-clickhouse) |
