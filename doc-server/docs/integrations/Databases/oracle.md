---
sidebar_position: 5
---
# Oracle Database

Connect an Oracle database so NudgeBee can analyse its health and query it from workflows.

:::info
Oracle is always reached through the [Proxy Agent](../../installation/proxy-agent/index.md) — there is no in-cluster secret mode.
:::

---

## Prerequisites

- A [Proxy Agent](../../installation/proxy-agent/index.md) that can reach the listener.
- An Oracle user NudgeBee can authenticate as, with `CREATE SESSION` and read access to the dynamic performance views.
- The **service name** of the database — not the SID. For a pluggable database this is typically something like `XEPDB1` or `ORCLPDB1`.

### Recommended Grants

```sql
CREATE USER nudgebee IDENTIFIED BY "<YOUR_PASSWORD>";
GRANT CREATE SESSION TO nudgebee;
GRANT SELECT_CATALOG_ROLE TO nudgebee;
```

`SELECT_CATALOG_ROLE` covers the `V$` performance views the health checks read.

---

## Step 1: Open the Configuration Form

Navigate to **Admin** > **Integrations** > **Databases** and select **Oracle**, then click **Add Oracle Account**.

## Step 2: Fill In the Connection

* **Oracle host** — Hostname or IP of the listener, e.g. `db.example.com` or `10.0.1.5`.
* **Oracle port** — Typically `1521`.
* **Oracle service name** — The service name, e.g. `ORCL` or `XEPDB1`. Using a SID here is the most common cause of a failed connection.
* **Credential Source**, **Database username \***, **Database password \***, **TLS Enabled**, **Read Only**, **Maximum open connections in the pool** — see [common fields](./index.md#fields-common-to-every-database).

## Step 3: Test and Save

Click **Test Connection**, then **Save**.

---

## What Gets Connected

| Capability | What NudgeBee reads |
|------------|---------------------|
| Health check | `V$SESSION`, `V$LOCK`, tablespace usage and wait events |
| Slow queries | `V$SQL` and `V$SQLSTATS` |
| Workflow queries | Any SQL you supply via [`dbms.query`](../../features/workflow-builder/database-tasks.md) with `dbms_type: oracle` |

---

## Verify the Integration

1. Click **Test Connection** on the form — it should succeed before you save.
2. Ask NuBi to check the health of the database by the name you gave it.
3. In a workflow, run a [`dbms.query`](../../features/workflow-builder/database-tasks.md) task with `SELECT 1 FROM DUAL`.

---

## Troubleshooting

See the [shared troubleshooting table](./index.md#troubleshooting) first. Oracle-specific cases:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `ORA-12514: listener does not currently know of service` | A SID was entered instead of a service name | Use the service name. `lsnrctl services` on the database host lists them. |
| `ORA-01017: invalid username/password` | Password case, or a quoted identifier | Oracle passwords are case-sensitive by default; enter it exactly as created. |
| `ORA-00942: table or view does not exist` on `V$` views | Missing catalog access | `GRANT SELECT_CATALOG_ROLE TO nudgebee;` |
| `ORA-12541: no listener` | Wrong port, or the listener is not running | Confirm the listener port and that it is reachable from the Forager host. |
| `ORA-28000: the account is locked` | Failed login attempts locked the user | `ALTER USER nudgebee ACCOUNT UNLOCK;` and correct the stored password. |

---

## Helpful Links

- [Proxy Agent installation](../../installation/proxy-agent/installation.md)
- [Proxy Agent configuration reference](../../installation/proxy-agent/configuration.md)
- [Database tasks in workflows](../../features/workflow-builder/database-tasks.md)
