---
sidebar_position: 2
sidebar_label: Install Script Reference
keywords: [installation.sh, install script flags, agent install command, -a auth key, -g, -x, -t, -d, minimal install]
---

# Install Script Reference

`installation.sh` wraps the agent's Helm install. The NudgeBee UI shows it on the **Shell Script** tab of **Finish Setup** when you add a cluster (**Admin → Integrations → Kubernetes Clusters → Add K8s Account**; the **Helm** tab is the default). This page lists what each flag does.

## The UI's default command

```bash
curl -fsSL https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh -o installation.sh && bash installation.sh -a "<ACCESS_KEY>:<SECRET>" -S "<SIGNING_PUBLIC_KEY>" -g true -x true -t true
```

The UI adds `-S` when your NudgeBee server has a signing key, `-d true` if you untick the node agent, and `-w` / `-c` / `-i` when you fill those fields.

The UI's default is a **minimal install**: no bundled Prometheus stack (`-g true`), and no OpenTelemetry collector or ClickHouse (`-t true`) — so **no traces** until you turn tracing on. Drop `-g` and `-t` to get them. OpenCost is off in the chart by default either way (`-x true` only keeps it off); turn it on with `-f` and `opencost.enabled: true`.

:::caution Run it with `bash`, and have `bc` installed
The script needs bash. `sh installation.sh` fails on systems where `sh` is not bash (for example Debian and Ubuntu). It uses `bc` for its kernel check; without `bc` the check passes every node, so the node agent is not turned off for old kernels.
:::

## Flags

| Flag | What it does |
|---|---|
| `-a <key>` | **Required.** The agent auth key from the UI (`<access key>:<secret>`). Sets `runner.nudgebee.auth_secret_key`. |
| `-n <namespace>` | Namespace to install into. Default `nudgebee-agent`. |
| `-z <release>` | Helm release name. Default `nudgebee-agent`. |
| `-k <context>` | Runs `kubectl config use-context <context>` first. This **changes your current kubectl context** and leaves it changed. |
| `-f <file>` | Extra Helm values file. |
| `-p <url>` | Prometheus URL to use (`globalConfig.prometheus_url`, also used by OpenCost). Skips Prometheus discovery. |
| `-m <url>` | Sets `globalConfig.alertmanager_url`. The chart does not pass this value to the agent, so it has no effect. |
| `-r <org id>` | Sends `X-Scope-OrgID: <org id>` to Prometheus and OpenCost — for multi-tenant Mimir, Cortex or Thanos. (It also sets `globalConfig.alertmanager_headers`, which the chart does not use.) |
| `-g true` | Don't install the bundled Prometheus stack, and skip Prometheus discovery and rule-selector label detection. |
| `-x true` | Keep OpenCost off (it is off by default). |
| `-t true` | Don't install the OpenTelemetry collector and ClickHouse (no traces). |
| `-d <any value>` | Don't install the node agent (eBPF). **Any** value turns it off — even `-d false`. The script also turns it off by itself for some old kernels (3.x, 4.0, 4.1 and 4.10–4.15; its version check lets 4.2–4.9 through). |
| `-o <any value>` | OpenShift mode (SCCs, adjusted security contexts). **Any** value turns it on — even `-o false`. If you grant SCCs yourself, grant them to the runner's ServiceAccount (`nudgebee-agent-runner-service-account` with the default release name) — the node agent DaemonSet uses that ServiceAccount too. |
| `-C <storage class>` | StorageClass for ClickHouse, Prometheus and Loki. |
| `-s <secret>` | Load extra environment variables for the runner from this Kubernetes Secret. |
| `-w <url>` | Relay address (self-hosted), e.g. `wss://relay.yourcompany.com/register`. |
| `-c <url>` | Collector endpoint (self-hosted), e.g. `https://collector.yourcompany.com`. |
| `-S <key>` | Relay signing public key (self-hosted). |
| `-i <registry>` | Accepted, but currently has no effect. To use a private registry, set the image keys listed in [Air-gapped and private registries](./index.md#air-gapped-and-private-registries). |

There are no long options (`--auth-key` and similar don't work).

## Questions the script asks

Unless you pass `-g true` or `-p`, the script looks for Prometheus in the cluster. If it finds none, it asks whether to install one:

- Answer **`yes`** to install `kube-prometheus-stack` as the release `nudgebee-prometheus`.
- **Any other answer stops the script without installing the agent.** Pass `-p <url>` to use an existing Prometheus, or `-g true` to skip it.

After the agent is installed it may also ask whether to install Loki for logs (release `nudgebee-loki`) — even with `-g true`. Answering anything but `yes` skips Loki; it doesn't undo the agent install.

## Re-running the script

The script runs `helm upgrade --install` **without** `--reuse-values`. Re-running it with only `-a` resets the agent to the chart defaults: the bundled Prometheus stack setting (`enablePrometheusStack`) goes back on and the script looks for Prometheus again — asking to install one if it finds none — and the OpenTelemetry collector and ClickHouse come back if your original flags turned them off. Self-hosted `-w`/`-c` settings are dropped. If the script installed Prometheus the first time, the re-run finds that Prometheus and no longer sets `nodeAgent.podmonitor.enabled=false`, so the node agent gets scraped twice — pass `-f` with a values file containing `nodeAgent.podmonitor.enabled: false`. Pass the same flags you installed with, or upgrade with Helm and `--reuse-values` — see [Upgrade](./upgrade.md).

## Related

- [Agent Installation](./index.md)
- [Upgrade](./upgrade.md)
- [Uninstall the Agent](../operate/uninstall.md)
