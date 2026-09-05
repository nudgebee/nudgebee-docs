---
sidebar_position: 3
---

# Upgrade

The Helm chart version and the agent application version are separate. Check both before changing a production cluster:

```bash
helm list -n nudgebee-agent
kubectl get deploy nudgebee-agent-runner -n nudgebee-agent \
  -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
helm search repo nudgebee-agent/nudgebee-agent --versions
```

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

If you installed via the shell script, you can re-run it to upgrade to the latest version:

```bash
wget -O installation.sh \
  https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
chmod +x installation.sh
./installation.sh -a <NUDGEBEE_AUTH_KEY>
```

> The script will detect your existing installation and perform a `helm upgrade` under the hood.

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
