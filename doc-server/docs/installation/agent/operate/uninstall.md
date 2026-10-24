---
sidebar_label: Uninstall the Agent
keywords: [uninstall agent, remove nudgebee agent, delete agent, helm uninstall, cleanup, leftover pvc]
---

# Uninstall the Agent

## 1. Remove the agent from the cluster

```bash
helm uninstall nudgebee-agent -n nudgebee-agent
```

Use your release name and namespace if you changed them (`-z` / `-n` on the [install script](../installation/install-script.md)).

This removes everything the chart created: the runner, event watcher, node agent DaemonSet, OpenTelemetry collector, OpenCost (if enabled), the ClusterRoles and ClusterRoleBindings, and the chart's Secrets. The agent chart installs no CRDs.

## 2. Clean up what Helm leaves behind

| Left behind | Why | Remove with |
|---|---|---|
| The release namespace (default `nudgebee-agent`) | It was created at install time (`--create-namespace`), not by the chart | `kubectl delete namespace nudgebee-agent` |
| ClickHouse volume (50 Gi by default) | Helm doesn't delete StatefulSet volume claims | `kubectl get pvc -n nudgebee-agent`, then `kubectl delete pvc <name> -n nudgebee-agent` — or delete the release namespace |
| Alert rules created from NudgeBee, scanner Jobs | The agent created them at runtime, so Helm doesn't track them | Deleting the release namespace removes them |

If the install script also installed Prometheus or Loki for you, they are separate releases with their own volumes (50 Gi and 10 Gi by default):

```bash
helm uninstall nudgebee-prometheus -n nudgebee-agent
helm uninstall nudgebee-loki -n nudgebee-agent
```

Removing `nudgebee-prometheus` leaves the Prometheus Operator CRDs (`prometheuses.monitoring.coreos.com` and others). Delete them only if nothing else in the cluster uses Prometheus Operator.

## 3. Remove the account in NudgeBee

Uninstalling the agent doesn't delete the cluster from NudgeBee — it shows as **Not Connected**. To remove it, delete the account in **Admin → Integrations → Kubernetes Clusters**. Data already collected is kept according to your retention settings.

## Proxy agent (forager)

| Installed with | Remove with |
|---|---|
| Helm | `helm uninstall nudgebee-forager -n <namespace>` (your release name if you changed it) |
| Docker / Compose | `docker rm -f nudgebee-forager`, or `docker compose down` |
| Linux (systemd) | `sudo systemctl disable --now nudgebee-forager`, `sudo rm /etc/systemd/system/nudgebee-forager.service && sudo systemctl daemon-reload`, then delete `/usr/local/bin/nudgebee-forager`, `/etc/nudgebee/` and `/var/lib/nudgebee/`, and `sudo userdel nudgebee` |

Then remove the proxy agent's account in **Admin → Integrations**.

## Related

- [Agent Installation](../installation/index.md)
- [Agent Health](./agent-health.md)
