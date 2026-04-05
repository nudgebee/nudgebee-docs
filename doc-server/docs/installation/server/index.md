---
sidebar_position: 1
sidebar_label: Server
---
# Server Installation

The NudgeBee Server is the central component of the NudgeBee platform. It receives data from NudgeBee Agents, performs analysis, and handles user authentication and integrates with external services.

## Architecture

![Server Architecture](/img/nb_server_architecture.png)

---

<div style={{position: "relative", paddingBottom: "64.86%", height: 0}}><iframe src="https://www.loom.com/embed/dee1ca6f7d294ef2b7f2746243e67e41?sid=256e5a97-215e-46fa-974e-69b329096273" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

### Prerequisites

Before installing the NudgeBee Server, ensure the following requirements are met:

#### Software

- **Helm:** The NudgeBee Server is deployed using [Helm](https://helm.sh/). Ensure that Helm is installed and configured on your system.
- **Kubernetes:** The minimum supported Kubernetes version is 1.27. The server has been tested on this version and newer versions.

#### Network

- **Docker Registry Access:** The installer must be able to access `registry.nudgebee.com` to pull necessary Docker images. Alternatively, user can pull all the required images to their local and push them to their internal docker registry.
- **API Resolution:** Authentication uses the `BASE_URL` to resolve APIs. Therefore, pods must be able to resolve the `BASE_URL` DNS entry.
- **External Integrations:** External integrations (such as Slack, Jira, MS Teams, GitHub Issues, and OpenAI) require network connectivity from the NudgeBee Server.
- **Bidirectional Integrations:** If bidirectional integration is used (e.g., with Slack), then Slack must be able to access the NudgeBee Server's DNS.
- **Inbound Webhooks:** If you use inbound webhooks (e.g., from Datadog, New Relic, PagerDuty, ServiceNow, or GCP Cloud Monitoring), the cluster must be externally accessible so these services can send payloads to the NudgeBee webhook URL.
- **Ingress/DNS:** NudgeBee app can work without Ingress/DNS as well, though features which rely on external communication like Slack/GChat apps and inbound webhooks will not work correctly.

### System Requirement

Following is recommended configuration for NudgeBee Control plane.
This configuration should be sufficient for upto 400 nodes cluster(or multiple clusters).

- Minimum 2 Nodes Kubernetes cluster. With each node
  - 16GB RAM
  - 4 Cores
  - 100 GB SSD
- Persistent Volume, 200 GB
  - 100 GB if External postgres is used
- Postgres Database
  - If not provided, nudgebee will by default install its own postgres database
- LLMs
  - Please refer [LLM Installation Guide](../../integrations/LLM/index.md)
- SSL/DNS
  - Recommended, though NudgeBee server can be accessed without DNS using port-fortwarding
- Email
  - Daily Reports
  - MagicLink based authentication 


All Server components take around 12GB ram and 4 Core CPUs This includes running postgres/rabbitmq etc. If customer is managing these dependencies then it will take around 8GB RAM and 2 Core CPUS


### Configurations
For more details on other possible configurations, please refer [Configurations](./secret_configs.md).
For list of full values of Helm chart, please refer [Helm Values](./helm_values.md).

#### Using `existingSecret`

You can manage secrets outside of Helm by creating them manually and referencing them via the `existingSecret` or `existingSecretName` fields.

* `global.existingNudgebeeSecretName`: Use this to specify an existing Kubernetes secret that holds the primary Nudgebee application configurations (e.g., `NUDGEBEE_LICENSE`, `BASE_URL`). When this is set, the Helm chart will use this secret for Nudgebee's core settings, and you should manage these key-value pairs directly within this referenced secret. Keys inside the secret must match the expected field names.

  **Helm Values Example:**
  ```yaml
  global:
    existingNudgebeeSecretName: 'nudgebee-secret'
  ```

  Ensure other `nudgebee_secret` configurations within the Helm values are removed or commented out,
  as these settings will be managed in the referenced Kubernetes secret.
  ```yaml
  # Remove or comment out the following when using existingNudgebeeSecretName:
  # nudgebee_secret:
  #    NUDGEBEE_LICENSE: YOUR_LICENSE_KEY_HERE
  ```
* `nudgebee_registry_secret.existingSecretName`: Use this if the registry credentials are stored in a pre-created Kubernetes secret.
* `postgresql.auth.existingSecret`: Used to inject an existing Kubernetes secret that contains the Postgres password.
* `clickhouse.auth.existingSecret`: Same usage as above for ClickHouse.
* `rabbitmq.auth.existingPasswordSecret`, `existingErlangSecret`: Same usage for RabbitMQ passwords and Erlang cookie.

### Installation Steps
Follow these steps to install the nudgebee server using Helm:

#### Helm Registry Login
```shell
helm registry login registry.nudgebee.com --username nudgebee --password $NUDGEBEE_LICENSE_KEY
```

#### Install NudgeBee
To install latest nudgebee version 
```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

If you want to install specific version of nudgebee then please use below helm command
```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee --version $CHART_VERSION -f values.yaml  --install --namespace nudgebee --create-namespace --wait --kube-context $KUBE_CONTEXT
```

### Sample Values File

##### Without Ingress

This will require user to do port-forwarding to access nudgebee.
```shell
kubectl port-forward svc/app 3000:80 -n nudgebee --kube-context $KUBE_CONTEXT
```

**Relay Server Url** - ws://relay-server.nudgebee.svc:8080

**Collector Server Url** - http://k8s-collector.nudgebee.svc


```yaml
global:
  image:
    registry: "registry.nudgebee.com"
  imagePullSecrets:
    - name: nudgebee-registry-secret

nudgebee_registry_secret:
  enabled: true

nudgebee_secret:
  BASE_URL: "http://localhost:3000"
  NUDGEBEE_LICENSE: <NudgeBee License Key>

app:
  ingress:
    enabled: false
k8s-collector:
  ingress:
    enabled: false
relay-server:
  ingress:
    enabled: false
```

#### With Ingress

Below values file is based on cert-manager managed SSL. These can be adjusted based on cluster specific implementation.

**Relay Server Url** - wss://`relay-domain`

**Collector Server Url** - https://`collector-domain`


```yaml

##### With SSL Ingress

```yaml
global:
  image:
    registry: "registry.nudgebee.com"
  imagePullSecrets:
    - name: nudgebee-registry-secret

nudgebee_registry_secret:
  enabled: true


nudgebee_secret:
  BASE_URL: "<NudgeBee Server Https Url>"
  NUDGEBEE_LICENSE: <UR License Key>
  NEXTAUTH_DUMMY_CREDS_ENABLED: true

app:
  ingress:
    enabled: true
    hosts:
      - host: "<NudgeBee Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<NudgeBee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
      nginx.ingress.kubernetes.io/proxy-buffer-size: '32k'
      nginx.ingress.kubernetes.io/proxy-body-size: "10m"     
k8s-collector:
  ingress:
    enabled: true
    hosts:
      - host: "<NudgeBee collector Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<NudgeBee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
      nginx.ingress.kubernetes.io/proxy-body-size: "50m"
relay-server:
  ingress:
    enabled: true
    hosts:
      - host: "<NudgeBee relay Base Domain>"
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-tls
        hosts:
        - "<NudgeBee Base Domain>"
    annotations: 
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```


### Uninstall NudgeBee

```shell
helm uninstall nudgebee  --namespace nudgebee --kube-context $KUBE_CONTEXT
```


### Troubleshooting Installation Failures

A common reason for installation failures or timeouts, particularly during initial setup, is the **post-installation migration job** not completing successfully. This often occurs if dependent services (like the database) were not fully ready when the Helm chart initiated this job. If you suspect this specific scenario is affecting your installation, the following steps can help:

#### 🔁 Re-run Helm Upgrade

To retry the installation and ensure the migration job is executed again, simply re-run the Helm upgrade command:

```shell
helm upgrade nudgebee oci://registry.nudgebee.com/nudgebee -f values.yaml --install --namespace nudgebee --wait --kube-context $KUBE_CONTEXT
```

> **Note**: If you were installing a specific version, include the `--version` flag as well.

This will re-trigger the post-install hook (e.g., database migration) and complete any pending setup steps.

If this specific fix doesn't resolve the issue, or if you suspect a different cause for the installation failure, consider these general troubleshooting steps:
*   **Check Pod Logs**: Examine logs from pods in the `nudgebee` namespace, particularly those related to migrations (e.g., `postgres-migrations`) or any pods in an error or crashloopbackoff state.
    ```shell
    kubectl logs <pod-name> -n nudgebee
    ```
*   **Inspect Pod Status and Events**: Get detailed information about failing or pending pods.
    ```shell
    kubectl get pods -n nudgebee -o wide
    kubectl describe pod <failing-pod-name> -n nudgebee
    ```
*   **Review Kubernetes Events**: Look for relevant events in the namespace that might indicate underlying problems (e.g., image pull errors, resource issues, volume mounting problems).
    ```shell
    kubectl get events -n nudgebee --sort-by=.lastTimestamp
    ```
---
sidebar_position: 2
---
# Server

The NudgeBee Server is the central component of the NudgeBee platform. It receives data from NudgeBee Agents, performs analysis, and handles user authentication and integrates with external services.


## Architecture


![Server Architecture](/img/nb_server_architecture.png)




