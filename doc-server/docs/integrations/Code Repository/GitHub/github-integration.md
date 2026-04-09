# GitHub Integration Guide

## Overview

NudgeBee's GitHub integration enables automated code analysis and pull request creation for Kubernetes rightsizing recommendations. By annotating your Kubernetes deployments with repository information, NudgeBee can automatically apply resource optimizations directly to your infrastructure code.

## What NudgeBee Can Do

- **Automated PR Creation**: Create pull requests for rightsizing recommendations
- **Direct Code Updates**: Apply CPU, memory, and replica optimizations to Helm values files
- **Traceability**: Link recommendations to specific commits and deployments
- **Cost Optimization**: Automatically implement resource savings in your infrastructure code

## Prerequisites

1. **GitHub Access**: Personal account or GitHub App with repository access
2. **NudgeBee Account**: Active account with Kubernetes monitoring enabled
3. **Kubernetes Deployments**: Using Helm charts with standard values files
4. **Repository Permissions**: Read/write access to your infrastructure repositories

---

## Two Types of Annotations

NudgeBee uses two different annotation prefixes for different purposes:

### 1. `workloads.nudgebee.com/` - Source Code Detection
**Purpose**: Links your running workloads to application source code for event investigation and code analysis.

**When to use**: When you want NudgeBee to analyze your application code during error investigations.

```yaml
annotations:
  workloads.nudgebee.com/git.repo: "https://github.com/your-org/app-source.git"
  workloads.nudgebee.com/git.hash: "abc123def456"
```

### 2. `ci.nudgebee.com/` - Infrastructure Code (Required for GitHub Adapter)
**Purpose**: Required for NudgeBee to automatically apply rightsizing recommendations to your Helm values files.

**When to use**: When you want NudgeBee to create PRs for resource optimizations.

```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/your-org/k8s-manifests.git"
  ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"
```

---

## Quick Start: Enable Automated Rightsizing PRs

### Step 1: Configure GitHub Integration

**In NudgeBee UI:**
1. Navigate to **Integrations** → **GitHub**
2. Click **Add Integration**
3. Choose authentication method:

**Option A: Personal Access Token**
- Generate a token at: GitHub → Settings → Developer settings → Personal access tokens
- Required scopes: `repo`, `workflow`
- Copy token and paste into NudgeBee

**Option B: GitHub App (Recommended)**
- Click "Install GitHub App"
- Authorize access to your repositories
- NudgeBee will automatically manage tokens

### Step 2: Add Required Annotations

Add these annotations to your Kubernetes Deployment, StatefulSet, or DaemonSet:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-application
  annotations:
    # Required: Infrastructure repository URL
    ci.nudgebee.com/git.repo: "https://github.com/your-org/k8s-manifests.git"

    # Required: Path to your Helm values file
    ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"

    # Optional: Target branch (defaults to "main")
    ci.nudgebee.com/git.branch: "main"
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:v1.2.3
        resources:
          requests:
            cpu: 500m
            memory: 500Mi
```

### Step 3: Apply and Wait

```bash
kubectl apply -f deployment.yaml
```

NudgeBee will:
1. Monitor your workload's resource usage
2. Generate rightsizing recommendations after collecting enough data
3. Automatically create pull requests when optimization opportunities are found

---

## Complete Example

### Scenario: Production Deployment with Helm

**Repository Structure:**
```
k8s-manifests/
├── charts/
│   └── my-app/
│       ├── Chart.yaml
│       ├── values-dev.yaml
│       ├── values-prod.yaml
│       └── templates/
│           └── deployment.yaml
```

**Deployment with Annotations:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: production
  annotations:
    # GitHub adapter annotations (for automated PRs)
    ci.nudgebee.com/git.repo: "https://github.com/mycompany/k8s-manifests.git"
    ci.nudgebee.com/git.branch: "main"
    ci.nudgebee.com/helm.values.filePath: "charts/my-app/values-prod.yaml"
    ci.nudgebee.com/git.hash: "f02775982a8b1c3d4e5f6a7b8c9d0e1f2a3b4c5d"

    # Optional: Source code annotations (for code analysis)
    workloads.nudgebee.com/git.repo: "https://github.com/mycompany/api-server.git"
    workloads.nudgebee.com/git.hash: "abc123def456789012345678901234567890abcd"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: registry.example.com/api-server:v2.4.1
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
```

**Your Helm Values File (`values-prod.yaml`):**
```yaml
replicaCount: 3

image:
  repository: registry.example.com/api-server
  tag: v2.4.1

resources:
  requests:
    cpu: 500m
    memory: 1Gi
  limits:
    cpu: 1000m
    memory: 2Gi
```

