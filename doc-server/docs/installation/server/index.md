---
sidebar_position: 1
sidebar_label: Server
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Server Installation

The NudgeBee Server is the central control plane of the NudgeBee platform. It hosts the web UI, Semantic Knowledge Graph, AI agent orchestrator, and workflow execution engine. It receives data from NudgeBee Agents across your clusters and integrates with identity providers and observability tools.

:::note[Self-Hosted Only]
**Cloud SaaS users**: You do not need to install the server. It is fully managed for you at [app.nudgebee.com](https://app.nudgebee.com). Skip directly to [Agent Installation](../agent/installation/index.md).

**Infrastructure Scope**: The self-hosted NudgeBee Server requires its own Kubernetes cluster (or dedicated namespace) on Kubernetes v1.27+. If you do not operate Kubernetes infrastructure, use Cloud SaaS.
:::

:::tip[Choosing an edition]
The self-hosted server comes in two editions (see [Editions & Capabilities](../../editions.md) for the full comparison):

- **Community** <Community/> — free, source-available self-hosted edition. The Server is licensed under **BSL 1.1** (converting to Apache 2.0 on its stated change date); Agents are **Apache 2.0**. Images are pulled from the public `ghcr.io/nudgebee` registry. **No license key required.** OAuth SSO (Google, Okta, OneLogin, Azure AD / B2C, Auth0), magic-link email, and credentials login are all included.
- **Enterprise** <Enterprise/> — adds **SAML 2.0** SSO, NudgeBee's managed models (`nb-llm`, `nb-slm`), and commercial SLA support. Images are pulled from `registry.nudgebee.com` and require a license key.

The installation steps below use tabs — pick your edition in each step.
:::

## Architecture

```mermaid
flowchart TB
    classDef browser fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f,rx:8,ry:8;
    classDef app fill:#bae6fd,stroke:#0284c7,stroke-width:2px,color:#0369a1,rx:8,ry:8;
    classDef backend fill:#bbf7d0,stroke:#16a34a,stroke-width:2px,color:#14532d,rx:8,ry:8;
    classDef datastore fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#1e293b,rx:8,ry:8;
    classDef collector fill:#ddd6fe,stroke:#7c3aed,stroke-width:2px,color:#4c1d95,rx:8,ry:8;
    classDef agent fill:#fecdd3,stroke:#e11d48,stroke-dasharray: 5 5,stroke-width:2px,color:#881337,rx:8,ry:8;

    BROWSER["<b>Browser</b>"]:::browser
    APP["<b>app</b><br/><small>Next.js UI + auth boundary</small>"]:::app

    subgraph SERVICES["Microservices (Internal RPC with tenant + user context stamped on every call)"]
        direction TB
        SERVICES_SERVER["<b>services-server</b><br/><small>Go core backend</small>"]:::backend
        LLM_SERVER["<b>llm-server</b><br/><small>agents + tools</small>"]:::backend
        WORKFLOW_SERVER["<b>workflow-server</b><br/><small>runbooks + automations</small>"]:::backend
        NOTIFICATIONS["<b>notifications</b><br/><small>Slack / Teams / email</small>"]:::backend
        TICKET_SERVER["<b>ticket-server</b><br/><small>Jira / PagerDuty ...</small>"]:::backend
    end

    subgraph STORAGE["Storage & Caching Layer (Shared by ALL services)"]
        POSTGRES["<b>Postgres</b><br/><small>state + audit</small>"]:::datastore
        REDIS["<b>Redis</b><br/><small>cache</small>"]:::datastore
    end

    subgraph INFRA["Messaging, Vector & Durable Execution"]
        RABBITMQ["<b>RabbitMQ</b><br/><small>events</small>"]:::datastore
        QDRANT["<b>Qdrant</b><br/><small>RAG vectors</small>"]:::datastore
        TEMPORAL["<b>Temporal</b><br/><small>durable workflows</small>"]:::datastore
    end

    subgraph COLLECTORS["Collectors & Ingress Hub"]
        K8S_COLLECTOR["<b>k8s-collector</b><br/><small>cluster state + metrics</small>"]:::collector
        CLOUD_COLLECTOR["<b>cloud-collector</b><br/><small>AWS / Azure / GCP scans</small>"]:::collector
        RELAY_SERVER["<b>relay-server</b><br/><small>websocket hub</small>"]:::collector
    end

    AGENT["<b>nudgebee-agent (in YOUR cluster)</b><br/><small>kubectl • Prometheus • Logs & Traces</small>"]:::agent

    BROWSER --> APP
    APP --> SERVICES_SERVER
    APP --> LLM_SERVER
    APP --> WORKFLOW_SERVER
    APP --> NOTIFICATIONS
    APP --> TICKET_SERVER

    SERVICES_SERVER -.-> STORAGE
    LLM_SERVER -.-> STORAGE
    WORKFLOW_SERVER -.-> STORAGE
    NOTIFICATIONS -.-> STORAGE
    TICKET_SERVER -.-> STORAGE

    LLM_SERVER -->|vector search| QDRANT
    WORKFLOW_SERVER -->|durable execution| TEMPORAL

    K8S_COLLECTOR -->|signals| RABBITMQ
    CLOUD_COLLECTOR -->|signals| RABBITMQ
    RELAY_SERVER -->|signals| RABBITMQ
    RABBITMQ --> SERVICES_SERVER

    K8S_COLLECTOR -.-> STORAGE
    CLOUD_COLLECTOR -.-> STORAGE
    RELAY_SERVER -.-> STORAGE

    AGENT -.->|"outbound only (WSS :443)"| RELAY_SERVER
```

:::tip
**Estimated time**: 15–30 minutes, depending on your cluster and infrastructure setup.
:::

### Watch the Walkthrough

<div style={{position: "relative", paddingBottom: "64.86%", height: 0}}><iframe src="https://www.loom.com/embed/dee1ca6f7d294ef2b7f2746243e67e41?sid=256e5a97-215e-46fa-974e-69b329096273" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## 1. Before You Begin

### Components & Why They Exist

The NudgeBee server relies on core backend services. You can run them bundled inside the Helm chart (simplest for quick starts) or point NudgeBee to your own externally-managed instances (recommended for high availability and production compliance).

| Component | Required? | What It Does & Why It's Needed | Bring Your Own (BYO)? |
|---|---|---|---|
| **PostgreSQL** | **Required** | Primary datastore — stores cluster workloads, workflow states, alert rules, user metadata, and configuration. **Queries and backend services fail immediately without it.** | **Yes** (e.g. AWS RDS, Azure Database for PG, Cloud SQL) |
| **RabbitMQ** | **Required** | Message bus connecting internal backend workers. **The backend will not bootstrap its event and triage consumers without it.** | **Yes** (e.g. Amazon MQ or self-managed cluster) |
| **Redis** | **Optional** | Caching layer for session state and fast query caching. **Falls back to in-memory cache if omitted** (fine for trials, Redis recommended for production). | **Yes** (e.g. AWS ElastiCache, Azure Redis) |
| **Qdrant** | **Conditional** | Vector database for Semantic Knowledge Graph embeddings and RAG retrieval. Needed when AI troubleshooting is enabled. | **Yes** (Bundled subchart or external Qdrant) |
| **Temporal** | **Required** (on by default) | Durable execution engine for automations and Auto Optimize. `workflow-server` doesn't start without it. It stores its data in PostgreSQL (`temporal` and `temporal_visibility` databases). | **Yes** (Bundled subchart or external Temporal cluster) |

:::important Hard Dependencies
**PostgreSQL and RabbitMQ are mandatory hard dependencies** — the server will not start without them. By default, the Helm chart deploys bundled instances of both.
:::

### System & Sizing Requirements

| Requirement | Details |
|---|---|
| **Kubernetes Cluster** | v1.27 or newer |
| **Compute & Memory** | Depends on the sizing tier — see [Sizing tiers](#sizing-tiers). A default install is the **Small** tier: plan for **4 CPU / 16 GiB** of schedulable capacity |
| **Persistent Storage** | A default StorageClass (or set `global.storageClass`). Default volumes: PostgreSQL 50 Gi, Qdrant 50 Gi, plus RabbitMQ and Redis |
| **Helm** | v3.x installed and configured ([Install Helm](https://helm.sh/)) |
| **Registry Access** | `ghcr.io/nudgebee` (both editions) and, for Enterprise, also `registry.nudgebee.com` — see [Network Requirements](#network-requirements--decision-rationale) |
| **NudgeBee License Key** | Enterprise only. Community edition does not require a key |

### Sizing tiers {#sizing-tiers}

The chart ships three sizing tiers. A plain install is **Small**. Size from what the pods **request** (what the scheduler needs to place them), including the bundled database:

| Tier | For estates up to | Memory requested | CPU requested | Plan for |
|---|---|---|---|---|
| **Small** (default) | ~5 clusters / 250 nodes / 10,000 pods / 25 cloud accounts | 13.0 GiB | 2.5 cores | **4 CPU / 16 GiB** |
| **Medium** | ~25 clusters / 900 nodes / 100,000 pods / 550 cloud accounts | 24.7 GiB | 6.1 cores | **8 CPU / 32 GiB** |
| **Large** | ~80 clusters / 2,000 nodes / 300,000 pods / 500 cloud accounts | 46.5 GiB | 10.3 cores | **12 CPU / 56 GiB** |

Medium and Large are values files inside the chart (`values-medium.yaml`, `values-large.yaml`). Pull the chart to get them, then pass the file to `helm upgrade`:

```shell
helm pull $NUDGEBEE_CHART --version <chart-version> --untar   # creates ./nudgebee/ with values-medium.yaml and values-large.yaml
helm upgrade nudgebee $NUDGEBEE_CHART -f nudgebee/values-medium.yaml -f values.yaml --install --namespace nudgebee
```

Put your own `values.yaml` last so it wins. Beyond the Large tier, run a load test before committing to a size.

### Preflight Cluster Validation

Before deploying, run this quick check in your terminal to verify your cluster meets the version, capacity, and storage requirements:

```bash
# 1. Verify kubectl context and Kubernetes server version (v1.27+)
kubectl config current-context
kubectl version --short 2>/dev/null || kubectl version

# 2. Verify Helm version (v3.10+)
helm version --short

# 3. Check allocatable CPU and memory across your nodes
kubectl get nodes -o custom-columns=NAME:.metadata.name,STATUS:.status.conditions[-1].type,ALLOCATABLE_CPU:.status.allocatable.cpu,ALLOCATABLE_MEM:.status.allocatable.memory

# 4. Verify default StorageClass exists for persistent volumes
kubectl get storageclass
```

### Network Requirements & Decision Rationale

Your cluster needs the following network access. Understanding why each rule exists helps you configure firewalls with least privilege:

- **Outbound to Container Registries** (port 443): **Required during install/upgrade** to pull container images. *What breaks if blocked:* Pods get stuck in `ImagePullBackOff`.
  - **Community:** `ghcr.io/nudgebee`.
  - **Enterprise:** `registry.nudgebee.com` for NudgeBee's own images **and** `ghcr.io/nudgebee` for the infrastructure images (PostgreSQL, Redis, RabbitMQ, Qdrant, Temporal, init images and the security-scanner images).
  - **Air-gapped:** mirror all of them. `global.image.registry` only covers NudgeBee's own images; the others have their own values — see [Mirroring images](./helm_values.md#mirroring-images-air-gapped).
- **Internal Cluster DNS Resolution**: **Required for internal service communication**. The server pods must be able to resolve `BASE_URL` and internal service endpoints. *What breaks if blocked:* Auth callback loops and service-to-service communication failures.
- **Outbound to Integrations** (Slack, Jira, Teams, GitHub, OpenAI / Cloud APIs on port 443): **Required only for enabled integrations**. *What breaks if blocked:* Alert notifications, auto-PRs, or AI analysis queries will fail to dispatch.
- **Inbound Access** (Port 80/443 via Ingress or port-forward): **Required for user web UI access, webhook triggers, and agent telemetry reception**.

:::tip Start Simple with Port-Forwarding
**Why skip Ingress initially?** For local evaluation, testing, or sandboxes, you can run NudgeBee entirely with `kubectl port-forward` without provisioning DNS records, public IPs, or SSL certificates. Add Ingress when transitioning to team use.
:::

---

## 2. Install NudgeBee

The installation follows three steps: select your edition, configure `values.yaml`, and run `helm upgrade --install`.

### Step 1: Select Your Edition & Registry Login

:::caution[Protecting Your License & Auth Credentials]
**Keep your license / auth key secret.** This key authenticates your cluster to the NudgeBee registry and allows agents to report into your control plane. Treat it like a root password:
- Store it in a secret manager (AWS Secrets Manager, Vault) or a Kubernetes Secret.
- Never commit it to version control or paste it in shared channels.
- Avoid passing it as an inline CLI flag to prevent it from saving in your shell history (e.g. use `read -s NUDGEBEE_LICENSE_KEY` or environment files).
:::

<Tabs groupId="edition">
<TabItem value="community" label="Community (free)">

Community images are public on `ghcr.io/nudgebee` — **no registry login is required.** Just set the chart location used by the commands below:

```shell
export NUDGEBEE_CHART=oci://ghcr.io/nudgebee/charts/nudgebee
```

</TabItem>
<TabItem value="enterprise" label="Enterprise">

Log in to the NudgeBee Helm registry with your license key, then set the chart location:

```shell
# Prompt for key securely to avoid saving to shell history
read -s -p "Enter NudgeBee License Key: " NUDGEBEE_LICENSE_KEY
echo

helm registry login registry.nudgebee.com --username nudgebee --password "$NUDGEBEE_LICENSE_KEY"
export NUDGEBEE_CHART=oci://registry.nudgebee.com/nudgebee
```

</TabItem>
</Tabs>

### Step 2: Create Your `values.yaml`

Create a file called `values.yaml` with the minimum required configuration. This gets NudgeBee running with port-forwarding — the simplest setup that works.

<Tabs groupId="edition">
<TabItem value="community" label="Community (free)">

```yaml
global:
  image:
    registry: "ghcr.io/nudgebee"

# REQUIRED on a fresh Community install. The first admin and their organization
# are created during install from this address, so the deployment is complete
# when `helm install` returns. The install fails fast if it is missing.
admin:
  email: "you@example.com"

nudgebee_secret:
  BASE_URL: "http://localhost:3000"
  # 32-byte hex — generate once with `openssl rand -hex 32` and store in your
  # secret manager. Rotating after data is written makes previously-encrypted
  # DB rows unreadable, so treat it like a database master password.
  NUDGEBEE_ENCRYPTION_KEY: "<your-32-byte-hex-key>"

# The agent is installed alongside the server by default and connects the
# cluster hosting it. Name it here; set `enabled: false` to opt out.
agent:
  enabled: true
  clusterName: "nb-control-plane-k8s"

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

Generate `NUDGEBEE_ENCRYPTION_KEY` with:

```shell
openssl rand -hex 32
```

</TabItem>
<TabItem value="enterprise" label="Enterprise">

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
  NUDGEBEE_ENCRYPTION_KEY: "<your-32-byte-hex-key>"   # openssl rand -hex 32
  NUDGEBEE_LICENSE: <your-license-key>

# Optional on Enterprise: the license carries its own admin address and takes
# precedence. Set it only if your license does not name one — a conflicting
# value is ignored with a warning in the services-server log.
# admin:
#   email: "you@example.com"

# The agent is installed alongside the server by default and connects the
# cluster hosting it. Name it here; set `enabled: false` to opt out.
agent:
  enabled: true
  clusterName: "nb-control-plane-k8s"

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

Replace `<your-license-key>` with your NudgeBee license key and generate
`NUDGEBEE_ENCRYPTION_KEY` with `openssl rand -hex 32`.

</TabItem>
</Tabs>

#### `admin.email` — who the first admin is {#admin-email}

The server creates the first admin user and their organization **during install**, so the deployment is usable the moment `helm install` returns rather than half-configured until somebody signs in.

| Edition | Is `admin.email` required? | Which address is used |
|---|---|---|
| **Community** <Community/> | **Yes**, on a fresh install — the chart fails with `[ERROR] admin.email is required` | The value you set |
| **Enterprise** <Enterprise/> | No, if `nudgebee_secret.NUDGEBEE_LICENSE` (or `global.existingNudgebeeSecretName`) is set | The address inside the license. A different `admin.email` is ignored and logged as a warning |

Other things worth knowing:

- **Only checked on a fresh install.** An existing deployment already has an admin, so `admin.email` is validated on `helm install` of a new release, not on upgrades.
- **The address is validated.** A malformed address fails the install.
- **Sign in with this address** plus the generated bootstrap password — see [Access the UI](#4-access-the-ui--authenticate).

#### The bundled agent — installed by default {#bundled-agent}

`agent.enabled` defaults to **`true`**: the chart installs the [NudgeBee Agent](../agent/installation/index.md) into the same namespace and registers the cluster hosting the server. The first cluster therefore needs no second install and no copied auth key — the chart generates the agent credential and hands the same value to both sides.

| Value | Default | What it does |
|---|---|---|
| `agent.enabled` | `true` | Install the agent alongside the server and connect this cluster |
| `agent.clusterName` | `nb-control-plane-k8s` | Name this cluster appears under. Must be more than 3 characters, max 40, no special characters; `Demo` is reserved |
| `agent.accessKey` / `agent.accessSecret` | `""` | **GitOps only** — see the Argo CD / Flux caution below |
| `nudgebee-agent.*` | — | Passthrough to the agent subchart; anything the [agent chart](../agent/operate/helm_values.md) accepts can be set here |

The bundled agent runs a deliberately light subset so a first install stays small. The node agent (privileged eBPF DaemonSet), the OpenTelemetry collector, and the agent's ClickHouse are **off**; inventory, events, logs, metrics, and alerts all work. Turn them on explicitly when you want network metrics, the service map, traces, or profiles:

```yaml
nudgebee-agent:
  nodeAgent:
    enabled: true
  opentelemetry-collector:
    enabled: true
  runner:
    clickhouse_enabled: true    # must be on together with the collector above
```

:::caution[Set `agent.enabled: false` if this cluster is already monitored]
If a separately installed agent already reports this cluster, leave the bundled one off — otherwise the same cluster registers a second time under a different name:

```yaml
agent:
  enabled: false
```

This is the common case when **upgrading** an existing self-hosted deployment, where the default flips the behaviour from what you installed with.
:::

:::caution[GitOps (Argo CD, Flux): set `agent.accessKey` and `agent.accessSecret`]
Argo CD renders the chart offline, so it can't read the existing credential back from the cluster — and generated values would be created anew on every sync. Flux runs a real Helm install/upgrade, but setting the values explicitly is still the safe choice. The chart refuses to silently regenerate the credential — a fresh credential paired with the old hash in Postgres would leave the agent unable to authenticate. On an upgrade rendered offline the chart fails unless you supply both explicitly. Read them from the live cluster:

```shell
kubectl get secret nudgebee-bootstrap -n nudgebee \
  -o jsonpath='{.data.LOCAL_AGENT_ACCESS_KEY}' | base64 -d; echo
kubectl get secret nudgebee-bootstrap -n nudgebee \
  -o jsonpath='{.data.LOCAL_AGENT_ACCESS_SECRET}' | base64 -d; echo
```

```yaml
agent:
  accessKey: "<existing LOCAL_AGENT_ACCESS_KEY>"
  accessSecret: "<existing LOCAL_AGENT_ACCESS_SECRET>"
```

Leave both empty for ordinary `helm install` / `helm upgrade` against a reachable cluster.
:::

:::note[The agent shares the Helm release]
`helm uninstall nudgebee` removes the bundled agent too. It also adds two pods (runner and forwarder) to the sizing figures above — and substantially more if you enable the node agent, the OpenTelemetry collector, or the agent's ClickHouse, which brings its own PVC.
:::

### Step 3: Run the Helm Install

```shell
# 1. Set your target Kubernetes context (or omit --kube-context if already using current context):
export KUBE_CONTEXT="$(kubectl config current-context)"

# 2. Deploy NudgeBee Server:
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --create-namespace \
  --wait --timeout 20m \
  --kube-context "$KUBE_CONTEXT"
```

Use a long `--timeout`: Helm's default is 5 minutes, and the database migration only runs after the release's pods are ready.

To install a specific version, add `--version $CHART_VERSION` to the command. See the [Server Releases](../../releases/server/) page for available versions.

For a quick evaluation you can skip the values file entirely and pass the three values that matter on the command line (Community chart shown):

```shell
export NUDGEBEE_ENC_KEY=$(openssl rand -hex 32)   # save this — it cannot be rotated after data is written

helm install nudgebee oci://ghcr.io/nudgebee/charts/nudgebee \
  --namespace nudgebee --create-namespace \
  --set nudgebee_secret.NUDGEBEE_ENCRYPTION_KEY="$NUDGEBEE_ENC_KEY" \
  --set admin.email="you@example.com" \
  --set agent.enabled=true \
  --wait --timeout 20m
```

:::tip
**This minimal setup gets NudgeBee running with port-forwarding.** You can add Ingress, SSL, external Postgres, and other configurations later without reinstalling — just update your `values.yaml` and run `helm upgrade` again.
:::

---

## 3. Verify the Installation (What Success Looks Like)

After the Helm install completes, perform these checks to confirm your server is operating properly:

### 1. Check Pod Status

Run `kubectl get pods` in the `nudgebee` namespace:

```shell
kubectl get pods -n nudgebee
```

**Expected Pod State:**

| Pod Name Pattern | Ready State | Status | Role |
|---|---|---|---|
| `app-*` | `2/2` | `Running` | Main UI and GraphQL/REST API (with its nginx sidecar) |
| `services-server-*` | `1/1` | `Running` | Core backend (also provisions the admin and the bundled agent's account) |
| `k8s-collector-*` | `1/1` | `Running` | Telemetry receiver for agents |
| `relay-server-*` | `1/1` | `Running` | WebSocket agent relay server |
| `postgresql-0` | `2/2` | `Running` | Core database (if bundled), with its metrics sidecar |
| `rabbitmq-0` | `1/1` | `Running` | Event message bus (if bundled) |
| `redis-master-0` | `1/1` | `Running` | Cache (if bundled) |
| `nudgebee-qdrant-server-*` | `1/1` | `Running` | Vector database (if bundled) |
| `temporal-*` | `1/1` | `Running` | Workflow engine (frontend, history, matching, worker) |
| `workflow-server-*`, `llm-server-*`, `rag-server-*`, `ml-server-*`, `notifications-*`, `ticket-server-*`, `cloud-collector-server-*`, `cost-server-*`, `llm-gateway-*` | `1/1` | `Running` | Backend services |
| `postgres-migration-job-*` | `0/1` | `Completed` | Database migration job (runs after install, and before each upgrade) |
| `nudgebee-nudgebee-agent-runner-*` | `1/1` | `Running` | Bundled agent (only when `agent.enabled: true`, the default) |
| `nudgebee-nudgebee-agent-forwarder-*` | `1/1` | `Running` | Bundled agent's event watcher |

All active pods should show all containers ready and `Running`, and jobs should show `Completed`. This typically takes 2–3 minutes after the Helm command finishes.

:::note[Bundled agent pod names]
The agent is a subchart of the server release, so its pods carry the release name twice (`nudgebee-nudgebee-agent-*`). There is no `node-agent` DaemonSet unless you enable it — see [the bundled agent](#bundled-agent).
:::

### 2. Verify HTTP Connectivity

Test that the web application responds on its port:

```shell
# Port-forward the app in the background or in a separate terminal:
kubectl port-forward svc/app 3000:80 -n nudgebee &

# Verify HTTP 200 / login page response:
curl -I http://localhost:3000
```

You should receive an `HTTP/1.1 200 OK` (or `307 Temporary Redirect` to `/auth/signin`).

:::caution Troubleshooting Installation Failures
**If pods are stuck in `Pending`, `CrashLoopBackOff`, or `Error`**, see the [Troubleshooting](#troubleshooting-installation-failures) section below.
:::

---

## 4. Access the UI & Authenticate

### Understanding Authentication by Deployment Mode
- **Cloud SaaS (`app.nudgebee.com`)**: Completely passwordless — users sign in using OAuth SSO (Google, GitHub, Okta, Microsoft) or email magic links. No passwords are stored or generated.
- **Self-Hosted Community & Enterprise**: The admin user and organization are created during install from [`admin.email`](#admin-email) (or the address in your Enterprise license), and a secure bootstrap password is stored in an in-cluster Kubernetes secret so that administrator can sign in, complete setup, and configure SSO.

### Accessing Without Ingress (Port-Forwarding)

Forward the NudgeBee UI to your local machine:

```shell
kubectl port-forward svc/app 3000:80 -n nudgebee
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to view the login screen.

### Retrieving the Bootstrap Admin Credentials

Retrieve the auto-generated bootstrap password from the `nudgebee` secret:

```shell
kubectl get secret nudgebee -n nudgebee \
  -o jsonpath='{.data.NEXTAUTH_DUMMY_CREDS_PASSWORD}' | base64 -d
echo
```

Sign in with the address you set in `admin.email` (or the address carried by your Enterprise license) and the decoded password. That user already exists with its organization, so there is nothing to set up on first login.

:::tip[Nothing was provisioned?]
If the login screen rejects the address, check that the install actually provisioned it:

```shell
kubectl logs -n nudgebee deploy/services-server | grep -iE 'not entitled|does not match the licen'
```

`not entitled to provision an admin` means the deployment has no valid license entitlement (for example the license failed to load). `admin.email does not match the licence` means the license's own address is used instead of `admin.email` — sign in with that one.
:::

:::caution Production Security
**The bootstrap credentials provider is intended for initial onboarding and evaluation only.** For production, configure an enterprise identity provider (SAML 2.0 or OAuth SSO) and disable dummy credentials. See [Authentication Integrations](../../integrations/Authentication/) for details.
:::

---

## 5. Verify Control Plane Health & Next Steps

Once logged into the dashboard, complete your initial control plane verification:

1. **Verify UI & Dashboard Navigation**: Navigate through **Kubernetes**, **Troubleshoot**, and **Optimizations** to confirm all views load without errors.
2. **Confirm the Cluster Hosting the Server Is Connected**: With the bundled agent enabled (the default), **Kubernetes** already lists this cluster under `agent.clusterName` (`nb-control-plane-k8s` unless you changed it). If it does not appear:

   ```shell
   kubectl logs -n nudgebee deploy/services-server | grep -iE 'first run|local agent'
   ```

   `no tenant yet, deferring registration to first login` means the agent registers as soon as the first admin exists. A cluster-name error (too short, reserved, or invalid characters) is reported here too — fix `agent.clusterName` and re-run `helm upgrade`.
3. **Connect an LLM Provider (BYOM)**: Navigate to **Admin → Integrations → LLM** and configure your API key ([OpenAI, AWS Bedrock, or Ollama](../../integrations/LLM/)) to enable NuBi AI investigations and automated RCA.
4. **Next Step: Install the Agent on Your Other Clusters**: The cluster running the server is already covered. Every **additional** cluster you want monitored needs its own agent install:

👉 **[Install the NudgeBee Agent on Your Cluster](../agent/installation/index.md)**

---

## 6. Add Ingress and SSL (Recommended for Production)

The minimal installation above works with port-forwarding, but for production use you should expose NudgeBee via Ingress with SSL. This enables:

- Public URL access for your team (no need to run `kubectl port-forward`)
- Slack and Google Chat app integrations (they need to reach your server)
- Webhook triggers for the Workflow Builder
- Magic link email authentication

### Understanding the Three Endpoints

NudgeBee exposes three services that each need their own Ingress entry:

| Service | Purpose | Example domain |
|---|---|---|
| **App** | The web UI and API | `nudgebee.yourcompany.com` |
| **Collector** | Receives data from agents running in your monitored clusters | `collector.yourcompany.com` |
| **Relay** | WebSocket connection for real-time agent communication | `relay.yourcompany.com` |

:::info
**Relay and Collector URLs for Agent Installation**: When you install agents with Ingress enabled, use:
- **Relay Server URL**: `wss://relay.yourcompany.com/register`
- **Collector Server URL**: `https://collector.yourcompany.com`
:::

:::caution[Tell the UI your public relay and collector URLs]
The install command the UI generates for **other** clusters uses `RELAY_WSSERVER_ENDPOINT` and `K8S_COLLECTOR_ENDPOINT`. By default these are in-cluster addresses (`ws://relay-server.<namespace>.svc:8080/register` and `http://k8s-collector.<namespace>.svc:80`), which agents in other clusters can't reach. Set them to your public hosts:

```yaml
nudgebee_secret:
  RELAY_WSSERVER_ENDPOINT: "wss://relay.yourcompany.com/register"
  K8S_COLLECTOR_ENDPOINT: "https://collector.yourcompany.com"
```
:::

:::note[Prerequisites for this sample]
The sample uses NGINX Ingress and cert-manager. Install an ingress controller and cert-manager first, and create an Issuer named `cert-letsencrypt-issuer` (the collector and relay charts reference it by default) — or change the annotations to match your setup.
:::

### Sample Ingress Values File (with SSL)

The following `values.yaml` uses cert-manager for SSL. Adjust the annotations and TLS settings based on your cluster's ingress controller and certificate management setup.

Replace all `<placeholder>` values with your actual domains (and, for Enterprise, your license key).

:::note[Community edition]
The example below is for the Enterprise registry. For the **Community** edition, set `global.image.registry: "ghcr.io/nudgebee"` and remove the `imagePullSecrets`, `nudgebee_registry_secret`, and `NUDGEBEE_LICENSE` lines.
:::

```yaml
global:
  image:
    registry: "registry.nudgebee.com"
  imagePullSecrets:
    - name: nudgebee-registry-secret

nudgebee_registry_secret:
  enabled: true

nudgebee_secret:
  BASE_URL: "<NudgeBee Server Https Url>"       # e.g., https://nudgebee.yourcompany.com
  NUDGEBEE_LICENSE: <your-license-key>
  NUDGEBEE_ENCRYPTION_KEY: "<your-32-byte-hex-key>"
  RELAY_WSSERVER_ENDPOINT: "wss://<NudgeBee relay Base Domain>/register"
  K8S_COLLECTOR_ENDPOINT: "https://<NudgeBee collector Base Domain>"
  # Bootstrap admin login. Turn it off once SSO is configured.
  NEXTAUTH_DUMMY_CREDS_ENABLED: true

app:
  ingress:
    enabled: true
    hosts:
      - host: "<NudgeBee Base Domain>"           # e.g., nudgebee.yourcompany.com
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
      - host: "<NudgeBee collector Base Domain>"  # e.g., collector.yourcompany.com
        paths:
          - path: /
            pathType: ImplementationSpecific
    tls:
      - secretName: nudgebee-collector-tls
        hosts:
        - "<NudgeBee collector Base Domain>"
    annotations:
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
      nginx.ingress.kubernetes.io/proxy-body-size: "50m"
relay-server:
  ingress:
    enabled: true
    hosts:
      - host: "<NudgeBee relay Base Domain>"      # e.g., relay.yourcompany.com
        paths:
          # Only expose the routes agents use; other relay routes are internal.
          - path: /register
            pathType: Prefix
          - path: /status
            pathType: Prefix
    tls:
      - secretName: nudgebee-relay-tls
        hosts:
        - "<NudgeBee relay Base Domain>"
    annotations:
      cert-manager.io/issuer: cert-letsencrypt-issuer
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
```

After updating your `values.yaml`, apply the changes:

```shell
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --wait --timeout 20m \
  --kube-context $KUBE_CONTEXT
```

---

## 7. Advanced Configuration

These options are for teams that need to customize the installation for production requirements. You can skip this section for your initial setup and come back later.

### Managing Secrets Externally

If your organization manages Kubernetes secrets through an external tool (Vault, Sealed Secrets, etc.), you can reference pre-existing secrets instead of putting values directly in the Helm chart.

* **Your own NudgeBee secret** — every service and the migration job load their settings from one Kubernetes Secret (named `nudgebee` by default). To manage it yourself:

  ```yaml
  global:
    existingNudgebeeSecretName: 'nudgebee-v2'   # services and the migration job read this Secret
  nudgebee_secret:
    existingSecretName: 'nudgebee-v2'           # stops the chart rendering its own `nudgebee` Secret
  ```

  Set **both**. With only the first, the chart still renders its own Secret (and still requires `NUDGEBEE_ENCRYPTION_KEY`). Your Secret must contain **every** key the chart would otherwise write — not just the license and `BASE_URL`, but also `APP_DATABASE_URL`, `NUDGEBEE_ENCRYPTION_KEY`, the RabbitMQ and Redis settings, `NEXTAUTH_SECRET`, `ACTION_API_SERVER_TOKEN`, `WORKFLOW_SERVER_TOKEN` and the service URLs. The easiest way to get a complete list is to render the chart once and copy the generated Secret:

  ```shell
  helm template nudgebee $NUDGEBEE_CHART -f values.yaml --show-only templates/secrets-nudgebee.yaml
  ```

* **`nudgebee_registry_secret.existingSecretName`** — Reference a pre-created secret for registry credentials.
* **`postgresql.auth.existingSecret`** — Inject an existing secret containing the Postgres password.
* **`clickhouse.auth.existingSecret`** — Same usage for ClickHouse.
* **`rabbitmq.auth.existingPasswordSecret`**, **`existingErlangSecret`** — Same usage for RabbitMQ.

### Externalizing Dependencies (Bring-Your-Own Databases)

While bundled subcharts are convenient for proofs-of-concept, **running externally managed databases is strongly recommended for production**:

- **High Availability & Failover**: Managed databases (e.g. AWS Aurora PostgreSQL, Azure Database for PostgreSQL, Google Cloud SQL) provide multi-AZ failover and automated maintenance.
- **Backups & Point-in-Time Recovery**: Leverage cloud-native automated snapshots, retention policies, and disaster recovery without managing Kubernetes persistent volumes.
- **Decoupled Lifecycle**: Upgrade and scale your datastores independently of NudgeBee Helm chart upgrades.

To use an external PostgreSQL database, disable the bundled chart, supply your connection string, **and point Temporal at the same server** — Temporal keeps its own `temporal` and `temporal_visibility` databases there:

```yaml
postgresql:
  enabled: false

nudgebee_secret:
  # Include the port explicitly.
  APP_DATABASE_URL: "postgresql://<USER>:<PASSWORD>@<DB_HOST>:5432/<DB_NAME>?sslmode=require"
  TEMPORAL_DB_PASSWORD: "<PASSWORD>"      # used by Temporal (Secret `nudgebee-temporal`)

temporal:
  server:
    config:
      persistence:
        datastores:
          default:
            sql:
              connectAddr: "<DB_HOST>:5432"
              user: "<USER>"
          visibility:
            sql:
              connectAddr: "<DB_HOST>:5432"
              user: "<USER>"
```

If your server needs TLS, add the matching TLS settings to both Temporal datastores as well. Without the Temporal settings, Temporal keeps trying the bundled `postgresql:5432` and `workflow-server` doesn't start.

For external **RabbitMQ** set `rabbitmq.enabled: false` and `RABBIT_MQ_HOST`, `RABBIT_MQ_PORT`, `RABBIT_MQ_USERNAME` and `RABBIT_MQ_PASSWORD` under `nudgebee_secret`. For external **Redis** set `redis.enabled: false`, `CACHE_PROVIDER: "redis"` and `REDIS_SERVER_HOST`, `REDIS_SERVER_PORT`, `REDIS_USER_NAME` and `REDIS_USER_PASSWORD`. Without `CACHE_PROVIDER`, the services use an in-memory cache and ignore the Redis settings.

### Change the default passwords

The bundled PostgreSQL, RabbitMQ, Redis and Temporal all default to the password `password`. Change them on a fresh install with `POSTGRES_PASSWORD`, `RABBIT_MQ_PASSWORD`, `REDIS_USER_PASSWORD` and `TEMPORAL_DB_PASSWORD` under `nudgebee_secret`. If you change the PostgreSQL password, update `APP_DATABASE_URL` and `TEMPORAL_DB_PASSWORD` to match.

### Allowed `nudgebee_secret` keys

The chart only accepts known keys under `nudgebee_secret` — a misspelled or unknown key fails the install with `[ERROR] Unknown key '…' found in nudgebee_secret`. To pass any other environment variable to the services, use `additional_env_vars`:

```yaml
additional_env_vars:
  MY_SETTING: "value"
```

See [Configuration Options](./secret_configs.md) for the supported keys.

### Additional Configuration References

- **[All Configuration Options](./secret_configs.md)** — Detailed reference for all environment variables and secrets.
- **[Full Helm Values Reference](./helm_values.md)** — Complete list of every configurable value in the Helm chart.

---

## 8. Troubleshooting Installation Failures {#troubleshooting-installation-failures}

Use this diagnostic playbook if your Helm deployment encounters errors or pods fail to transition into a `Running` state.

---

### Diagnostic Quick Reference

| Error Symptom | Probable Cause | Diagnostic Command & Fix |
|---|---|---|
| **`[ERROR] admin.email is required`** (install refuses to render) | Fresh install with no admin address and no license | Set `admin.email` in `values.yaml` or `--set admin.email=you@example.com`. Enterprise installs can set `nudgebee_secret.NUDGEBEE_LICENSE` instead. See [`admin.email`](#admin-email) |
| **`admin.email is not a valid address`** | Typo in the address | Fix the address. It is validated because the organization is created from it at install time |
| **`The bundled agent's credential could not be found and will not be regenerated`** | Upgrade rendered offline (Argo CD / Flux), where `lookup` cannot read the existing Secret | Set `agent.accessKey` and `agent.accessSecret` from the live `nudgebee-bootstrap` Secret, or `agent.enabled=false`. See [the bundled agent](#bundled-agent) |
| **Same cluster appears twice after an upgrade** | `agent.enabled` defaults to `true`, and this cluster already had a standalone agent | Set `agent.enabled: false`, then delete the duplicate account under **Admin → Integrations → Kubernetes Clusters** |
| **Migration Job failed** | Database not ready, a held lock, or a migration error | Check logs: `kubectl logs job/postgres-migration-job -n nudgebee`<br/>Fix: see [Migration job](#1-migration-job-timeout-or-crashloop) |
| **`[ERROR] Unknown key '…' found in nudgebee_secret`** | A key the chart doesn't accept | Fix the name, or move it to `additional_env_vars` — see [Allowed keys](#allowed-nudgebee_secret-keys) |
| **`[ERROR] NUDGEBEE_ENCRYPTION_KEY is required`** | The key is empty or still `__REPLACE__` | Fresh install: `openssl rand -hex 32`. Upgrading from the old default: see [Upgrade](./upgrade.md#encryption-key) |
| **`error pinging postgres: lookup postgres`** | Incorrect DB hostname or bundled vs external mismatch | Check `nudgebee_secret.APP_DATABASE_URL`<br/>Bundled: `postgresql:5432`<br/>External: Verify RDS / Cloud SQL endpoint |
| **RabbitMQ connection refused / CrashLoop** | RabbitMQ broker not ready or bad AMQP credentials | Check: `kubectl logs statefulset/rabbitmq -n nudgebee`<br/>Verify `RABBIT_MQ_HOST: "rabbitmq"` and port `5672` |
| **Enterprise features or the bootstrap login are missing** | The license failed to load (invalid, or already expired at startup). The server then runs without Enterprise entitlements: the bootstrap login and first-run admin creation stay off until a valid license is loaded | `kubectl logs -n nudgebee deploy/services-server \| grep -i license` — look for `license: load failed` |
| **502 Bad Gateway / WebSocket Disconnects** | Ingress missing WebSocket upgrade or timeout annotations | Add `nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"` to Ingress manifest |
| **Pod Exit Code 137 (`OOMKilled`)** | Node under memory pressure or insufficient pod limit | Check: `kubectl describe pod <name> -n nudgebee`<br/>Fix: Increase RAM request/limit in `values.yaml` |

---

### Failure Scenarios & Step-by-Step Fixes

#### 1. Migration Job Timeout or CrashLoop
The schema migration runs as the Job `postgres-migration-job` — **after** a fresh install, and **before** every upgrade. It runs once (`backoffLimit: 0`): if it fails, an upgrade is aborted and the previous version keeps running.

**Diagnose:**
```shell
kubectl logs job/postgres-migration-job -n nudgebee
```

**Resolution:**
- **Database not ready** (fresh install): ensure PostgreSQL is `Running`, then re-run the Helm upgrade below.
- **Lock timeout**: a running service held a conflicting lock. Re-run when traffic is quiet.
- **`checksum mismatch` or a dirty state**: a migration file or the tracking table doesn't match. Don't edit migration files; contact NudgeBee support.

Re-run with a long timeout:
```shell
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --wait \
  --timeout 20m
```

#### 2. Database Connection or DNS Lookup Failure
If backend pods (`services-server`, `relay-server`) crash on startup with errors like:
```text
error pinging postgres: dial tcp: lookup postgres: no such host
```

**Resolution:**
- **If using Bundled PostgreSQL (`postgresql.enabled: true`)**: Ensure `APP_DATABASE_URL` references the in-cluster Kubernetes DNS name:
  `postgresql://postgres:<PASSWORD>@postgresql:5432/postgres?sslmode=disable` (the chart default; the password is `password` unless you changed `POSTGRES_PASSWORD`)
- **If using External PostgreSQL (`postgresql.enabled: false`)**: Ensure your Kubernetes cluster nodes have network routing and security group access to your cloud database endpoint (e.g. AWS RDS or GCP Cloud SQL) on port 5432.

#### 3. RabbitMQ Broker Connection Failure
If backend services fail to initialize task consumers and event queues:

**Diagnose:**
```shell
kubectl get pods -n nudgebee -l app.kubernetes.io/name=rabbitmq
kubectl logs deployment/services-server -n nudgebee | grep -i rabbit
```

**Resolution:**
Verify that `RABBIT_MQ_HOST` matches your service name (default `rabbitmq`) and that `RABBIT_MQ_USERNAME` (default `user`) and `RABBIT_MQ_PASSWORD` match the broker.

#### 4. Ingress 502 Bad Gateway / WebSocket EOF
If the NudgeBee web UI loads but live events, agent connections, or NuBi AI chat stream disconnect unexpectedly:

**Resolution:**
Ensure your Ingress allows long-lived WebSocket connections. ingress-nginx supports WebSockets without extra configuration; raise the read and send timeouts on the relay and app Ingresses:
```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
```

#### 5. Control Plane OOMKilled (Exit Code 137)
If pods randomly restart under heavy metric or event ingestion:

**Diagnose:**
```shell
kubectl get pods -n nudgebee -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[*].lastState.terminated.reason}{"\n"}{end}'
```

**Resolution:**
If `OOMKilled` appears, move to a larger [sizing tier](#sizing-tiers), or raise that service's limits in your `values.yaml` (the key is the service name, for example `services-server`):
```yaml
services-server:
  resources:
    requests:
      cpu: "500m"
      memory: "1Gi"
    limits:
      cpu: "2"
      memory: "4Gi"
```

---

## 9. Uninstall NudgeBee

To completely remove NudgeBee from your cluster:

```shell
helm uninstall nudgebee --namespace nudgebee --kube-context $KUBE_CONTEXT
```

:::caution
This removes the NudgeBee components — **including the bundled agent**, which shares the same Helm release. It does **not** delete the data volumes of the bundled PostgreSQL, RabbitMQ, Redis and Qdrant: a reinstall into the same namespace picks up the old data and passwords. To remove everything, delete those volumes (or the namespace) afterwards:

```shell
kubectl get pvc -n nudgebee
kubectl delete namespace nudgebee
```

Back up any data you need first.
:::

---

## What's Next?

Your NudgeBee server is running, and the cluster it runs on is already connected through the bundled agent. Here is what to do next:

1. **[Install the NudgeBee Agent](../agent/installation/index.md)** on each **additional** Kubernetes cluster you want to monitor — this is how NudgeBee gets visibility into workloads outside the control-plane cluster.
2. **[Configure Integrations](../../integrations/index.md)** — connect your observability tools, notification channels, and LLM provider to unlock the full platform.
3. **[Explore the Getting Started Guide](../../features/index.md)** — see the recommended setup order and what to do after your first login.

## Related

- [Upgrade](./upgrade.md)
- [Configuration Options](./secret_configs.md)
- [Helm Values Reference](./helm_values.md)
- [Agent Installation](../agent/installation/index.md)
