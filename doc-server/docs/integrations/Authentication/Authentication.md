# Authentication

This document explains how to integrate various authentication systems with your Nudgebee application. Nudgebee utilizes a flexible authentication system that supports a wide array of identity providers, allowing you to choose the method that best suits your organization's needs.

Note - This guide is only applicable to On-Prem license.

## Authentication Providers

Nudgebee supports several authentication providers. Each provider requires specific configuration to work properly.

### Table of Contents

-   [Google](#google)
-   [Okta](#okta)
-   [OneLogin](#onelogin)
-   [Azure Active Directory (Azure AD)](#azure-active-directory-azure-ad)
-   [Azure Active Directory B2C (Azure AD B2C)](#azure-active-directory-b2c-azure-ad-b2c)
-   [Auth0](#auth0)
-   [Email (Magic Link)](#email-magic-link)
-   [Dummy Credentials (For On-Prem Admin)](#dummy-credentials-for-on-prem-admin)
-   [LDAP](#ldap)
- [General Notes](#general-notes)

## Google

### Description

Integrate Nudgebee with Google to allow users to sign in using their existing Google accounts.

### Configuration

To set up Google authentication, you need to configure the following environment variables:

-   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
-   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.

### Notes

-   This integration allows users to link multiple accounts with the same email address.
- When redirecting users to the Google login page, the system will request consent for offline access.

## Okta

### Description

Integrate Nudgebee with Okta to enable users to sign in using their Okta credentials.

### Configuration

To set up Okta authentication, you need to configure the following environment variables:

-   `OKTA_CLIENT_ID`: Your Okta application Client ID.
-   `OKTA_CLIENT_SECRET`: Your Okta application Client Secret.
-   `OKTA_ISSUER`: Your Okta organization issuer URL (e.g., `https://dev-123456.okta.com`).

### Notes

-   This integration allows users to link multiple accounts with the same email address.
- Issuer: Please provide the full URL as the issuer of the Okta organization.

## OneLogin

### Description

Integrate Nudgebee with OneLogin as an identity provider.

### Configuration

To set up OneLogin authentication, you need to configure the following environment variables:

-   `ONELOGIN_CLIENT_ID`: Your OneLogin application Client ID.
-   `ONELOGIN_CLIENT_SECRET`: Your OneLogin application Client Secret.
-   `ONELOGIN_ISSUER`: Your OneLogin organization issuer URL.

### Notes

-   This integration allows users to link multiple accounts with the same email address.
- `issuer`: Please provide full url as issuer of the onelogin org.

## Azure Active Directory (Azure AD)

### Description

Integrate Nudgebee with Azure AD to allow users to sign in using their Azure AD accounts.

### Configuration

To set up Azure AD authentication, you need to configure the following environment variables:

-   `AZURE_AD_CLIENT_ID`: Your Azure AD application Client ID.
-   `AZURE_AD_CLIENT_SECRET`: Your Azure AD application Client Secret.
-   `AZURE_AD_TENANT_ID`: Your Azure AD tenant ID.

### Notes

-   This integration allows users to link multiple accounts with the same email address.

## Azure Active Directory B2C (Azure AD B2C)

### Description

Integrate Nudgebee with Azure AD B2C for customer identity and access management.

### Configuration

To set up Azure AD B2C authentication, you need to configure the following environment variables:

-   `AZURE_AD_B2C_CLIENT_ID`: Your Azure AD B2C application Client ID.
-   `AZURE_AD_B2C_CLIENT_SECRET`: Your Azure AD B2C application Client Secret.
-   `AZURE_AD_B2C_TENANT_NAME`: Your Azure AD B2C tenant name.
-   `AZURE_AD_B2C_PRIMARY_USER_FLOW`: Your primary Azure AD B2C user flow.

### Notes

-   This integration allows users to link multiple accounts with the same email address.
- Primary User Flow: Please provide the correct primary user flow name for authentication.
- System will request `offline_access openid` during auth.

## Auth0

### Description

Integrate Nudgebee with Auth0 as an identity provider.

### Configuration

To set up Auth0 authentication, you need to configure the following environment variables:

-   `AUTH0_CLIENT_ID`: Your Auth0 application Client ID.
-   `AUTH0_CLIENT_SECRET`: Your Auth0 application Client Secret.
-   `AUTH0_ISSUER`: Your Auth0 domain issuer URL.

### Notes

-   This integration allows users to link multiple accounts with the same email address.
- `issuer`: Please provide full url as issuer of the auth0 org.

## Email (Magic Link)

### Description

Allow users to sign in using a magic link sent to their email address. This is a passwordless authentication method that simplifies the login process.

### Configuration

To set up email authentication, you need to configure the following environment variables related to your email server:

-   `EMAIL_SERVER_HOST`: The host of your email server.
-   `EMAIL_SERVER_PORT`: The port of your email server (e.g., `465`).
-   `EMAIL_SERVER_USER`: The username for your email server.
-   `EMAIL_SERVER_PASSWORD`: The password for your email server.
-   `EMAIL_FROM`: The email address to send emails from.
-   `NEXTAUTH_MAGICLINK_CREDS_ENABLED`: If set to true this will enabled magiclink login support, by default set to true.

### Notes

-   The email provider sends a verification token to the user's email.
-   Correct email server configuration is essential for this provider to function.
- Login Process: Users request sign-in and will receive an email. The email link will redirect to our system, where we verify the link and create/update the user and update the user access time.

## Dummy Credentials (For On-Prem Admin)

### Description

Provides a simple username/password login for an on-premise administrator user. This method is intended for initial setup or development environments.

### Configuration

To set up dummy credentials, you need to configure the following environment variables:

-   `NEXTAUTH_DUMMY_CREDS_ENABLED`: Set to `true` to enable this provider. When doing first time integration.
-   `NEXTAUTH_DUMMY_CREDS_PASSWORD`: The password for the dummy credentials.

### Notes

-   **Security**: This provider is primarily for on-premise admin user, first time setup or initial onboarding. It is strongly recommended to disable this provider in production environments.
- Dummy credentials only supports username in email format.
- Email field needs to match email provided in license file.

## LDAP

### Description

Integrate Nudgebee with an LDAP server to authenticate users against your existing directory.

### Configuration

To set up LDAP authentication, you need to configure the following environment variables:

-   `NEXTAUTH_LDAP_URI`: The LDAP server URI (e.g., `ldap://localhost:389`).
-   `NEXTAUTH_LDAP_LOGIN_FILTER`: The filter used for authenticating a user during login (e.g., `(uid=%s)`).
-   `NEXTAUTH_LDAP_SEARCH_FILTER`: The filter used for searching user attributes (e.g., `(uid=%s)`).
-   `NEXTAUTH_LDAP_SEARCH_DN`: The distinguished name for searching users.
-   `NEXTAUTH_LDAP_BIND_DN`: The distinguished name for bind user to search other user attributes.
-   `NEXTAUTH_LDAP_BIND_PASSWORD`: The password for bind user to search other user attributes.
-   `NEXTAUTH_LDAP_ATTRIBUTE_EMAIL`: The LDAP attribute for the user's email (default: `mail`).
-   `NEXTAUTH_LDAP_ATTRIBUTE_GROUP`: The LDAP attribute for the user's groups (default: `memberOf`).
-   `NEXTAUTH_LDAP_ATTRIBUTE_NAME`: The LDAP attribute for the user's name (default: `name`).
-   `NEXTAUTH_LDAP_ATTRIBUTE_FIRSTNAME`: LDAP Attribute for user firstName(default: `gn`)
-   `NEXTAUTH_LDAP_ATTRIBUTE_LASTNAME`: LDAP Attribute for user lastName (default: `sn`)
-   `NEXTAUTH_LDAP_GROUP_MAPPING`: LDAP Group mapping for hasura roles (default: `{}`)

### Notes

-   LDAP configuration requires knowledge of your LDAP server's schema.
- LDAP support only for onPrem license type.
- By default, the system will look for the user's email from the `mail` attribute, group from `memberOf`, user name from `name`, firstName from `gn`, and lastName from `sn`.
- Group mappings will be used for assigning `hasura roles`.

## General Notes

-   **Multiple Providers:** You can enable multiple authentication providers simultaneously, giving your users flexibility in how they choose to sign in.
- **Environment Variables**: Ensure all required environment variables are correctly set using Helm chart secrets.
- If you have any issues or require more details, please contact our support.
