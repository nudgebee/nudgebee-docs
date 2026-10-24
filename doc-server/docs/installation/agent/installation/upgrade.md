---
sidebar_position: 3
---

# Upgrade

The agent's version **is** its Helm chart version — the chart's `version` and `appVersion` are always the same, and that is what NudgeBee shows in Agent Health. (The image tag is a build date and commit, not the version.) Check what you run and what is available:

```bash
helm list -n nudgebee-agent          # CHART column, e.g. nudgebee-agent-0.1.30
helm search repo nudgebee-agent/nudgebee-agent --versions
```

**Latest version:** the newest release on [GitHub Releases](https://github.com/nudgebee/k8s-agent/releases) tagged `nudgebee-agent-X.Y.Z` that isn't a pre-release (release candidates are `-rc-N` pre-releases). NudgeBee compares your version against it and shows **Update available.** in Agent Health when they differ.

Pin the chart version in production so the same command is repeatable across clusters. Read the target chart's values before upgrading because newly introduced defaults are not applied when Helm reuses stored values.

### Prerequisites

Before upgrading your NudgeBee Agent, ensure the following:

#### Software
- **Helm** installed and configured.
- **Kubernetes** cluster v1.27 or newer.
- **kubectl** configured for your target cluster.

---

### 1. Backup Current Configuration

1. **Export current Helm values**
   ```bash
   helm get values nudgebee-agent \
     --namespace nudgebee-agent > current-values.yaml
   ```
2. **Save any custom manifests or secrets** you applied manually.

---

### 2. Choose the Target Version

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/ \
  --force-update
helm repo update
helm search repo nudgebee-agent/nudgebee-agent --versions
helm show values nudgebee-agent/nudgebee-agent --version <TARGET_CHART_VERSION> \
  > target-default-values.yaml
```

Compare `target-default-values.yaml` with `current-values.yaml`. Pay particular attention to module switches, image settings, Prometheus selectors, authentication, and storage values.

### 3. Quick Upgrade (Shell Script)

If you installed with the script, you can re-run it to upgrade to the latest version:

```bash
curl -fsSL https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh -o installation.sh
bash installation.sh -a <NUDGEBEE_AUTH_KEY> <the same flags you installed with>
```

:::caution Pass the same flags again
The script runs `helm upgrade --install` **without** `--reuse-values`. Re-running it with only `-a` resets the agent to the chart defaults: it turns back on the bundled Prometheus stack, OpenTelemetry collector and ClickHouse if your original flags turned them off (as the UI's minimal install does), drops self-hosted `-w`/`-c` settings, and asks about Prometheus again. The command the UI shows under *Update the Agent* / *Re-new Token* has only `-a` — add your other flags, or use the Helm upgrade below.
:::

---

### 4. Manual Upgrade

#### Perform the Upgrade

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  --version <TARGET_CHART_VERSION> \
  --reuse-values \
  --set runner.nudgebee.auth_secret_key="<NUDGEBEE_AUTH_KEY>"
```

- `--reuse-values` preserves settings stored in the existing Helm release. It can also preserve values that the target chart has deprecated or whose defaults have changed. Review the rendered manifests before applying.
- If you maintain a custom `values.yaml`, use:
  ```bash
  helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
    --namespace nudgebee-agent \
    --version <TARGET_CHART_VERSION> \
    -f values.yaml
  ```

Render the exact upgrade inputs first:

```bash
helm template nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  --version <TARGET_CHART_VERSION> \
  -f values.yaml > rendered-agent.yaml
```

If you do not maintain a source-controlled values file, use `current-values.yaml` as the starting point, remove values that are no longer supported, and add required target-version values explicitly.

---

### 5. Verify the Upgrade

1. **Monitor rollout status**
   ```bash
   kubectl rollout status deployment nudgebee-agent-runner \
     --namespace nudgebee-agent
   ```
2. **Check logs**
   ```bash
   kubectl logs -l app.kubernetes.io/name=nudgebee-agent \
     --namespace nudgebee-agent
   ```
3. **Check every enabled component**
   ```bash
   kubectl get deploy,daemonset,statefulset,pods -n nudgebee-agent
   kubectl get prometheusrule,servicemonitor,podmonitor -n nudgebee-agent
   ```
4. Open **Agent Health** and verify the relay, Prometheus, Alertmanager, logs, traces, and node-agent status expected for your enabled modules.

---

### 6. Rollback (if needed)

If something goes wrong, roll back to the previous release:

```bash
helm rollback nudgebee-agent <REVISION> \
  --namespace nudgebee-agent
```

Use `helm history nudgebee-agent --namespace nudgebee-agent` to list revisions.

Rollback restores the previous rendered manifests and stored values. It does not automatically shrink PVCs or reverse changes made by external systems. Check workload rollout status and Agent Health after rollback.

---
