---
sidebar_position: 6
---

# Upgrade

This page covers upgrading the Proxy Agent (Forager) binary after the initial installation. All install methods support in-place upgrades that preserve your config and data directory.

## When to Upgrade

- After a security advisory or bug-fix release.
- When you hit behavior the latest release has fixed (for example, MSSQL queries failing with `Incorrect syntax near 'Q'` or `'d'` on agents installed before **2026-03-27** — those builds don't sanitize CLI-wrapped queries sent by the workspace shim).
- Before opening a support request: reproducing on the latest build eliminates a large class of already-fixed issues.

Keep one version behind `latest` at most — the NudgeBee server tracks forward, so very old agents can fall out of protocol.

## Check Your Current Version

Forager doesn't currently expose a `--version` flag. Use the binary's build timestamp as a proxy:

**Linux (systemd):**
```bash
stat -c '%y' /usr/local/bin/nudgebee-forager
sha256sum /usr/local/bin/nudgebee-forager
```

**Windows:**
```powershell
Get-Item "C:\Program Files\Nudgebee\nudgebee-forager.exe" | Select-Object LastWriteTime, Length
Get-FileHash "C:\Program Files\Nudgebee\nudgebee-forager.exe"
```

**Docker / Docker Compose:**
```bash
docker inspect nudgebee-forager --format '{{.Image}} created {{.Created}}'
docker image inspect registry.nudgebee.com/nudgebee-forager:latest --format '{{.RepoDigests}}'
```

**Helm:**
```bash
helm get values nudgebee-forager -o yaml | grep -A1 image
kubectl -n <namespace> get deploy nudgebee-forager-nudgebee-forager-chart \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
```

The NudgeBee UI (Admin → Integrations → Servers → Proxy Agent) shows the agent's reported version and last-connected time. That's the fastest cross-check.

## Upgrade by Install Method

In every method below, your config file and data directory are preserved. Only the binary (or container image) is replaced.

### Option 1: Linux Install Script (systemd)

Re-run the installer. It stops the service, replaces the binary in `/usr/local/bin/`, reinstalls the systemd unit file, and restarts the service. Existing `/etc/nudgebee/forager.yaml` is **not** overwritten.

```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/latest/install.sh | \
  NB_RELAY_URL=<RELAY_URL> \
  NB_ACCESS_KEY=<ACCESS_KEY> \
  NB_ACCESS_SECRET=<ACCESS_SECRET> \
  bash
```

**Pin a specific version** (useful for staged rollouts or rollback):
```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/<version>/install.sh | \
  NB_VERSION=<version> NB_RELAY_URL=... NB_ACCESS_KEY=... NB_ACCESS_SECRET=... bash
```

Check the service is back up:
```bash
systemctl status nudgebee-forager
journalctl -u nudgebee-forager -f
```

### Option 2: Windows Install Script (Windows Service)

Re-run the PowerShell installer in an **Administrator** shell. It stops the `NudgebeeForager` service, replaces `C:\Program Files\Nudgebee\nudgebee-forager.exe`, and restarts the service. Existing `C:\ProgramData\Nudgebee\forager.yaml` is preserved.

```powershell
$env:NB_RELAY_URL="<RELAY_URL>"
$env:NB_ACCESS_KEY="<ACCESS_KEY>"
$env:NB_ACCESS_SECRET="<ACCESS_SECRET>"
Set-ExecutionPolicy Bypass -Scope Process -Force
iwr -useb https://registry.nudgebee.com/downloads/forager/latest/install.ps1 | iex
```

Verify:
```powershell
Get-Service NudgebeeForager
Get-EventLog -LogName Application -Source NudgebeeForager -Newest 20
```

### Option 3: Docker

```bash
docker pull registry.nudgebee.com/nudgebee-forager:latest
docker stop nudgebee-forager
docker rm nudgebee-forager
docker run -d --name nudgebee-forager \
  -e NB_RELAY_URL=<RELAY_URL> \
  -e NB_ACCESS_KEY=<ACCESS_KEY> \
  -e NB_ACCESS_SECRET=<ACCESS_SECRET> \
  -v forager-data:/data \
  --restart unless-stopped \
  registry.nudgebee.com/nudgebee-forager:latest
```

The `forager-data` named volume survives the `rm`, so data persists. If you mounted a config file, re-mount it on the new container.

### Option 4: Docker Compose

```bash
# From the directory containing docker-compose.yaml
docker compose pull
docker compose up -d
```

Compose re-creates the container with the fresh image and keeps the volume. If you pinned a specific tag in the compose file (instead of `:latest`), edit it first:

```yaml
# docker-compose.yaml
services:
  forager:
    image: registry.nudgebee.com/nudgebee-forager:2026-04-03T09-18-00_05dfc46  # change this
```

Then:
```bash
docker compose pull
docker compose up -d
```

### Option 5: Helm

**To the latest chart + latest image:**
```bash
helm repo update   # if you're using a Helm repo mirror
helm upgrade nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  --reuse-values
```

**To a specific image tag** (without changing other values):
```bash
helm upgrade nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  --reuse-values \
  --set image.tag=<tag>
```

**With a custom `values.yaml`:**
```bash
helm upgrade nudgebee-forager \
  oci://registry.nudgebee.com/nudgebee-forager-chart \
  -f values.yaml
```

Watch the rollout:
```bash
kubectl -n <namespace> rollout status deployment/nudgebee-forager-nudgebee-forager-chart
kubectl -n <namespace> logs -l app.kubernetes.io/name=nudgebee-forager-chart --tail=100 -f
```

## Verify the Upgrade

After any upgrade:

1. **Connection status** — the NudgeBee UI should show the agent as "Connected" within ~10 seconds. If it flips to "Not Connected" and stays there, see [Troubleshooting](./troubleshooting.md).
2. **Datasources healthy** — each configured datasource should show `status: healthy` in the agent's connection status JSON. Check via the UI or by running `SELECT 1` against one of them through NudgeBee's AI.
3. **Log sanity** — tail logs for any `ERROR` or repeated reconnect loops for 2–3 minutes:
   ```bash
   journalctl -u nudgebee-forager -f            # Linux
   docker logs -f nudgebee-forager              # Docker
   kubectl logs -f deploy/nudgebee-forager-nudgebee-forager-chart -n <ns>   # Helm
   ```

## Rollback

If the new version misbehaves, roll back to a known-good tag. The image registry keeps all past builds indexed by git SHA and by timestamp-SHA. List them:

```bash
curl -s https://registry.nudgebee.com/v2/nudgebee-forager/tags/list | jq -r .tags[]
```

**Linux / Windows:** re-run the installer with `NB_VERSION=<older-tag>`:
```bash
curl -fsSL https://registry.nudgebee.com/downloads/forager/<older-tag>/install.sh | \
  NB_VERSION=<older-tag> NB_RELAY_URL=... NB_ACCESS_KEY=... NB_ACCESS_SECRET=... bash
```

**Docker:** pull the older tag and recreate the container with it:
```bash
docker pull registry.nudgebee.com/nudgebee-forager:<older-tag>
docker stop nudgebee-forager && docker rm nudgebee-forager
docker run -d --name nudgebee-forager ... registry.nudgebee.com/nudgebee-forager:<older-tag>
```

**Helm:** use `helm rollback` (fastest, no need to know the old tag):
```bash
helm history nudgebee-forager
helm rollback nudgebee-forager <revision>
```

## Zero-downtime Upgrades (Helm only)

For Helm deployments with `replicaCount: 2+`, Kubernetes handles rolling updates automatically — one pod is replaced at a time, and the NudgeBee Relay Server tolerates the brief reconnect. Single-replica Linux/Windows/Docker installs will see a ~5–10 second outage while the binary restarts; queries received during that window are retried by the NudgeBee AI.

## Common Upgrade Problems

| Symptom | Likely cause | Fix |
|---|---|---|
| Service won't start after upgrade on Linux | Stale systemd unit file | `systemctl daemon-reload && systemctl restart nudgebee-forager` |
| Agent connects but datasources show `Not Connected` | Config push from relay not yet received after reconnect | Wait 30–60s. If it persists, restart: `systemctl restart nudgebee-forager`. |
| `401 authentication failed` after upgrade | Access key/secret rotated separately | Regenerate and re-run installer with new values |
| Windows installer fails with "cannot overwrite running binary" | Service didn't stop cleanly | `Stop-Service NudgebeeForager -Force` then re-run the installer |
| Docker `Unable to find image` on rollback | Older tag no longer cached locally | `docker pull registry.nudgebee.com/nudgebee-forager:<tag>` first |
| Helm rollback leaves pods stuck `Terminating` | Pod's `preStop` hook is slow | `kubectl delete pod <name> --grace-period=0 --force` (last resort) |

For deeper diagnostics see [Troubleshooting](./troubleshooting.md).
