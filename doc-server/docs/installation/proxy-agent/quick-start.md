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

1. Go to **Admin → Integrations → Servers** in the NudgeBee UI.

![Integrations Servers tab](/img/proxy-agent/integrations_servers_tab.gif)

2. Click the **Proxy Agent** card to open the Proxy Agent accounts page.

![Proxy Agent accounts list](/img/proxy-agent/proxy_agent_list.gif)

3. Click **Add Proxy Agent Account**. Enter a **name** for the agent and select the **account**, then click **Save**.

![Add Proxy Agent Account dialog](/img/proxy-agent/add_proxy_agent_dialog.gif)

4. Copy the **Relay URL**, **Access Key**, and **Access Secret** shown after creation. You'll need these to start the agent.

## Step 2: Install the Agent

Run one of the following on the machine that has network access to your database.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="script" label="Install Script" default>

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_RELAY_URL=<RELAY_URL> \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

</TabItem>
<TabItem value="docker" label="Docker">

```bash
docker run -d --name nudgebee-forager \
  -e NB_RELAY_URL=<RELAY_URL> \
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
  --set forager.relayURL=<RELAY_URL> \
  --set forager.accessKey=<ACCESS_KEY> \
  --set forager.accessSecret=<ACCESS_SECRET>
```

</TabItem>
</Tabs>

Replace `<RELAY_URL>`, `<ACCESS_KEY>`, and `<ACCESS_SECRET>` with the values from Step 1.

## Step 3: Verify the Agent is Connected

Check the agent logs:

```
{"level":"INFO","msg":"starting forager"}
{"level":"INFO","msg":"connected to relay, greeting sent"}
```

In the NudgeBee UI, the agent should appear on the Proxy Agent accounts page.

## Step 4: Add a Datasource

1. Go to **Admin → Integrations → Databases** in the NudgeBee UI.

![Databases tab](/img/proxy-agent/databases_tab.gif)

2. Click the database type you want to connect (e.g., **PostgreSQL**). Then click **Add Postgres Account** (or the equivalent button for your database type).

3. In the **Connection Mode** dropdown, select **Proxy Agent**.

![Connection mode dropdown](/img/proxy-agent/connection_mode_dropdown.gif)

4. Enter the connection details:
   - **Integration name** — a descriptive name for this datasource
   - **Select Account** — choose the account to associate this datasource with
   - **Host** — hostname or IP of your database (as reachable from the agent, e.g., `db.example.com` or `10.0.1.5`)
   - **Database** — database name to connect to
   - **SSL Mode** — SSL mode for the connection (optional)
   - **Credential Source** — where database credentials are stored (see [Credential Sources](./credential-sources.md))
   - **Read Only** — optionally restrict to read-only queries

![Database connection form (top)](/img/proxy-agent/proxy_agent_form_top.gif)

![Database connection form (bottom)](/img/proxy-agent/proxy_agent_form_bottom.gif)

5. Click **Save**. NudgeBee pushes the configuration to your agent automatically.

## Step 5: Verify the Datasource

Check the agent logs for confirmation:

```
{"level":"INFO","msg":"received datasource config sync","datasource_count":1}
{"level":"INFO","msg":"database connection established","type":"postgresql","host":"10.0.1.50","port":5432}
{"level":"INFO","msg":"datasource configured","id":"...","type":"postgresql","proxy_type":"db-proxy"}
```

The datasource should now appear as **Healthy** in the NudgeBee Integrations page.

## What's Next

You're done! You can now ask NudgeBee questions about your database — it will query through the proxy agent automatically.

- [Add more datasources](./configuration.md) using the UI or YAML config
- [Use cloud secret managers](./credential-sources.md) instead of inline credentials
- [Deploy on Kubernetes](./installation.md#option-4-helm) with Helm
- Having issues? See [Troubleshooting](./troubleshooting.md)
