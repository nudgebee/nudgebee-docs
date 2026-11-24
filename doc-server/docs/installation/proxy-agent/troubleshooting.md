---
sidebar_position: 7
---

# Troubleshooting

## Agent Won't Connect

**Symptoms:** Agent logs show connection errors or the agent status in the UI stays "Not Connected".

**Check these:**

1. **Network access** — The agent needs outbound HTTPS (port 443) to your NudgeBee Relay Server. Test with:

   **Linux:**
   ```bash
   curl -i https://<RELAY_HOST>/status
   ```
   **Windows:**
   ```powershell
   Invoke-WebRequest -Uri https://<RELAY_HOST>/status -Method Get
   ```
   Replace `<RELAY_HOST>` with your relay URL (provided in the NudgeBee UI). You should get a `200` response.

2. **Credentials** — Verify `NB_ACCESS_KEY` and `NB_ACCESS_SECRET` match what the NudgeBee UI shows. A wrong secret makes the session end right after connecting, and the agent keeps reconnecting:
   ```
   {"level":"ERROR","msg":"websocket session ended","err":"..."}
   {"level":"INFO","msg":"reconnecting to relay","delay":"..."}
   ```

   If the log shows `bad handshake (status=401 ...)` with *invalid credentials*, the server rejected the access key or secret:
   ```
   dial failed: websocket: bad handshake (status=401 body="invalid credentials ...")
   ```
   Regenerating the Proxy Agent token changes **both** the access key and the secret. Regenerate it in the Proxy Agent integration, then update `access_key` and `access_secret` in the agent's config file and restart the agent. Re-running the install script doesn't replace an existing config file; alternatively, delete the config file and install again. The server caches a failed credential for about a minute, so the first retry after fixing it can still fail.

3. **Firewall / Proxy** — If behind a corporate proxy, WebSocket connections may be blocked. Check with your network team that `wss://` connections are allowed.

4. **Two agents with the same access key** — If the same key runs in two places (for example the agent was installed twice, or with both the install script and Docker), the two agents keep taking the connection from each other and requests time out. Run one agent per access key: stop the extra one, or create a separate Proxy Agent for it.

## Install Script Slow or Stuck

**Symptoms:** The Linux or macOS install script stays at *Downloading forager from ...* for a long time.

