---
sidebar_position: 3
---

# Try Locally

## Introduction

This guide provides step-by-step instructions on how to install nudgebee agent with a Kubernetes cluster using KinD (Kubernetes in Docker) with multiple nodes.

## Limitation

- NudgeBee features like eBPF based tracing may not work using KiND.

## Prerequisites

Before you begin, ensure that you have the following prerequisites installed on your machine:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- kubectl: [Install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- KinD: [Install KinD](https://kind.sigs.k8s.io/docs/user/quick-start/)
- Helm: [Install Helm](https://helm.sh/docs/intro/install/)

## Installation Steps

### Step 1: Create and Launch KinD Cluster

Run the following command to create and launch the KinD cluster with a multi-node configuration:

```bash
kind create cluster --config <(cat <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF
)
```

### Step 2: Verify installation

```bash
kubectl cluster-info
kubectl get nodes
```


### Step 3: Generate nudgebee Agent Keys

Log in to [nudgebee](https://app.nudgebee.com), go to kubernetes, and then click "Add Account." Select "K8s" and provide the required details. Use the generated keys in the next step.

### Step 4: Install nudgebee agent

```bash
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
sh installation.sh -a <agent-key> -d true
```

It will take upto 5 mintutes to collect data and upto 1 hour to generate recommendation


### Step 5: Delete cluster
After installation delete cluster using 

```bash
kind delete cluster
```