**NudgeBee Will Create a PR Like This:**

```markdown
## Summary
- Rightsized CPU request from 500m to 150m based on 99th percentile usage
- Adjusted Memory request from 1Gi to 600Mi based on observed stability

## Changes Table
| Container | Resource | Before | After | Change |
|-----------|----------|--------|-------|--------|
| api | CPU Request | 500m | 150m | -350m |
| api | CPU Limit | 1000m | 300m | -700m |
| api | Memory Request | 1Gi | 600Mi | -424Mi |
| api | Memory Limit | 2Gi | 800Mi | -1224Mi |

## Motivation
Cost optimization via lower CPU request and reduced memory allocation based on
14 days of production usage data. Potential monthly savings: $147.

📊 [View Full Recommendation](https://app.nudgebee.com/kubernetes/details/account-id?id=recommendation-id)

*View detailed resource analysis, usage patterns, and cost savings in NudgeBee*
```

---

## Required vs Optional Annotations

### Minimum Required (for GitHub Adapter)

```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/repo.git"
  ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"
```

### Recommended

```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/repo.git"
  ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"
  ci.nudgebee.com/git.hash: "abc123def456"  # Track deployed version
  ci.nudgebee.com/git.branch: "main"         # Defaults to "main"
```

### Full Set (with Source Code)

```yaml
annotations:
  # Infrastructure code (for PRs)
  ci.nudgebee.com/git.repo: "https://github.com/org/k8s-manifests.git"
  ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"
  ci.nudgebee.com/git.hash: "abc123"
  ci.nudgebee.com/git.branch: "main"

  # Application source code (for analysis)
  workloads.nudgebee.com/git.repo: "https://github.com/org/app-source.git"
  workloads.nudgebee.com/git.hash: "def456"
```

---

## Annotation Reference

### GitHub Adapter Annotations (`ci.nudgebee.com/`)

| Annotation | Required | Default | Description |
|------------|----------|---------|-------------|
| `ci.nudgebee.com/git.repo` | **Yes** | - | HTTPS URL to infrastructure repository |
| `ci.nudgebee.com/helm.values.filePath` | **Yes** | - | Path to Helm values file (relative to repo root) |
| `ci.nudgebee.com/git.branch` | No | `main` | Target branch for PRs |
| `ci.nudgebee.com/git.hash` | No | - | Git commit SHA of deployed version |
| `ci.nudgebee.com/helm.values.rootPath` | No | - | JSON path prefix for all values (e.g., `app.resources`) |

### Source Code Annotations (`workloads.nudgebee.com/`)

| Annotation | Required | Description |
|------------|----------|-------------|
| `workloads.nudgebee.com/git.repo` | No | Application source code repository |
| `workloads.nudgebee.com/git.hash` | No | Source code commit SHA |

---

## Advanced: Non-Standard Helm Structures

If your `values.yaml` doesn't follow the standard Kubernetes resource structure, use these optional annotations:

### Standard Structure (No extra annotations needed)

```yaml
# values.yaml
resources:
  requests:
    cpu: 100m        # ← NudgeBee finds this automatically
    memory: 256Mi    # ← NudgeBee finds this automatically
  limits:
    cpu: 200m
    memory: 512Mi

replicaCount: 3      # ← NudgeBee finds this automatically
```

### Non-Standard Structure (Extra annotations required)

```yaml
# values.yaml - Custom structure
application:
  compute:
    cpuReq: 100m           # ← Non-standard location
    cpuMax: 200m
    memoryReq: 256Mi
    memoryMax: 512Mi
  scaling:
    instances: 3           # ← Non-standard location
```

**Required annotations for non-standard structure:**

```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/repo.git"
  ci.nudgebee.com/helm.values.filePath: "values-prod.yaml"

  # Custom JSON paths for non-standard structure
  ci.nudgebee.com/helm.values.cpuRequestJsonPath: "application.compute.cpuReq"
  ci.nudgebee.com/helm.values.cpuLimitJsonPath: "application.compute.cpuMax"
  ci.nudgebee.com/helm.values.memoryRequestJsonPath: "application.compute.memoryReq"
  ci.nudgebee.com/helm.values.memoryLimitJsonPath: "application.compute.memoryMax"
  ci.nudgebee.com/helm.values.replicaJsonPath: "application.scaling.instances"
```

### Available JSON Path Annotations

