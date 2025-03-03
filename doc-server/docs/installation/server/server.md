---
sidebar_position: 2
---
# Server

The Nudgebee Server is the central component of the Nudgebee platform. It receives data from Nudgebee Agents, performs analysis, and handles user authentication and integrates with external services.


## Architecture


![Server Architecture](/img/nb_server_architecture.png)



## Prerequisites

Before installing the Nudgebee Server, ensure the following requirements are met:

### Software

- **Helm:** The Nudgebee Server is deployed using [Helm](https://helm.sh/). Ensure that Helm is installed and configured on your system.
- **Kubernetes:** The minimum supported Kubernetes version is 1.27. The server has been tested on this version and newer versions.

### Network

- **Docker Registry Access:** The installer must be able to access `registry.nudgebee.com` to pull necessary Docker images.
- **API Resolution:** Authentication uses the `BASE_URL` to resolve APIs. Therefore, pods must be able to resolve the `BASE_URL` DNS entry.
- **External Integrations:** External integrations (such as Slack, Jira, MS Teams, GitHub Issues, and OpenAI) require network connectivity from the Nudgebee Server.
- **Bidirectional Integrations:** If bidirectional integration is used (e.g., with Slack), then Slack must be able to access the Nudgebee Server's DNS.
- **GitHub API Access:** The Nudgebee Server uses `https://api.github.com` to collect the latest release information.



