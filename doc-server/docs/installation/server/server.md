---
sidebar_position: 2
---
# Server

### Architecture


![Server Architecture](/img/nb_server_architecture.png)



## Network Requirements
- Installer requires access to `registry.nudgebee.com` to pull docker images
- Authentication uses `BASE_URL` to resolve APIs, so Pods should be able to resolve `BASE_URL` DNS
- Any External Integration like Slack/Jira/MSTeams/GithuIssues/OpenAi, requires connectivity from Server
- If Bidirection Integration is supported for example in Slack, then Slack should be able to hit Server DNS
- Nudgebee Runs Schedule jobs to collect AWS pricing information
- Nudgebee uses `https://api.github.com` to collect latest release information