| Annotation | Default Path | Use When |
|------------|--------------|----------|
| `ci.nudgebee.com/helm.values.cpuRequestJsonPath` | `resources.requests.cpu` | CPU request is elsewhere |
| `ci.nudgebee.com/helm.values.cpuLimitJsonPath` | `resources.limits.cpu` | CPU limit is elsewhere |
| `ci.nudgebee.com/helm.values.memoryRequestJsonPath` | `resources.requests.memory` | Memory request is elsewhere |
| `ci.nudgebee.com/helm.values.memoryLimitJsonPath` | `resources.limits.memory` | Memory limit is elsewhere |
| `ci.nudgebee.com/helm.values.replicaJsonPath` | `replicaCount` | Replica count is elsewhere |

---

## Repository Patterns

### Pattern 1: Monorepo with Multiple Apps

```
monorepo/
├── services/
│   ├── api/
│   │   └── k8s/
│   │       └── values-prod.yaml
│   ├── frontend/
│   │   └── k8s/
│   │       └── values-prod.yaml
│   └── worker/
│       └── k8s/
│           └── values-prod.yaml
```

**API Deployment:**
```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/monorepo.git"
  ci.nudgebee.com/helm.values.filePath: "services/api/k8s/values-prod.yaml"
```

**Frontend Deployment:**
```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/monorepo.git"
  ci.nudgebee.com/helm.values.filePath: "services/frontend/k8s/values-prod.yaml"
```

### Pattern 2: Dedicated Infrastructure Repository

```
k8s-infrastructure/
├── production/
│   ├── api-server.yaml
│   ├── database.yaml
│   └── cache.yaml
└── staging/
    ├── api-server.yaml
    └── database.yaml
```

**Production API:**
```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/k8s-infrastructure.git"
  ci.nudgebee.com/helm.values.filePath: "production/api-server.yaml"
  ci.nudgebee.com/git.branch: "main"
```

**Staging API:**
```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/k8s-infrastructure.git"
  ci.nudgebee.com/helm.values.filePath: "staging/api-server.yaml"
  ci.nudgebee.com/git.branch: "staging"
```

### Pattern 3: Helm Chart Repository

```
helm-charts/
├── charts/
│   ├── api-server/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-prod.yaml
│   │   └── templates/
│   └── worker/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
```

```yaml
annotations:
  ci.nudgebee.com/git.repo: "https://github.com/org/helm-charts.git"
  ci.nudgebee.com/helm.values.filePath: "charts/api-server/values-prod.yaml"
```

---

## Automating Annotations in CI/CD

### GitHub Actions

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Add NudgeBee annotations
        run: |
          # Add git hash annotation
          sed -i "s|ci.nudgebee.com/git.hash:.*|ci.nudgebee.com/git.hash: \"$GITHUB_SHA\"|g" \
            k8s/deployment.yaml

      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/deployment.yaml
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    # Update git hash annotation
    - sed -i "s|ci.nudgebee.com/git.hash:.*|ci.nudgebee.com/git.hash: \"$CI_COMMIT_SHA\"|g"
        k8s/deployment.yaml
    - kubectl apply -f k8s/deployment.yaml
  only:
    - main
```

### ArgoCD

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - deployment.yaml

# Add git hash from ArgoCD environment
patches:
  - patch: |-
      - op: add
        path: /metadata/annotations/ci.nudgebee.com~1git.hash
        value: ${ARGOCD_APP_REVISION}
    target:
      kind: Deployment
```

### Helm Install

```bash
# Set git hash during helm install
helm install myapp ./chart \
  --set annotations.nudgebee.gitHash=$(git rev-parse HEAD) \
  --set annotations.nudgebee.gitRepo="https://github.com/org/repo.git"
```

---

## Troubleshooting

### Issue: "Apply via GitHub" Option Not Available

**Cause**: Missing required annotations

**Solution**: Verify annotations are present
```bash
kubectl get deployment myapp -o jsonpath='{.metadata.annotations}' | jq
```

Ensure you have:
- `ci.nudgebee.com/git.repo`
- `ci.nudgebee.com/helm.values.filePath`

### Issue: PR Not Created

**Possible Causes:**
1. **GitHub Integration Not Configured**
   - Check: NudgeBee UI → Integrations → GitHub → Status should be "Connected"

2. **Incorrect Repository URL**
   - Must use HTTPS format: `https://github.com/org/repo.git`
   - Must end with `.git`

3. **Invalid File Path**
   - Verify the file exists in your repository
   - Path is relative to repository root

4. **Insufficient Permissions**
   - Personal Access Token needs `repo` scope
   - GitHub App needs write access to repository

### Issue: Wrong File Modified

**Cause**: Incorrect file path

**Solution**: Double-check the `helm.values.filePath` annotation
```bash
# Verify file exists in your repo
git clone https://github.com/org/repo.git temp
ls -la temp/path/to/values-prod.yaml
```

### Issue: Values Not Updated in PR

**Cause**: Non-standard Helm structure

