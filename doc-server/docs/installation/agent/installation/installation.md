---
sidebar_position: 2
---

# Installation
<div style={{position: "relative", paddingBottom: "64.86%", height: 0}}><iframe src="https://www.loom.com/embed/c163f9264c714f929ab04e82bf7e792d?sid=eaca9e5c-945c-4368-8564-e17b7baed5ee" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

### Prerequisites

Before installing the Nudgebee Agent, ensure the following requirements are met:

#### Software
- **Helm:** The Nudgebee Agent is deployed using [Helm](https://helm.sh/). Ensure that Helm is installed and configured on your system.
- **Kubernetes:** The minimum supported Kubernetes version is 1.27. The agent has been tested on this version and newer versions.
- **Linux Kernel:** Kubernetes cluster nodes must run at least Linux Kernel version 4.2 or later to ensure eBPF compatibility for the Node Agent.

#### Network
- **Docker Registry Access:** The installer must be able to access `registry.nudgebee.com` and `https://nudgebee.github.io/k8s-agent/` to pull necessary Docker images.
- **Collector/Relay Server Connectivity:** Agents must be able to connect to Collector/Relay Servers over both Websocket and HTTP. These protocols must be allowed.
- **Cloud Provider Pricing Endpoints:** If using OpenCost, the agent must be able to collect pricing data from cloud providers such as AWS and Azure. The relevant pricing endpoints must be accessible.

### System Requirement

Agent requires considers only core nudgebee components (runner/node-agents/tracing), assuming Prometheus/Logs are already available. These configurations are recommended configurations and may require changes (refer helm chart) based on cluster size. We have tested these configruations with upto 100 node cluster

- **Node Agents:** For each node
  - Limits - 1GB RAM (Limit), .5 Core CPU
  - Requests - 100MB RAM (Limit), .1 Core CPU
- **Runner:**
  - Limits - 2GB RAM (Limit), .5 Core CPU
  - Requests - 500MB RAM (Limit), .1 Core CPU
- **Event Watcher:**
  - Limits - 1GB RAM (Limit), .5 Core CPU
  - Requests - 200MB RAM (Limit), .1 Core CPU
- **Tracing:**
  - Limits - 2GB RAM (Limit), .5 Core CPU
  - Requests - 1GB RAM (Limit), .1 Core CPU
  - PVC - 50GB
- **Prometheus:** Depends on Prometheus provider
- **Logs:** Depends on logs provider

### Permissions
The nudgebee agent uses the native RBAC model of Kubernetes. All the necessary permissions are listed in the [runner-service-account.yaml](https://raw.githubusercontent.com/nudgebee/k8s-agent/main/charts/nudgebee-agent/templates/runner-service-account.yaml) file.


### Installation Steps
Follow these steps to install the nudgebee agent:

#### Generate nudgebee Agent Keys

Log in to [nudgebee](https://app.nudgebee.com), click on kubernetes option on left side menu, and then click "Connect cluster.". Provide name for cluster which can be idetified Use the generated keys in the commands below.

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
helm upgrade --install nudgebee-prometheus prometheus-community/kube-prometheus-stack -n nudgebee-agent --create-namespace --set nodeExporter.enabled=false --set pushgateway.enabled=false --set alertmanager.enabled=true --set kubeStateMetrics.enabled=true -f https://raw.githubusercontent.com/nudgebee/k8s-agent/main/extra-scrape-config.yaml
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


### Install Agent on premise instance

 If you are using nudgebee on-premise instance then you will need to update url params of agent, Please refer to below sample values file. 

 ```yaml
runner:
  relay_address: "wss://{relay-server-url}/register"
  clickhouse_enabled: true
  nudgebee: 
    auth_secret_key: "{agent_keys}"
    endpoint: "https://{collector-server-url}/"

existingPrometheus:
  url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

opencost:
  opencost:
    prometheus:
      external:
        url: "http://prometheus-kube-prometheus-prometheus.prometheus.svc:9090"

nodeAgent:
  enabled: true

opentelemetry-collector:
  enabled: true
 ```

 ```shell
 helm upgrade --install nudgebee-agent nudgebee-agent/nudgebee-agent  --namespace nudgebee-agent --create-namespace -f values.yaml
 ```