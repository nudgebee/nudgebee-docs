---
sidebar_position: 16
sidebar_label: Network Tasks
---

# Network Tasks

Network diagnostics and connectivity testing.

## `network.ping`

**Display Name:** Ping

Send ICMP ping packets to check if a host is reachable and measure latency.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | Yes | Hostname or IP address to ping. |
| `count` | number | No | Number of packets to send. Default: `3`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `reachable` | boolean | True if any packets were received. |
| `packet_loss` | number | Percentage of packets lost. |
| `avg_latency` | number | Average round-trip time in milliseconds. |

---

## `network.dns`

**Display Name:** DNS Lookup

Look up DNS records for a domain.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `domain` | string | Yes | Domain name to query. |
| `type` | string | No | DNS record type. Options: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`. Default: `A`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `domain` | string | Queried domain. |
| `type` | string | Queried record type. |
| `answer` | any | DNS query results. |

---

## `network.tcp`

**Display Name:** TCP Check

Test if a host and port are reachable over TCP. Optionally send a payload and read the response.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | Yes | Hostname or IP address. |
| `port` | string | Yes | TCP port number. |
| `timeout` | string | No | Connection timeout. Default: `5s`. |
| `message` | string | No | Payload to send after connecting. |
| `read_timeout` | string | No | Timeout for reading a response. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `host` | string | Checked host. |
| `port` | string | Checked port. |
| `reachable` | boolean | True if connection succeeded. |
| `response` | string | Response from the server (if any). |
| `error` | string | Error message (if any). |

---

## `network.ssl`

**Display Name:** SSL Check

Check SSL/TLS certificate validity and expiration for a host.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | Yes | Hostname to check. |
| `port` | string | No | Port. Default: `443`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `subject` | string | Certificate subject (Common Name). |
| `issuer` | string | Certificate issuer (Common Name). |
| `not_after` | string | Expiration date (RFC3339). |
| `valid` | boolean | True if the certificate is currently valid. |

---

## `network.traceroute`

**Display Name:** Traceroute

Trace the network path to a host to diagnose routing issues.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | Yes | Destination hostname or IP. |
| `max_hops` | number | No | Maximum TTL (hops). Default: `30`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `hops` | array | List of hops with IP and latency. |
| `raw` | string | Raw traceroute output. |

---

## `network.whois`

**Display Name:** Whois

Look up domain registration and ownership details.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `domain` | string | Yes | Domain name to query. |
| `server` | string | No | Specific WHOIS server to query. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `raw` | string | Raw WHOIS response text. |
| `server` | string | The WHOIS server that answered. |

---

## `network.ntp`

**Display Name:** NTP Check

Check if a server's clock is in sync with an NTP time server.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | No | NTP server hostname. Default: `pool.ntp.org`. |
| `port` | string | No | NTP port. Default: `123`. |
| `timeout` | string | No | Timeout. Default: `5s`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `server` | string | NTP server used. |
| `drift_seconds` | number | Time difference in seconds (local time minus NTP time). |
