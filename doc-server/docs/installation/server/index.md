---
sidebar_position: 1
sidebar_label: Server
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Server Installation

**Who this page is for: self-hosted users only.** If you are on Cloud SaaS, the
server is already running for you — skip to
[Agent Installation](../agent/installation/index.md). Not sure which model you
are on? See [Choose Your Deployment Model](../index.md#choose-your-deployment-model).

The NudgeBee Server is the central component of the NudgeBee platform. It receives data from NudgeBee Agents, performs analysis, handles user authentication, and integrates with external services. It runs as a Helm release in a Kubernetes cluster (or namespace) of your own — separate from the clusters you monitor.

:::tip[Choosing an edition]
The self-hosted server comes in two editions (see [Editions](../../editions.md) for the full comparison):

- **Community** <Community/> — free and open source, fully functional. Images are pulled from the public `ghcr.io/nudgebee` registry. **No license key required.** OAuth SSO (Google, Okta, OneLogin, Azure AD / B2C, Auth0), magic-link email, and credentials login are all included.
- **Enterprise** <Enterprise/> — adds **SAML 2.0** SSO, NudgeBee's managed models (`nb-llm`, `nb-slm`), and commercial support. Images are pulled from `registry.nudgebee.com` and require a license key.

The installation steps below use tabs — pick your edition in each step.
:::

## Architecture

![Server Architecture](/img/nb_server_architecture.png)

:::tip
**Estimated time**: 15–30 minutes, depending on your cluster and infrastructure setup.
:::

### Components and Why They Exist

The Helm chart bundles its own datastores and message bus so a fresh install
works with no external setup. The table below is here so you can make the one
architectural decision that matters early: **what to run bundled, and what to
point at infrastructure you already operate.**

:::warning[RabbitMQ and Postgres are hard requirements]
The server **will not start** without them — backend consumers do not bootstrap
without RabbitMQ, and queries fail without Postgres. You can run them externally,
but you cannot run without them. Redis, by contrast, is genuinely optional: the
server falls back to an in-memory cache when it is not configured.
:::

| Component | Required? | What it does | Bring your own? |
|---|---|---|---|
| **PostgreSQL** | **Required** | Primary datastore — workloads, workflow state, metadata, and configuration. Queries fail without it. | Yes — point `APP_DATABASE_URL` at a managed Postgres and set `postgresql.enabled: false` |
| **RabbitMQ** | **Required** | Message bus between backend services. Consumers will not bootstrap without it. | Yes — set the `RABBIT_MQ_*` values and `rabbitmq.enabled: false` |
| **Temporal** | **Required for workflows** | Durable-execution engine behind the Workflow Builder and Autopilot runbooks. | Bundled by default |
| **Qdrant** | **Required for AI features** | Vector store for RAG retrieval used by NuBi and AI troubleshooting. | Bundled by default |
| **Redis** | Optional | Cache. Falls back to in-memory when unset — fine for trials, recommended for production. | Yes — set the `CACHE_PROVIDER` / `REDIS_*` values |
| **ClickHouse** | Optional | Analytical store for high-volume trace and log analytics. **Off by default** (`clickhouse.enabled: false`). | Yes — set `clickhouse.auth.existingSecret` |

Externalizing a datastore is worth it when you already have HA, backups, and DBA
tooling for it — the bundled subcharts are single-replica and are not a
substitute for a managed database in production. Keep them bundled for trials
and evaluations, where the lower setup cost matters more.

:::info
**How much does the server actually use?** See
[Resource Footprint](#resource-footprint) below — that section is the single
source of truth for these numbers.
:::

### Watch the Walkthrough

<div style={{position: "relative", paddingBottom: "64.86%", height: 0}}><iframe src="https://www.loom.com/embed/dee1ca6f7d294ef2b7f2746243e67e41?sid=256e5a97-215e-46fa-974e-69b329096273" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}}></iframe></div>

---

## 1. Before You Begin

Make sure you have the following ready before starting the installation.

### Required

