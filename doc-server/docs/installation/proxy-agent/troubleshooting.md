---
sidebar_position: 6
---

# Troubleshooting

## Agent Won't Connect

**Symptoms:** Agent logs show connection errors or the agent status in the UI stays "Not Connected".

**Check these:**

1. **Network access** — The agent needs outbound HTTPS (port 443) to `relay.nudgebee.com`. Test with:
   ```bash
   curl -I https://relay.nudgebee.com/status
   ```
   You should get `HTTP/2 200`.

2. **Credentials** — Verify `NB_ACCESS_KEY` and `NB_ACCESS_SECRET` match what the NudgeBee UI shows. A wrong secret produces:
   ```
   {"level":"ERROR","msg":"authentication failed, retrying..."}
   ```

3. **Firewall / Proxy** — If behind a corporate proxy, WebSocket connections may be blocked. Check with your network team that `wss://` connections are allowed.

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
   ```bash
   # PostgreSQL
   pg_isready -h <HOST> -p <PORT>

   # Or generic TCP check
   nc -zv <HOST> <PORT>
   ```

2. **Credentials** — Wrong username/password will show in agent logs:
   ```
   {"level":"ERROR","msg":"database connection failed","err":"password authentication failed for user ..."}
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
   ```bash
   # Docker
   docker logs nudgebee-forager --tail 50

   # Kubernetes
   kubectl logs <forager-pod> --tail 50
   ```

## Getting Help

If you're still stuck:
1. Collect agent logs: `docker logs nudgebee-forager` or `kubectl logs <pod>`
2. Note the account ID and datasource ID
3. Contact NudgeBee support with the logs and details
