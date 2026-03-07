---
sidebar_position: 2
---

# Quick Start

Connect your first database to NudgeBee in 5 minutes using the Proxy Agent.

## Prerequisites

- A NudgeBee account
- A database you want to connect (PostgreSQL, MySQL, etc.)
- Network access from the machine running the agent to your database

## Step 1: Create a Proxy Agent in NudgeBee

1. Go to **Settings → Agents** in the NudgeBee UI.

<!-- TODO: Add screenshot of the Agents page -->
<!-- ![Agents page](../../../../static/img/proxy-agent/agents_page.png) -->

2. Click **Add Agent** and select **Proxy Agent**.

<!-- TODO: Add screenshot of Add Agent dialog -->
<!-- ![Add Agent dialog](../../../../static/img/proxy-agent/add_agent_dialog.png) -->

3. Copy the **Access Key** and **Access Secret**. You'll need these to start the agent.

<!-- TODO: Add screenshot showing access key and secret -->
<!-- ![Access key and secret](../../../../static/img/proxy-agent/agent_credentials.png) -->

## Step 2: Install the Agent

Run one of the following on the machine that has network access to your database.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="script" label="Install Script" default>

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

</TabItem>
<TabItem value="docker" label="Docker">

```bash
docker run -d --name nudgebee-forager \
  -e NB_ACCESS_KEY=<ACCESS_KEY> \
  -e NB_ACCESS_SECRET=<ACCESS_SECRET> \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

</TabItem>
<TabItem value="helm" label="Helm">

```bash
helm install nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  --set forager.accessKey=<ACCESS_KEY> \
  --set forager.accessSecret=<ACCESS_SECRET>
```

</TabItem>
</Tabs>

Replace `<ACCESS_KEY>` and `<ACCESS_SECRET>` with the values from Step 1.

## Step 3: Verify the Agent is Connected

Check the agent logs:

```
{"level":"INFO","msg":"starting forager"}
{"level":"INFO","msg":"connected to relay, greeting sent"}
```

In the NudgeBee UI, the agent status should show as **Connected** on the Agents page.

<!-- TODO: Add screenshot of connected agent status -->
<!-- ![Agent connected](../../../../static/img/proxy-agent/agent_connected.png) -->

## Step 4: Add a Datasource

1. Go to **Settings → Integrations** in the NudgeBee UI.

<!-- TODO: Add screenshot of Integrations page -->
<!-- ![Integrations page](../../../../static/img/proxy-agent/integrations_page.png) -->

2. Click **Add Integration** and select your database type (e.g., **PostgreSQL**).

<!-- TODO: Add screenshot of integration type selection -->
<!-- ![Select integration type](../../../../static/img/proxy-agent/select_integration_type.png) -->

3. Select **VM Agent** as the connection mode.

<!-- TODO: Add screenshot showing connection mode selection -->
<!-- ![Connection mode selection](../../../../static/img/proxy-agent/connection_mode.png) -->

4. Enter the connection details:
   - **Host** — hostname or IP of your database (as reachable from the agent)
   - **Port** — database port (e.g., 5432 for PostgreSQL)
   - **Database** — database name
   - **Username** and **Password** — database credentials

<!-- TODO: Add screenshot of filled-in form -->
<!-- ![Database connection form](../../../../static/img/proxy-agent/db_connection_form.png) -->

5. Click **Save**. NudgeBee pushes the configuration to your agent automatically.

## Step 5: Verify the Datasource

Check the agent logs for confirmation:

```
{"level":"INFO","msg":"received datasource config sync","datasource_count":1}
{"level":"INFO","msg":"database connection established","type":"postgresql","host":"10.0.1.50","port":5432}
{"level":"INFO","msg":"datasource configured","id":"...","type":"postgresql","proxy_type":"db-proxy"}
```

The datasource should now appear as **Healthy** in the NudgeBee Integrations page.

<!-- TODO: Add screenshot of healthy datasource -->
<!-- ![Healthy datasource](../../../../static/img/proxy-agent/datasource_healthy.png) -->

## What's Next

You're done! You can now ask NudgeBee questions about your database — it will query through the proxy agent automatically.

- [Add more datasources](./configuration.md) using the UI or YAML config
- [Use cloud secret managers](./credential-sources.md) instead of inline credentials
- [Deploy on Kubernetes](./installation.md#option-4-helm) with Helm
- Having issues? See [Troubleshooting](./troubleshooting.md)
