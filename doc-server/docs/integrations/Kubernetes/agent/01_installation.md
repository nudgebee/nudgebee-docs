---
sidebar_position: 2
---

# Installation

### Requirements
Before installing the nudgebee agent, make sure you have the following prerequisites:

- Installed `kubectl` command-line tool.
- Have a kubeconfig file (default location is `~/.kube/config`).
- Have an active connection to the desired cluster.
- Install [Helm](https://helm.sh/docs/intro/install/).

### Permissions
The nudgebee agent uses the native RBAC model of Kubernetes. All the necessary permissions are listed in the [runner-service-account.yaml](https://raw.githubusercontent.com/nudgebee/k8s-agent/main/charts/nudgebee-agent/templates/runner-service-account.yaml) file.


### Installation Steps
Follow these steps to install the nudgebee agent:

#### Generate nudgebee Agent Keys

Log in to [nudgebee](https://app.nudgebee.com), go to your account settings, and then click "Add Account." Select "K8s" and provide the required details. Use the generated keys in the commands below.
#### Installation using shell script 
Use below command to install agent with dependent installation. Below script will auto detect  

Install agent using below steps
```shell
 wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh 
 sh installation.sh -a <NUDBGEE_AUTH_KEY>
```

#### Install Manually 
##### 1. Install Prometheus
Use the following command to install Prometheus:

```shell
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack -n nudgebee-agent --create-namespace --set nodeExporter.enabled=false --set pushgateway.enabled=false --set alertmanager.enabled=false --set kubeStateMetrics.enabled=true -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
```

##### 2. Add Prometheus ScrapeConfig (if not already installed)
If Prometheus is already installed, add the scrapeConfig using the preferred means for your Prometheus installation. You can use this command:

```shell
kubectl apply -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
```

##### 3. Install the nudgebee Agent using Helm

First, add the nudgebee Agent Helm repository and update it:

```shell
helm repo add nudgebee-agent https://nudgebee.github.io/k8s-agent/
helm repo update
```

Then, install the nudgebee Agent:

```shell
helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent  --namespace nudgebee-agent --create-namespace --set runner.nudgebee.auth_secret_key="<NUDBGEE_AUTH_KEY>" -set existingPrometheus.url="<prometheus_url>" --set opencost.opencost.prometheus.external.url="<prometheus_url>"
```

Make sure to replace `<NUDBGEE_AUTH_KEY>` and `<prometheus_url>` with the appropriate values.