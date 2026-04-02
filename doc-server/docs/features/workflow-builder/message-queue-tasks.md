---
sidebar_position: 14
sidebar_label: Message Queue Tasks
---

# Message Queue Tasks

Manage message queues and brokers.

## `mq.rabbitmqadmin.cli`

**Display Name:** rabbitmqadmin

Manage RabbitMQ queues, exchanges, and bindings using the `rabbitmqadmin` CLI.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `integration_id` | integration | Yes | RabbitMQ integration ID. |
| `command` | string | Yes | rabbitmqadmin command (e.g., `list queues`, `publish exchange=amq.default routing_key=test payload="hello"`). |
| `account_id` | account | No | Nudgebee account ID. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Command response. |
