---
sidebar_position: 11
sidebar_label: Database Tasks
---

# Database Tasks

Execute queries against relational databases and Redis.

## `dbms.query`

**Display Name:** Database Query

Run a SQL query against a connected database.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | Database integration ID. |
| `dbms_type` | string | Yes | Database type. Options: `mysql`, `postgresql`, `clickhouse`, `mssql`, `oracle`. |
| `command` | string | Yes | SQL query to execute. |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | array | Query result rows. |

---

## `dbms.redis.cli`

**Display Name:** Redis CLI

Run commands against a Redis instance.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | Redis integration ID. |
| `command` | string | Yes | Redis command (e.g., `GET key`, `INFO memory`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Redis command response. |
