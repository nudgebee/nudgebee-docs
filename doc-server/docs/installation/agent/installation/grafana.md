---
sidebar_position: 3
---
# Grafana Integration

Nudgebee integrates with grafana to view existing dashboards 

# Configuration
1. If you have existing grafana instance then need to update grafana config as below
    ``` 
    grafana.ini:
      security:
        allow_embedding: true
    ```
2. Fetch grafana password 
    `kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo`

3. Update nudgebee configuration
    ```values.yaml
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