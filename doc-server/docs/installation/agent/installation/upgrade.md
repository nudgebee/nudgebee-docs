---
sidebar_position: 3
---

# Upgrade

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

### 2. Quick Upgrade (Shell Script)

If you installed via the shell script, you can re-run it to upgrade to the latest version:

```bash
wget -O installation.sh \
  https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
chmod +x installation.sh
./installation.sh -a <NUDBGEE_AUTH_KEY>
```

> The script will detect your existing installation and perform a `helm upgrade` under the hood.

---

### 3. Manual Upgrade

#### a. Update the Helm Repository

```bash
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/ \
  --force-update
helm repo update
```

#### b. (Optional) Check Available Versions

```bash
helm search repo nudgebee-agent/nudgebee-agent --versions
```

#### c. Perform the Upgrade

```bash
helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
  --namespace nudgebee-agent \
  --reuse-values \
  --set runner.nudgebee.auth_secret_key="<NUDBGEE_AUTH_KEY>"
```

- `--reuse-values` preserves your existing settings from the previous install.
- If you maintain a custom `values.yaml`, use:
  ```bash
  helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
    --namespace nudgebee-agent \
    -f current-values.yaml
  ```

---

### 4. Verify the Upgrade

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

---

### 5. Rollback (if needed)

If something goes wrong, roll back to the previous release:

```bash
helm rollback nudgebee-agent <REVISION> \
  --namespace nudgebee-agent
```

Use `helm history nudgebee-agent --namespace nudgebee-agent` to list revisions.

---
