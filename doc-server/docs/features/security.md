---
sidebar_position: 11
---
# Security

NudgeBee is designed with security at its core. [NudgeBee Cloud](https://app.nudgebee.com) (the managed SaaS offering) is **SOC 2 Type II certified** and **ISO 27001 certified**. These certifications cover the hosted service; self-hosted (Community and Enterprise) deployments run entirely within your own infrastructure, under your own controls.

This page covers NudgeBee's **Enterprise Guardrails** — authentication, authorization, approval workflows, and audit trails — that keep your operations secure and compliant.

:::info
NudgeBee does not store passwords. All authentication is handled through SSO providers or magic email links, keeping your login process secure and simple.
:::

## Authentication
- **OAuth SSO** with Google, Okta, OneLogin, Azure AD (and B2C), and Auth0 is available in **all editions** (Community, Enterprise, Cloud). See [Authentication Integration](../integrations/Authentication/index.md) for setup.
- **SAML 2.0 SSO** (with IdP-driven user provisioning and group-to-role mapping) is available in the **Enterprise** and **Cloud** editions.
- Users without SSO can use **magic email links** — enter your email and receive a one-time login link. No password required.
- Credentials for external integrations are stored encrypted (AES-GCM) at rest using the `NUDGEBEE_ENCRYPTION_KEY` set at install time.

## Authorization & Access Control
- NudgeBee provides role-based access control (RBAC) across tenants and accounts with pre-defined roles: **Tenant Admin**, **SRE / Platform**, **Operator**, **FinOps**, and **Viewer**.
- See the complete **[RBAC & Permissions Matrix](../integrations/Authentication/rbac-permissions-matrix.md)** for a granular capability mapping across all console, API, and automation actions.

## Kubernetes Agent RBAC & Least-Privilege Permissions

For security compliance teams reviewing the in-cluster agent deployment, the NudgeBee agent requests read-only Kubernetes `ClusterRole` permissions by default:

| API Group | Resources | Verb Permissions | Purpose |
|---|---|---|---|
| `""` (Core) | `pods`, `nodes`, `namespaces`, `services`, `endpoints`, `events`, `persistentvolumes`, `persistentvolumeclaims` | `get`, `list`, `watch` | Topology mapping, resource health, and incident triage. |
| `apps` | `deployments`, `statefulsets`, `daemonsets`, `replicasets` | `get`, `list`, `watch` | Workload configuration and right-sizing analysis. |
| `batch` | `jobs`, `cronjobs` | `get`, `list`, `watch` | Batch workload failure detection. |
| `networking.k8s.io` | `ingresses`, `networkpolicies` | `get`, `list`, `watch` | Traffic routing and network topology mapping. |
| `autoscaling` | `horizontalpodautoscalers` | `get`, `list`, `watch` | HPA scaling tracking. |

:::note No Secret Data Access
The agent **never reads Secret data contents** (`get` or `list` on `secrets` is excluded from default ClusterRole bindings).
:::

## Network Security & Firewall Rules

| Traffic Flow | Direction | Protocol / Port | Destination | Purpose |
|---|---|---|---|---|
| **Agent to Server** | Outbound | TCP `443` (WSS / HTTPS) | `app.nudgebee.com` or self-hosted Ingress | Streaming metrics, events, and telemetry. |
| **Server to Cloud Pricing** | Outbound | TCP `443` (HTTPS) | AWS, GCP, Azure pricing endpoints | Cost calculations. Runs on the server; agents never call these. |
| **Server to In-Cluster Relay** | Inbound / Internal | TCP `8080` (Internal ClusterIP) | `relay-server.nudgebee.svc` | Real-time agent relay communication. |

## Audit
- User operations are tracked and can be viewed on the UI.

### Add User and Roles

<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/390ad667dd814200b9a0c6f85dda7c00?sid=e31157c7-051b-43b6-be78-ba2560a49920" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>

### Tenant Roles
<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/12011b18e5a848dfb2cfa832457622ca?sid=00107068-55ec-45d5-ab26-0eb3e3f869cf" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>

### Account Roles
<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/0318fdb34d3d46f5ad3dd9c693bb31eb?sid=0b2175ce-feac-47a9-8acb-f445ac508877" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>