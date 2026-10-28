---
sidebar_position: 5
---

# Grafana Integration

NudgeBee can integrate with Grafana to surface dashboards directly in the NudgeBee UI.

## Configuration

1. **Fetch Grafana admin password**
   ```bash
   kubectl get secret grafana \
     -n <grafana-namespace> \
     -o jsonpath="{.data.admin-password}" \
     | base64 --decode && echo
   ```

2. **Create or update your `values.yaml`**
   ```yaml
   runner:
     grafana:
       url: "http://grafana.grafana.svc"
       username: "admin"
       password: "<GRAFANA_PASSWORD>"
       # optional, semicolon-separated: "X-Org-Id: 2;X-Custom: value"
       extra_headers: ""
   ```

   Setting `url` is what enables the integration; there is no `enabled` flag.

3. **Apply configuration and upgrade the agent**
   - **Using shell script**:
     ```bash
     bash installation.sh -a <NUDGEBEE_AUTH_KEY> -f values.yaml
     ```
     Add the other flags you used for the original install (for example `-g true -x true -t true`); the script does not remember them.
   - **Using Helm**:
     ```bash
     helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
     helm repo update
     helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent \
       --namespace nudgebee-agent \
       --reuse-values \
       -f values.yaml
     ```
     If `values.yaml` holds only these settings, keep `--reuse-values`: it preserves the auth key and the flags from your original install, which Helm otherwise resets. If you maintain a complete values file that includes `runner.nudgebee.auth_secret_key`, drop `--reuse-values` and pass that file instead.

> Replace `<GRAFANA_PASSWORD>` and `<NUDGEBEE_AUTH_KEY>` with your actual values, and adjust the Grafana namespace if it differs from `grafana`.
