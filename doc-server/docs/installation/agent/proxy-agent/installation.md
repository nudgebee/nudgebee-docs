---
sidebar_position: 2
---

# Installation

## Prerequisites

- Network access to `relay.nudgebee.com` on port 443
- Network access from the agent to each datasource you want to monitor
- Access key and secret from the NudgeBee UI (Settings > Integrations)

Replace `<ACCESS_KEY>` and `<ACCESS_SECRET>` in the commands below with the values from the UI.

## Option 1: Install Script

The quickest way to get started. Downloads and installs Forager as a systemd service.

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

## Option 2: Docker

```bash
docker run -d --name nudgebee-forager \
  -e NB_ACCESS_KEY=<ACCESS_KEY> \
  -e NB_ACCESS_SECRET=<ACCESS_SECRET> \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

## Option 3: Docker Compose

```yaml
# docker-compose.yaml
services:
  forager:
    image: registry.nudgebee.com/nudgebee-forager:latest
    restart: unless-stopped
    environment:
      - NB_ACCESS_KEY=<ACCESS_KEY>
      - NB_ACCESS_SECRET=<ACCESS_SECRET>
    volumes:
      - forager-data:/data

volumes:
  forager-data:
```

```bash
docker compose up -d
```

## Option 4: Helm

```bash
helm install nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  --set forager.accessKey=<ACCESS_KEY> \
  --set forager.accessSecret=<ACCESS_SECRET>
```

## Verify

Once running, you should see in the logs:

```
{"level":"INFO","msg":"starting forager"}
{"level":"INFO","msg":"connected to relay, greeting sent"}
{"level":"INFO","msg":"sent datasource inventory for auto-registration"}
```

Configured datasources will appear automatically in the NudgeBee UI under your account.
