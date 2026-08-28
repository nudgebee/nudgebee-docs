---
sidebar_position: 3
---

# Try Locally

Run the agent against a throwaway [KinD](https://kind.sigs.k8s.io/) cluster to see what NudgeBee looks like with real data, without touching a real cluster.

## What you get, and what you don't

KinD nodes are containers sharing the host kernel, so the eBPF node agent generally cannot attach its probes. The install below turns it off. You still get workload inventory, events, metrics, and recommendations. You do not get network metrics, L7 traces, or profiling — those need a real node.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [KinD](https://kind.sigs.k8s.io/docs/user/quick-start/)
- [Helm](https://helm.sh/docs/intro/install/)

## 1. Create the cluster

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

kubectl cluster-info
kubectl get nodes
```

## 2. Get an auth key

In [app.nudgebee.com](https://app.nudgebee.com), go to **Admin → Integrations**, open the **Kubernetes Clusters** card, and click **Add K8s Account**. Name it something you will recognise as disposable, mark it **Non-production**, and finish the wizard. Copy the auth key it gives you.

## 3. Install the agent

```bash
wget https://raw.githubusercontent.com/nudgebee/k8s-agent/main/installation.sh
sh installation.sh -a <agent-key> -d true
```

`-d true` disables the node agent, which is what you want on KinD. The script installs everything else, including a Prometheus stack if the cluster has none.

## 4. Wait

Inventory and metrics show up in the UI within about 5 minutes. Rightsizing and cost recommendations need roughly an hour of history before they appear — a fresh cluster has nothing to recommend from yet.

```bash
kubectl get pods -n nudgebee-agent
```

## 5. Clean up

```bash
kind delete cluster
```

Also delete the Kubernetes account in **Admin → Integrations → Kubernetes Clusters**, otherwise it lingers in the UI as a cluster that stopped reporting.
