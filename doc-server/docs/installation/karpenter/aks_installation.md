---
sidebar_position: 1
---
# Karpenter for AKS

### Requirements
Before installing the Karpenter, make sure you have the following prerequisites:

- Install `az cli` command-line tool.
- Have an active connection to the desired cluster.
- Install [Helm](https://helm.sh/docs/intro/install/).

### Installation Steps
Follow these steps to install the Karpenter:

#### Create Identity for Karpenter
Get cluster details to create config for karpenter
```shell
AKS_JSON=$(az aks show --name <CLUSTER_NAME> -g <AZ_RESOURCE_GROUP>)
```

#### Create Identity for Karpenter
```shell
KMSI_JSON=$(az identity create --name karpentermsi --resource-group <AZ_RESOURCE_GROUP>)
```

#### Create Karpernter Service Account Auth
Create federated credential linked to the karpenter service account for auth usage:
```shell
az identity federated-credential create --name KARPENTER_FID --identity-name karpentermsi --resource-group <AZ_RESOURCE_GROUP> \
  --issuer "$(jq -r ".oidcIssuerProfile.issuerUrl" <<< "$AKS_JSON")" \
  --subject system:serviceaccount:<KARPENTER_NAMESPACE>:karpenter-sa \
  --audience api://AzureADTokenExchange
```


#### Create a Role for Karpernter
Create role assignments to let Karpenter manage VMs and Network resources:
```shell
KARPENTER_USER_ASSIGNED_CLIENT_ID=$(jq -r '.principalId' <<< "$KMSI_JSON")
RG_MC=$(jq -r ".nodeResourceGroup" <<< "$AKS_JSON")
RG_MC_RES=$(az group show --name "${RG_MC}" --query "id" -otsv)
for role in "Virtual Machine Contributor" "Network Contributor" "Managed Identity Operator"; do
  az role assignment create --assignee "${KARPENTER_USER_ASSIGNED_CLIENT_ID}" --scope "${RG_MC_RES}" --role "$role"
done
```


#### Configure Helm chart values
Karpeter Helm chart requires some configuration via values to work with a specific AKS cluster. 
The values are documented in the Helm chart itself, but you can use configure-values.sh to generate karpenter-values.yaml with the required configuration. 
The script interrogates the AKS cluster and generates the values file, using karpenter-values-template.yaml as a template. 
(The script fetches the template automatically.)
```shell
curl -sO https://raw.githubusercontent.com/Azure/karpenter-provider-azure/main/hack/deploy/configure-values.sh
chmod +x ./configure-values.sh && ./configure-values.sh <CLUSTER_NAME> ${RG} karpenter-sa KarpenterIdentity
```


#### Install Karpenter
```shell
export KARPENTER_VERSION=0.5.1
export KARPENTER_NAMESPACE=<KARPENTER_NAMESPACE>

helm upgrade --install karpenter oci://mcr.microsoft.com/aks/karpenter/karpenter \
  --version "${KARPENTER_VERSION}" \
  --namespace "${KARPENTER_NAMESPACE}" --create-namespace \
  --values karpenter-values.yaml \
  --set controller.resources.requests.cpu=1 \
  --set controller.resources.requests.memory=1Gi \
  --set controller.resources.limits.cpu=1 \
  --set controller.resources.limits.memory=1Gi \
  --wait

kubectl logs -f -n "${KARPENTER_NAMESPACE}" -l app.kubernetes.io/name=karpenter -c controller
```