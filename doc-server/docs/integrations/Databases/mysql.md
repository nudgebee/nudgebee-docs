---
sidebar_position: 2
---
# MySQL

Connect a MySQL or MariaDB database so NudgeBee can analyse its health and query it from workflows.

Supported: MySQL 5.7 and later, and MariaDB.

---

## Prerequisites

- A MySQL user NudgeBee can authenticate as, with read access to the schemas you want analysed and to the performance schema.
- Either the NudgeBee agent running in the same cluster as the database (**K8s** mode), or a reachable [Proxy Agent](../../installation/proxy-agent/index.md) (**Proxy Agent** mode).

### Recommended Grants

```sql
CREATE USER 'nudgebee'@'%' IDENTIFIED BY '<YOUR_PASSWORD>';
GRANT SELECT ON <your_database>.* TO 'nudgebee'@'%';
GRANT PROCESS, REPLICATION CLIENT ON *.* TO 'nudgebee'@'%';
GRANT SELECT ON performance_schema.* TO 'nudgebee'@'%';
```

`PROCESS` is what lets NudgeBee see other sessions in `SHOW PROCESSLIST`; without it, only the NudgeBee session is visible and concurrency analysis is meaningless.

---

## Step 1: Open the Configuration Form

Navigate to **Admin** > **Integrations** > **Databases** and select **Mysql**, then click **Add Mysql Account**.

## Step 2: Choose a Connection Mode

### K8s

* **Kubernetes secret containing MYSQL_DATABASE, MYSQL_HOST, MYSQL_USER, MYSQL_PWD keys \*** (Required)

| Key | Value |
|-----|-------|
| `MYSQL_HOST` | Hostname or service DNS name, e.g. `mysql.databases.svc.cluster.local` |
| `MYSQL_DATABASE` | Database to connect to |
| `MYSQL_USER` | Username |
| `MYSQL_PWD` | Password |

```bash
kubectl create secret generic nudgebee-mysql \
  --namespace databases \
  --from-literal=MYSQL_HOST=mysql.databases.svc.cluster.local \
  --from-literal=MYSQL_DATABASE=orders \
  --from-literal=MYSQL_USER=nudgebee \
  --from-literal=MYSQL_PWD='<YOUR_PASSWORD>'
```

:::note
The password key is `MYSQL_PWD`, not `MYSQL_PASSWORD`. A secret using the longer name will save successfully and then fail to authenticate.
:::

### Proxy Agent

* **MySQL host \*** (Required) — Hostname or IP, e.g. `db.example.com` or `10.0.1.5`.
* **MySQL port** — Typically `3306`.
* **Database name to connect to** — The schema NudgeBee opens.
* **TLS Enabled** — Turn on for connections crossing a network boundary.
* **Credential Source**, **Database username \***, **Database password \***, **Read Only**, **Maximum open connections in the pool** — see [common fields](./index.md#fields-common-to-every-database).

## Step 3: Save

Click **Save**. In Proxy Agent mode, use **Test Connection** first.

---

## What Gets Connected

| Capability | What NudgeBee reads |
|------------|---------------------|
| Health check | Session and connection counts, long-running queries, lock waits, table sizes |
| Slow queries | `performance_schema` statement summaries |
| Workflow queries | Any SQL you supply via [`dbms.query`](../../features/workflow-builder/database-tasks.md) with `dbms_type: mysql` |

---

## Verify the Integration

1. Ask NuBi to check the health of the database by the name you gave it.
2. In a workflow, run a [`dbms.query`](../../features/workflow-builder/database-tasks.md) task with `SELECT 1`.

---

## Troubleshooting

See the [shared troubleshooting table](./index.md#troubleshooting) first. MySQL-specific cases:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Authentication fails despite correct password | Secret uses `MYSQL_PASSWORD` instead of `MYSQL_PWD` | Recreate the secret with the `MYSQL_PWD` key. |
| Only NudgeBee's own session is visible | Missing `PROCESS` grant | `GRANT PROCESS ON *.* TO 'nudgebee'@'%';` |
| `Host ... is not allowed to connect` | The user is bound to a specific host | Create the user with a host pattern that covers the agent, e.g. `'nudgebee'@'%'`. |
| Statement statistics are empty | `performance_schema` is disabled | Enable `performance_schema` in the server configuration and restart. |
| TLS handshake errors | Server requires TLS, **TLS Enabled** is off | Turn on **TLS Enabled**. |

---

## Helpful Links

- [Database tasks in workflows](../../features/workflow-builder/database-tasks.md)
- [Proxy Agent configuration reference](../../installation/proxy-agent/configuration.md)
- [Credential sources](../../installation/proxy-agent/credential-sources.md)
