---
sidebar_position: 11
---
# Security

## Authentication​
- Currently supports Google/Azure/Okta/Auth0 for Single Sign-On. We don't maintain passwords for users. If a user doesn't have Single Sign-On, then they can use magic email links for login.
- Credentials specific to external integrations are stored as encrypted using AES with GCM.

## Authorization
- Currently, NudgeBee supports tenant level authorization with 2 roles(admin, readonly)

## Audit
- User operations are tracked and can be viewed on the UI.

### Add User and Roles

<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/390ad667dd814200b9a0c6f85dda7c00?sid=e31157c7-051b-43b6-be78-ba2560a49920" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>

### Tenant Roles
<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/12011b18e5a848dfb2cfa832457622ca?sid=00107068-55ec-45d5-ab26-0eb3e3f869cf" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>

### Account Roles
<div style={{"position": "relative", "paddingBottom": "56.25%", "height": "0"}}><iframe src="https://www.loom.com/embed/0318fdb34d3d46f5ad3dd9c693bb31eb?sid=0b2175ce-feac-47a9-8acb-f445ac508877" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style={{"position": "absolute", "top": "0", "left": "0", "width": "100%", "height": "100%"}}></iframe></div>