| Requirement | Details | Notes |
|---|---|---|
| **Kubernetes cluster** | v1.27 or newer, minimum 2 nodes | Each node: 16 GB RAM, 4 cores, 100 GB SSD |
| **Helm** | v3.x installed and configured | [Install Helm](https://helm.sh/) if you don't have it |
| **Registry access** | Cluster must be able to pull images: `ghcr.io/nudgebee` (Community) or `registry.nudgebee.com` (Enterprise) | Or mirror the images to your internal registry for air-gapped environments |
| **NudgeBee License Key** | **Enterprise only.** Not needed for the Community edition. | Enterprise customers receive a license key; community users skip this. |
| **Persistent Volume** | 200 GB available (100 GB if you use an external Postgres) | Required for database and application state |

### Resource Footprint

This is the reference figure for server capacity planning — other pages link
here rather than restating it.

| Deployment | RAM | CPU |
|---|---|---|
| **All bundled** (Postgres, RabbitMQ, Redis, Temporal, Qdrant included) | ~12 GB | ~4 cores |
| **External dependencies** (you run Postgres, RabbitMQ, Redis yourself) | ~8 GB | ~2 cores |

ClickHouse is off by default and is not included above; enable it only if you
need trace/log analytics. The 2-node recommendation in the table above provides
headroom for reliability, not just capacity.

### Optional but Recommended

These are not required to get NudgeBee running, but they improve the production experience. You can add all of these after installation.

| Component | What it enables | Default without it |
|---|---|---|
| **SSL / DNS / Ingress** | Public URL access, Slack apps, webhook triggers, magic link login | Access via `kubectl port-forward` only |
| **External Postgres** | Use your own managed database for easier backup and scaling | NudgeBee bundles its own Postgres automatically |
| **Email (SMTP)** | Daily summary reports and magic link authentication | Users log in via SSO or admin invite only |
| **LLM provider** | AI-powered troubleshooting, NuBi agent, automated runbooks | Configure after installation — see [LLM Integrations](../../integrations/LLM/index.md) |

### Network Requirements

Your cluster needs the following network access for the installation and normal operation. Each rule is listed with **what breaks if you omit it**, so you can justify the exception to whoever owns your egress policy.

| Access | Why it is needed | What breaks without it |
|---|---|---|
| **Outbound to the container registry** — `ghcr.io/nudgebee` (Community) or `registry.nudgebee.com` (Enterprise) | Pulls the server images during install and upgrade | Pods stay in `ImagePullBackOff` and the install never completes. Air-gapped clusters must mirror the images to an internal registry instead |
| **Internal DNS resolution of `BASE_URL`** | Pods call back to the configured base URL during authentication | Login fails with callback/redirect errors even though every pod is `Running` |
| **Outbound to external services** (Slack, Jira, MS Teams, GitHub, your LLM provider) | Outbound calls to the integrations you enable | Only the corresponding integration fails — the rest of the platform keeps working. Skip these rules until you enable the integration |
| **Inbound from external services** (optional) | Bidirectional integrations — Slack interactive actions, webhook triggers — call back into your server | Notifications still go out, but buttons, slash commands, and inbound webhooks do nothing |

:::tip
**Starting simple?** You can skip Ingress, SSL, and external services for now. The minimal installation works with just outbound registry access and internal DNS. Add public access and integrations later.
:::

---

## 2. Install NudgeBee

The installation is three steps: select your edition (and, for Enterprise, log in to the Helm registry), create a values file, and run the Helm install.

### Step 1: Select Your Edition

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
read -s -p "License key: " NUDGEBEE_LICENSE_KEY   # reads without echoing, keeps it out of shell history
helm registry login registry.nudgebee.com --username nudgebee --password "$NUDGEBEE_LICENSE_KEY"
export NUDGEBEE_CHART=oci://registry.nudgebee.com/nudgebee
```

:::caution[Treat the license key like a password]
This key authenticates your cluster to the NudgeBee registry and lets your
agents report in as you. Anyone who has it can pull your images and send data as
your organization — so it carries real blast radius, not a discount-code level of
risk.

- Store it in a secret manager or a Kubernetes Secret. **Never commit it to a
  `values.yaml`** or paste it into a shared Slack/Teams channel.
- Command-line arguments are saved in shell history. Read it from a secret
  manager or prompt for it (`read -s`, as above) rather than typing it inline.
- For GitOps and Vault-style workflows, reference an existing secret instead —
  see [Managing Secrets Externally](#managing-secrets-externally).
:::

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

nudgebee_secret:
  BASE_URL: "http://localhost:3000"
  # 32-byte hex — generate once with `openssl rand -hex 32` and store in your
  # secret manager. Rotating after data is written makes previously-encrypted
  # DB rows unreadable, so treat it like a database master password.
  NUDGEBEE_ENCRYPTION_KEY: "<your-32-byte-hex-key>"

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

### Step 3: Run the Helm Install

```shell
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --create-namespace \
  --wait \
  --kube-context $KUBE_CONTEXT
```

To install a specific version, add `--version $CHART_VERSION` to the command. See the [Server Releases](./release/) page for available versions.

:::tip
**This minimal setup gets NudgeBee running with port-forwarding.** You can add Ingress, SSL, external Postgres, and other configurations later without reinstalling — just update your `values.yaml` and run `helm upgrade` again.
:::

---

## 3. Verify the Installation

Three checks confirm a good install. Work through them in order — each one rules
out a different class of failure.

**1. Every pod is `Running` or `Completed`**

```shell
kubectl get pods -n nudgebee
```

This typically takes 2–3 minutes after the Helm command finishes. You should see
the NudgeBee services (`app`, `k8s-collector`, `relay-server`, `services-server`,
`etl-server`, `hasura`, `llm-server`, `rag-server`, `ticket-server`,
`notifications`, `auto-pilot`, `ml-server`, `cloud-collector-server`) alongside
the bundled dependencies (`postgresql`, `rabbitmq`), plus the
`postgres-migrations` job in `Completed`. The exact list varies with the chart
version and which optional components you enabled.

**2. The migration job completed**

```shell
kubectl get jobs -n nudgebee
```

Migrations must show `1/1` completions. A migration stuck at `0/1` is the single
most common cause of a failed install — see
[Troubleshooting](#troubleshooting-installation-failures).

**3. The UI answers**

```shell
kubectl port-forward svc/app 3000:80 -n nudgebee &
PF_PID=$!
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000
kill $PF_PID          # stop the port-forward when you are done checking
```

A `200` (or a `3xx` redirect to the login route) means the app is serving. Open
[http://localhost:3000](http://localhost:3000) and **you should see the NudgeBee
login page** — that is what a successful install looks like. If you configured
Ingress, `curl` your `BASE_URL` instead.

:::caution
**If pods are stuck in `Pending`, `CrashLoopBackOff`, or `Error`**, see the [Troubleshooting](#troubleshooting-installation-failures) section below.
:::

---

## 4. Access the UI

### Without Ingress (Port-Forwarding)

Forward the NudgeBee UI to your local machine:

```shell
kubectl port-forward svc/app 3000:80 -n nudgebee --kube-context $KUBE_CONTEXT
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. You should see the NudgeBee login page.


Log in with the admin email address you configured during installation (for Enterprise, this is the email associated with your NudgeBee license). The password is auto-generated during installation and stored in a Kubernetes secret.

Retrieve the password by decoding the secret:

```shell
kubectl get secret nudgebee -n nudgebee \
  -o jsonpath='{.data.NEXTAUTH_DUMMY_CREDS_PASSWORD}' \
  --kube-context $KUBE_CONTEXT | base64 -d
```

Use the decoded password along with the admin email to sign in.

:::caution
**Security**: The dummy credentials provider is intended for initial setup and onboarding. For production environments, it is recommended to configure a proper authentication provider (SSO, LDAP, etc.) and disable dummy credentials. See [Authentication Integrations](../../integrations/Authentication/) for details.
:::

:::info
**Relay and Collector URLs for Agent Installation**: When you install the NudgeBee Agent later, you will need these internal service URLs:
- **Relay Server URL**: `ws://relay-server.nudgebee.svc:8080`
- **Collector Server URL**: `http://k8s-collector.nudgebee.svc`
:::

### With Ingress (Public URL)

If you configured Ingress (see next section), navigate to the URL you set as `BASE_URL` — for example, `https://nudgebee.yourcompany.com`.

---

## 5. Add Ingress and SSL (Recommended for Production)

The minimal installation above works with port-forwarding, but for production use you should expose NudgeBee via Ingress with SSL.

**You need Ingress when** anything outside your kubeconfig has to reach the
server: your team wants a shared URL instead of running `kubectl port-forward`;
Slack or Google Chat apps need to call back into NudgeBee; the Workflow Builder
uses webhook triggers; or you want magic-link email login, which sends users a
link they must be able to open.

**You can skip it when** you are evaluating NudgeBee solo, everyone who needs
access already has cluster credentials, and you are logging in with the
credentials provider rather than magic links. Port-forwarding is enough — and you
can add Ingress later with a `helm upgrade`, without reinstalling.

### Understanding the Three Endpoints

NudgeBee exposes three services that each need their own Ingress entry:

| Service | Purpose | Example domain |
|---|---|---|
| **App** | The web UI and API | `nudgebee.yourcompany.com` |
| **Collector** | Receives data from agents running in your monitored clusters | `collector.yourcompany.com` |
| **Relay** | WebSocket connection for real-time agent communication | `relay.yourcompany.com` |

:::info
**Relay and Collector URLs for Agent Installation**: When you install agents with Ingress enabled, use:
- **Relay Server URL**: `wss://relay.yourcompany.com`
- **Collector Server URL**: `https://collector.yourcompany.com`
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
      - host: "<NudgeBee relay Base Domain>"      # e.g., relay.yourcompany.com
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

After updating your `values.yaml`, apply the changes:

```shell
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --wait \
  --kube-context $KUBE_CONTEXT
```

---

## 6. Advanced Configuration

These options are for teams that need to customize the installation for production requirements. You can skip this section for your initial setup and come back later.

### Using Your Own Datastores

The bundled Postgres, RabbitMQ, and Redis subcharts are single-replica and sized
for getting started. Point NudgeBee at your own instances when you need HA,
point-in-time backups, or want the database inside the tooling your DBAs already
run — the trade-off is that you now own their upgrades and capacity. See
[Components and Why They Exist](#components-and-why-they-exist) for what each one
does and which values to set, and
[All Configuration Options](./secret_configs.md) for the connection settings.

### Managing Secrets Externally

If your organization manages Kubernetes secrets through an external tool (Vault, Sealed Secrets, etc.), you can reference pre-existing secrets instead of putting values directly in the Helm chart.

* **`global.existingNudgebeeSecretName`** — Point to an existing Kubernetes secret that holds core NudgeBee settings (`NUDGEBEE_LICENSE`, `BASE_URL`, etc.). When set, the Helm chart uses this secret and you manage the key-value pairs directly.

  ```yaml
  global:
    existingNudgebeeSecretName: 'nudgebee-v2'

  # Remove or comment out nudgebee_secret when using existingSecret:
  # nudgebee_secret:
  #    NUDGEBEE_LICENSE: YOUR_LICENSE_KEY_HERE
  ```

* **`nudgebee_registry_secret.existingSecretName`** — Reference a pre-created secret for registry credentials.
* **`postgresql.auth.existingSecret`** — Inject an existing secret containing the Postgres password.
* **`clickhouse.auth.existingSecret`** — Same usage for ClickHouse.
* **`rabbitmq.auth.existingPasswordSecret`**, **`existingErlangSecret`** — Same usage for RabbitMQ.

### Additional Configuration References

- **[All Configuration Options](./secret_configs.md)** — Detailed reference for all environment variables and secrets.
- **[Full Helm Values Reference](./helm_values.md)** — Complete list of every configurable value in the Helm chart.

---

## Troubleshooting Installation Failures

### Most Common Issue: Migration Job Timeout

The most common reason for installation failures or timeouts is the **post-installation migration job** not completing. This usually happens because dependent services (like the database) were not fully ready when Helm triggered the migration.

**Fix — re-run Helm upgrade:**

```shell
helm upgrade nudgebee $NUDGEBEE_CHART \
  -f values.yaml \
  --install \
  --namespace nudgebee \
  --wait \
  --kube-context $KUBE_CONTEXT
```

This re-triggers the post-install migration and typically resolves the issue.

:::tip
If you installed a specific version, include `--version $CHART_VERSION` in the command.
:::

### General Troubleshooting Steps

If re-running Helm upgrade does not resolve the issue, check the following:

**Check pod status** — look for pods in `Error`, `CrashLoopBackOff`, or `Pending` state:
```shell
kubectl get pods -n nudgebee -o wide
```

**Check pod logs** — examine logs from failing pods, particularly migration-related pods:
```shell
kubectl logs <pod-name> -n nudgebee
```

**Inspect a failing pod** — get detailed information about why a pod is stuck:
```shell
kubectl describe pod <failing-pod-name> -n nudgebee
```

**Review recent events** — look for image pull errors, resource issues, or volume problems:
```shell
kubectl get events -n nudgebee --sort-by=.lastTimestamp
```

---

## Uninstall NudgeBee

To completely remove NudgeBee from your cluster:

```shell
helm uninstall nudgebee --namespace nudgebee --kube-context $KUBE_CONTEXT
```

:::caution
This removes all NudgeBee components and data. Make sure to back up any data you need before uninstalling.
:::

---

## What's Next?

Your NudgeBee server is running. Here is what to do next:

1. **[Install the NudgeBee Agent](../agent/installation/index.md)** on each Kubernetes cluster you want to monitor — this is how NudgeBee gets visibility into your workloads.
2. **[Configure Integrations](../../integrations/index.md)** — connect your observability tools, notification channels, and LLM provider to unlock the full platform.
3. **[Explore the Getting Started Guide](../../features/index.md)** — see the recommended setup order and what to do after your first login.
