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
       enabled: true
       username: "admin"
       password: "<GRAFANA_PASSWORD>"
       url: "http://grafana.grafana.svc"
   ```

3. **Apply configuration and upgrade the agent**  
   - **Using shell script**:  
     ```bash
     sh installation.sh -a <NUDBGEE_AUTH_KEY> -f values.yaml
     ```
   - **Using Helm**:  
     ```bash
     helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
     helm repo update
     helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent \
       --namespace nudgebee-agent \
       --create-namespace \
       -f values.yaml
     ```

> Replace `<GRAFANA_PASSWORD>` and `<NUDBGEE_AUTH_KEY>` with your actual values, and adjust the Grafana namespace if it differs from `grafana`.  
