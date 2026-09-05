# Databases

NudgeBee connects to your relational databases so that database health becomes part of the same troubleshooting picture as your Kubernetes workloads. A connected database is queried on demand — NudgeBee never writes to it.

### Why Connect a Database?

- **Health checks on request** — [NuBi audits database health](../../features/ai/use-cases/database-health.md): connection saturation, long-running and blocking queries, table bloat, autovacuum behaviour, and index usage.
- **Slow query analysis** — rank statements by execution time and total load, and correlate a latency spike in a service with what its database was doing at the time.
- **Workflow automation** — the [`dbms.query` task](../../features/workflow-builder/database-tasks.md) runs SQL from any workflow, so a runbook can gather evidence or verify a fix.
- **Safe change proposals** — NuBi verifies a proposed change against your application code before recommending it, and can draft it as a pull request rather than applying it.

### When Do You Need This?

This integration is **optional**. Connect a database when you want database-level diagnosis alongside cluster troubleshooting, or when a workflow needs to query one.

## Available Database Integrations

| Database | Guide |
|----------|-------|
| PostgreSQL | [PostgreSQL](./postgresql.md) |
| MySQL / MariaDB | [MySQL](./mysql.md) |
| ClickHouse | [ClickHouse](./clickhouse.md) |
| Microsoft SQL Server | [SQL Server](./sqlserver.md) |
| Oracle Database | [Oracle](./oracle.md) |

Redis is configured separately under **In-Memory**, and RabbitMQ under **Messaging Queue**.

---

## Connection Modes

How NudgeBee reaches a database depends on where the database runs.

### K8s

The NudgeBee agent connects from inside a cluster it is already installed in, reading the connection details from a **Kubernetes Secret** you name. Nothing about the database is stored in NudgeBee, and the database never needs to be reachable from outside the cluster.

Available for PostgreSQL, MySQL and ClickHouse. Each expects its own set of keys in the secret — see the provider page.

### Proxy Agent

The [Proxy Agent (Forager)](../../installation/proxy-agent/) connects to the database over the network and relays results to NudgeBee. Use this for managed services (RDS, Cloud SQL, Azure SQL), databases on VMs, and anything outside a connected cluster.

SQL Server and Oracle are always reached this way; they have no K8s mode.

:::tip
Forager can also be configured entirely from its own YAML file rather than the UI. See the [configuration reference](../../installation/proxy-agent/configuration.md) for the datasource fields, and [credential sources](../../installation/proxy-agent/credential-sources.md) for where the credentials come from.
:::

---

## Fields Common to Every Database

These appear on every database configuration form. Provider pages document only what is specific to that database.

* **Integration name \*** (Required) — A descriptive name for this connection, e.g. `orders-prod`. This is how the database is identified everywhere else in NudgeBee.
* **Select Account \*** (Required) — The NudgeBee account (cluster or cloud account) this connection belongs to.
* **Credential Source** — Where the username and password come from. Options: `Cloud Push` (default — stored in NudgeBee and pushed to the agent at runtime), `AWS Sm`, `Gcp Sm`, `Azure Kv`, and `Local`. See [credential sources](../../installation/proxy-agent/credential-sources.md).
* **Database username \*** and **Database password \*** (Required) — The account NudgeBee authenticates as. Grant it read access to the schemas and statistics views you want analysed, and nothing more.
* **Read Only** — Restricts the connection to read-only queries. Leave this on unless a workflow specifically needs to write.
* **Maximum open connections in the pool** — Caps concurrent connections NudgeBee opens. Set it low on busy production databases.

:::caution
Create a dedicated, least-privilege user for NudgeBee rather than reusing an application or admin account. Health checks need read access to the statistics views (for example `pg_stat_statements` on PostgreSQL); if that grant is missing, the analysis still runs but query text is redacted with an `insufficient privilege` error.
:::

---

## Automatically Discovered Databases

Databases running inside a connected cluster may be registered automatically by the NudgeBee agent. These appear in the accounts list with `agent` as the creator and typically have no connection info filled in. You can enable, rename or replace them with a manually configured connection at any time.

---

## Verify the Integration

1. Click **Test Connection** on the configuration form before saving, where the provider offers it. A successful test proves network reachability and authentication — not that the user has every permission the health checks need.
2. Save. The connection appears under **Admin** > **Integrations** > **Databases** with status **Enabled**.
3. Ask NuBi to check the database by the name you gave it — for example *"check the health of orders-prod"*. A working connection returns connection counts, lock state and table statistics.
4. To confirm workflow access, run a [`dbms.query`](../../features/workflow-builder/database-tasks.md) task with a trivial query such as `SELECT 1`.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| **Test Connection** times out | The database is not reachable from the agent | For K8s mode, confirm the service is resolvable from the agent's namespace. For Proxy Agent mode, confirm Forager's network path and any security group or firewall rule. |
| Authentication failed | Wrong credentials, or the user is not allowed from the agent's source address | Verify the username and password, and the host-based access rules on the database (for example `pg_hba.conf`). |
| Connection saves but health checks return nothing | The Kubernetes Secret is missing a key | Check the secret contains every key listed on the provider page, spelled exactly. |
| Query text shows `insufficient privilege` | The NudgeBee user cannot read other users' statements | Grant the role the provider page describes for statistics access. |
| Database appears twice | An agent-discovered entry and a manually created one both exist | Disable whichever you do not want to use. |
| Writes are rejected in a workflow | **Read Only** is enabled | Disable **Read Only** on the connection, or use a separate connection for write tasks. |