**Solution**: Add JSON path annotations for your custom structure
```yaml
annotations:
  ci.nudgebee.com/helm.values.cpuRequestJsonPath: "your.custom.path.cpuRequest"
```

### Issue: Annotations Disappear After Deployment

**Cause**: Annotations not in source manifests

**Solution**: Update the source files, not live resources
```bash
# ❌ Wrong - changes lost on next deployment
kubectl annotate deployment myapp ci.nudgebee.com/git.repo="..."

# ✅ Correct - update source YAML
# Edit deployment.yaml, then:
kubectl apply -f deployment.yaml
```

---

## Best Practices

### 1. Always Include Git Hash

Enables accurate version tracking:
```yaml
ci.nudgebee.com/git.hash: "{{ .Values.git.commitSHA }}"
```

### 2. Use Environment-Specific Values Files

```yaml
# prod/deployment.yaml
ci.nudgebee.com/helm.values.filePath: "charts/app/values-prod.yaml"

# staging/deployment.yaml
ci.nudgebee.com/helm.values.filePath: "charts/app/values-staging.yaml"
```

### 3. Use HTTPS Repository URLs

```yaml
# ✅ Correct
ci.nudgebee.com/git.repo: "https://github.com/org/repo.git"

# ❌ Wrong - SSH not supported
ci.nudgebee.com/git.repo: "git@github.com:org/repo.git"
```

### 4. Template Annotations in Helm Charts

```yaml
# templates/deployment.yaml
metadata:
  annotations:
    ci.nudgebee.com/git.repo: {{ .Values.nudgebee.gitRepo | quote }}
    ci.nudgebee.com/helm.values.filePath: {{ .Values.nudgebee.valuesFile | quote }}
    {{- if .Values.nudgebee.gitHash }}
    ci.nudgebee.com/git.hash: {{ .Values.nudgebee.gitHash | quote }}
    {{- end }}
```

---

## Security

### Authentication Options

**Personal Access Token:**
- Rotate every 90 days
- Use fine-grained tokens when possible
- Limit to specific repositories

**GitHub App (Recommended):**
- More secure than PATs
- Automatic token rotation
- Granular permissions per repository
- Better audit logging

### Repository Access

Configure branch protection:
- Require pull request reviews
- Require status checks to pass
- Restrict who can merge

### Secrets Management

- Never commit tokens to repositories
- Store tokens in NudgeBee UI only
- Use different tokens for prod vs dev environments

---

## FAQ

**Q: Do I need both `workloads.nudgebee.com/` and `ci.nudgebee.com/` annotations?**

A: No. Use `ci.nudgebee.com/` for automated PRs (required). Add `workloads.nudgebee.com/` only if you want code analysis for error investigations.

**Q: Can NudgeBee work with private repositories?**

A: Yes, as long as you've configured credentials with access to the private repository.

**Q: What if I use plain Kubernetes YAML instead of Helm?**

A: NudgeBee currently focuses on Helm-based deployments. Contact support for other deployment methods.

**Q: Can I prevent NudgeBee from creating PRs for certain workloads?**

A: Yes, simply don't add the `ci.nudgebee.com/` annotations to those workloads.

**Q: What branch does NudgeBee target for PRs?**

A: The branch specified in `ci.nudgebee.com/git.branch` (defaults to `main`).

**Q: Can I customize the PR description?**

A: NudgeBee follows your repository's PR template if one exists at `.github/pull_request_template.md`.

**Q: Does NudgeBee support GitHub Enterprise?**

A: Yes. Configure the Enterprise URL in NudgeBee UI → Integrations → GitHub → GitHub Enterprise URL.

---

## What Happens When NudgeBee Creates a PR

1. **Monitors Usage**: Collects 7-14 days of resource usage data
2. **Generates Recommendation**: Analyzes patterns and creates optimization proposal
3. **Clones Repository**: Uses credentials to clone your infrastructure repo
4. **Updates Values**: Modifies resource requests/limits in your Helm values file
5. **Creates Branch**: Creates a new branch with naming pattern `fix/rightsizing-{workload}-{timestamp}`
6. **Commits Changes**: Commits with detailed message including before/after values
7. **Opens PR**: Creates pull request with:
   - Summary of changes
   - Before/after comparison table
   - Cost savings estimate
   - Link to full recommendation in NudgeBee UI
8. **Awaits Review**: PR requires review and approval based on your branch protection rules

---

## Support

- **Documentation**: https://docs.nudgebee.com
- **Email**: support@nudgebee.com
- **Community**: https://community.nudgebee.com

## Related Documentation

- Kubernetes Monitoring Setup
- Rightsizing Recommendations
- Cost Optimization Guide
