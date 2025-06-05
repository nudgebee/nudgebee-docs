# Nudgebee Google Traces Integration

## Approach

### Data Export
Currently, nudgebee uses OTEL collector to export data to its clickhouse database for traces generated thru eBPF.
We will reconfigure OTEL collector to export data to google traces

### Data Read
Currently, nudgebee uses Clickhouse to query Traces data. 
To read data from Google traces we are proposing data export from Traces to BigQuery and then accessing Big Query Dataset from Nudgebee.

```
Google Traces  -> Google BigQuery <- Nudgebee-Cluster-Agent
```

## Setup

### Data export using OTEL
https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/googlecloudexporter/README.md

### Data Access Using BigQuery

## Option 1: Workload Identity (Recommended)

### 1. Enable Workload Identity on the GKE Cluster
```bash
gcloud container clusters update [CLUSTER_NAME] \
  --zone=[ZONE] \
  --workload-pool=[PROJECT_ID].svc.id.goog
```

### 2. Enable GKE Metadata Server on Node Pools
```bash
gcloud container node-pools update [NODE_POOL_NAME] \
  --cluster=[CLUSTER_NAME] \
  --zone=[ZONE] \
  --workload-metadata=GKE_METADATA
```

### 3. Create a Google Cloud Service Account (GSA)
```bash
gcloud iam service-accounts create bigquery-access \
  --description="BigQuery access from GKE" \
  --display-name="BigQuery Access"

# Grant required roles
gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:bigquery-access@[PROJECT_ID].iam.gserviceaccount.com" \
  --role="roles/bigquery.user"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:bigquery-access@[PROJECT_ID].iam.gserviceaccount.com" \
  --role="roles/bigquery.jobUser"
```

### 4. Create or Use a Kubernetes Service Account (KSA)
```bash
kubectl create serviceaccount [KSA_NAME] -n [NAMESPACE]
```

### 5. Bind GSA to KSA
```bash
gcloud iam service-accounts add-iam-policy-binding \
  bigquery-access@[PROJECT_ID].iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:[PROJECT_ID].svc.id.goog[[NAMESPACE]/[KSA_NAME]]"
```

### 6. Annotate the KSA
```bash
kubectl annotate serviceaccount [KSA_NAME] -n [NAMESPACE] \
  iam.gke.io/gcp-service-account=bigquery-access@[PROJECT_ID].iam.gserviceaccount.com \
  --overwrite
```

### 7. Use KSA in Deployment/Pod Spec
```yaml
spec:
  serviceAccountName: [KSA_NAME]
```

### 8. Restart Pods
```bash
kubectl rollout restart deployment [DEPLOYMENT_NAME] -n [NAMESPACE]
```

## Option 2: Node Service Account with OAuth Scopes

### 1. Check Default Node Service Account
```bash
gcloud container clusters describe [CLUSTER_NAME] --zone=[ZONE] \
  --format="value(nodeConfig.serviceAccount)"
```

### 2. Grant BigQuery Roles
```bash
gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[DEFAULT_SA_EMAIL]" \
  --role="roles/bigquery.user"

gcloud projects add-iam-policy-binding [PROJECT_ID] \
  --member="serviceAccount:[DEFAULT_SA_EMAIL]" \
  --role="roles/bigquery.jobUser"
```

### 3. Check Node OAuth Scopes
```bash
gcloud container node-pools describe [NODE_POOL_NAME] \
  --cluster=[CLUSTER_NAME] --zone=[ZONE] \
  --format="value(config.oauthScopes)"
```

### 4. If Scopes Are Missing, Create New Node Pool
```bash
gcloud container node-pools create bigquery-pool \
  --cluster=[CLUSTER_NAME] \
  --zone=[ZONE] \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --num-nodes=1
```

### 5. Move Workloads to New Node Pool
Add to your deployment spec:
```yaml
spec:
  template:
    spec:
      nodeSelector:
        cloud.google.com/gke-nodepool: bigquery-pool
```

## ✅ Verification

Run a test pod:
```bash
kubectl run bigquery-test --image=google/cloud-sdk:slim \
  -n [NAMESPACE] --serviceaccount=[KSA_NAME] \
  --restart=Never --rm -it -- bash

# Inside pod
gcloud auth list
bq query --use_legacy_sql=false 'SELECT 1'
```