Downloads from GitHub can be slow on some networks. Download the binary (and, for VM discovery, `linux-inventory-v2.yaml`) from the [releases page](https://github.com/nudgebee/forager/releases) separately, lay them out like the releases page, and point `NB_DOWNLOAD_URL` at that directory:

```bash
mkdir -p /tmp/forager/latest/download
# put nudgebee-forager-<os>-<arch> and linux-inventory-v2.yaml in /tmp/forager/latest/download/
curl -fsSL <install.sh URL from the dialog> \
  | sudo NB_DOWNLOAD_URL=file:///tmp/forager NB_ACCESS_KEY=<ACCESS_KEY> NB_ACCESS_SECRET=<ACCESS_SECRET> ... bash
```

`NB_DOWNLOAD_URL` also accepts an HTTPS mirror with the same path layout as GitHub releases (`<base>/latest/download/<file>`, `<base>/download/<tag>/<file>`).

## Agent Connected but No Datasources

**Symptoms:** Agent logs show `connected to relay, greeting sent` but no datasource config sync.

**Possible causes:**

- **No integrations configured** — Go to Admin → Integrations → Databases and add a datasource with connection mode "Proxy Agent".
- **Wrong account** — The agent's access key is tied to a specific account. Make sure the integration is created in the same account.
- **Relay not updated** — If running a self-hosted relay, ensure it's on the latest version that supports config sync on connect.

## Datasource Shows Unhealthy

**Symptoms:** The datasource appears in NudgeBee but shows a red/unhealthy status.

**Check these:**

1. **Network from agent to database** — The agent needs to reach the database host:port. From the agent machine:

   **Linux:**
   ```bash
   nc -zv <HOST> <PORT>
   ```
   **Windows:**
   ```powershell
   Test-NetConnection -ComputerName <HOST> -Port <PORT>
   ```

2. **Credentials** — Wrong username/password will show in agent logs. For integrations pushed from NudgeBee the line is `failed to configure proxy`:
   ```
   {"level":"ERROR","msg":"failed to configure proxy","err":"connection test failed: ... password authentication failed for user ..."}
   ```
   For datasources in the local config file it is `failed to configure datasource`, with a `name` field naming the datasource:
   ```
   {"level":"ERROR","msg":"failed to configure datasource","name":"...","err":"connection test failed: ... password authentication failed for user ..."}
   ```

3. **SSL/TLS** — If the database requires SSL, set `ssl_mode: require` in the config or enable SSL in the integration settings.

4. **Database name** — Verify the database name exists and the user has access to it.

## Query Errors

### "datasource not found"

```
{"error":"datasource <id> not found"}
```

The agent doesn't have this datasource configured. This can happen if:
- The agent was restarted and the config push hasn't completed yet (wait a few seconds)
- The integration was deleted but the cache hasn't expired

### "query execution failed: syntax error"

The AI generated invalid SQL. This is not an agent issue — the query itself is wrong. Try rephrasing your question.

### "connection refused" or "timeout"

The agent can't reach the database. Check network connectivity from the agent host to the database host:port.

## Agent Keeps Disconnecting

**Symptoms:** Agent repeatedly logs `connected` then `disconnected` or goes silent.

**Check these:**

1. **Resource limits** — If running in Docker/Kubernetes, ensure the agent has enough memory (128Mi minimum). OOM kills cause silent restarts.

2. **Network stability** — Intermittent network issues between the agent and relay will cause reconnections. The agent auto-reconnects, but check your network path.

3. **Agent logs** — Look for errors before the disconnect:

   **Linux (systemd):**
   ```bash
   journalctl -u nudgebee-forager --tail 50
   ```
   **macOS (launchd):**
   ```bash
   tail -n 50 /usr/local/var/log/nudgebee-forager.log
   ```
   **Windows** — `Get-Service` only shows status, not logs. To see actual log output, stop the service and run the binary directly in a PowerShell window:
   ```powershell
   Stop-Service NudgebeeForager
   & "C:\Program Files\NudgeBee\nudgebee-forager.exe" --config C:\ProgramData\NudgeBee\forager.yaml
   ```
   **Docker:**
   ```bash
   docker logs nudgebee-forager --tail 50
   ```
   **Kubernetes:**
   ```bash
   kubectl logs <forager-pod> --tail 50
   ```

## Windows Service Issues

### Service stuck in "Stopping" during upgrade

If the installer hangs with repeated `WARNING: Waiting for service to stop...` messages, the service is not shutting down in time. This was fixed in a recent release. Upgrade to the latest version:

```powershell
$env:NB_RELAY_URL="<RELAY_URL>"
$env:NB_ACCESS_KEY="<ACCESS_KEY>"
$env:NB_ACCESS_SECRET="<ACCESS_SECRET>"
Set-ExecutionPolicy Bypass -Scope Process -Force
iwr -useb https://github.com/nudgebee/forager/releases/latest/download/install.ps1 | iex
```

If the service is still stuck, force-stop it first, then re-run the installer:

```powershell
Stop-Service NudgebeeForager -Force
```

### Service fails to start

Check that the config file exists and is valid:

```powershell
Test-Path C:\ProgramData\NudgeBee\forager.yaml
Get-Content C:\ProgramData\NudgeBee\forager.yaml
```

Verify the binary is present:

```powershell
Test-Path "C:\Program Files\NudgeBee\nudgebee-forager.exe"
```

To test your config before starting the service, run the binary directly in a PowerShell window (not as a service). This shows log output directly:

```powershell
& "C:\Program Files\NudgeBee\nudgebee-forager.exe" --config C:\ProgramData\NudgeBee\forager.yaml
```

Press `Ctrl+C` to stop. Fix any errors shown, then start the service:

```powershell
Start-Service NudgebeeForager
```

### Check service status

```powershell
Get-Service NudgebeeForager
```

Expected output when healthy:
```
Status   Name               DisplayName
------   ----               -----------
Running  NudgebeeForager    NudgeBee Forager
```

## VM Discovery

For VMs that don't appear, scans that fail, and NuBi commands that fail on a VM, see [Troubleshooting self-hosted VMs](../../features/VM/troubleshooting.md).

## Getting Help

If you're still stuck:
1. Collect agent logs: `docker logs nudgebee-forager` or `kubectl logs <pod>`
2. Note the account ID and datasource ID
3. For Community / OSS users, open an issue at [nudgebee/forager](https://github.com/nudgebee/forager/issues) with the logs. Enterprise / Cloud users can contact NudgeBee support.
