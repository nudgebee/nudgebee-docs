---
sidebar_position: 10
---
# Security

## Authentication​
- Currently supports Google/Azure/Okta/Auth0 for SingleSingOn. We don't maintain passwords for users. If a user doesn't have SingleSignOn, then they can use magic email links for login.
- Credentials specific to external integration are stored as encrypted using AES with GCM.

## Authorization
- Currently, Nudgebee supports tenant level authorization with 2 roles(admin, readonly)

## Audit
- User Operations are tracked and Can be viewed on UI.
