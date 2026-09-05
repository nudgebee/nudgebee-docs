---
sidebar_position: 4
---
# Microsoft SQL Server

Connect a Microsoft SQL Server instance so NudgeBee can analyse its health and query it from workflows.

:::info
SQL Server is always reached through the [Proxy Agent](../../installation/proxy-agent/index.md) — there is no in-cluster secret mode. Forager must be able to open a TCP connection to the instance.
:::

---

## Prerequisites

- A [Proxy Agent](../../installation/proxy-agent/index.md) that can reach the instance.
- A SQL Server login NudgeBee can authenticate as, with read access to the database and to the dynamic management views.

### Recommended Grants

```sql
CREATE LOGIN nudgebee WITH PASSWORD = '<YOUR_PASSWORD>';
USE [<your_database>];
CREATE USER nudgebee FOR LOGIN nudgebee;
ALTER ROLE db_datareader ADD MEMBER nudgebee;
GRANT VIEW SERVER STATE TO nudgebee;
```

`VIEW SERVER STATE` is what makes the `sys.dm_exec_*` views readable; without it, session and query analysis returns nothing.

---

## Step 1: Open the Configuration Form

Navigate to **Admin** > **Integrations** > **Databases** and select **SQL Server**, then click **Add Mssql Account**.

## Step 2: Fill In the Connection

* **MSSQL host** — Hostname or IP, e.g. `db.example.com` or `10.0.1.5`. For a named instance, use the host and set the port explicitly rather than the `host\instance` form.
* **MSSQL port** — Defaults to `1433`.
* **Database name to connect to** — The database NudgeBee opens.
* **TLS Enabled** — Turn on for connections crossing a network boundary. Azure SQL requires it.
* **Credential Source**, **Database username \***, **Database password \***, **Read Only**, **Maximum open connections in the pool** — see [common fields](./index.md#fields-common-to-every-database).

## Step 3: Test and Save

Click **Test Connection**, then **Save**.

---

## What Gets Connected

| Capability | What NudgeBee reads |
|------------|---------------------|
| Health check | `sys.dm_exec_sessions`, `sys.dm_exec_requests`, blocking and wait statistics |
| Slow queries | `sys.dm_exec_query_stats` joined to statement text |
| Workflow queries | Any SQL you supply via [`dbms.query`](../../features/workflow-builder/database-tasks.md) with `dbms_type: mssql` |

---

## Verify the Integration

1. Click **Test Connection** on the form — it should succeed before you save.
2. Ask NuBi to check the health of the database by the name you gave it.
3. In a workflow, run a [`dbms.query`](../../features/workflow-builder/database-tasks.md) task with `SELECT 1`.

---

## Troubleshooting

See the [shared troubleshooting table](./index.md#troubleshooting) first. SQL Server-specific cases:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Login succeeds, management views empty | Missing `VIEW SERVER STATE` | `GRANT VIEW SERVER STATE TO nudgebee;` |
| Cannot reach a named instance | SQL Browser resolution is not used | Set the instance's static TCP port in **MSSQL port** instead of relying on the instance name. |
| `Login failed for user` on Azure SQL | Username needs the server suffix, or TLS is off | Use `user@servername` where required, and enable **TLS Enabled**. |
| Certificate validation errors | Self-signed server certificate | Install a trusted certificate on the instance, or terminate TLS where Forager can validate it. |

---

## Helpful Links

- [Proxy Agent installation](../../installation/proxy-agent/installation.md)
- [Proxy Agent configuration reference](../../installation/proxy-agent/configuration.md)
- [Database tasks in workflows](../../features/workflow-builder/database-tasks.md)
