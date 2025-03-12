---
sidebar_position: 5
---
# Grafana

Nudgebee integrates with grafana to view existing dashboards within Nudgebee UI

# Configuration

1. Fetch grafana password 
    `kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo`


3. Update nudgebee configuration
    ```values.yaml
    runner:
        grafana:
            enabled: true
            username: "admin"
            password: ""
            url: "http://grafana.grafana.svc"
    ```

4. Update nudgebee agent
    ```
    sh installation.sh -a <token> -f values.yaml
    ```
    or using helm 
    ```
    helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
    helm repo update 
    helm upgrade nudgebee-agent nudgebee-agent/nudgebee-agent --namespace nudgebee-agent -f values.yaml 
    ```
