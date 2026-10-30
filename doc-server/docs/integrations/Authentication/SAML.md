---
sidebar_position: 2
sidebar_label: SAML 2.0
---

# SAML 2.0 <Enterprise/> <Cloud/>

:::info[Enterprise / Cloud feature]
SAML 2.0 SSO is part of the **Enterprise** and **Cloud** editions. The free **Community** edition supports OAuth SSO (Google, Okta, OneLogin, Azure AD / B2C, Auth0), magic-link email, and built-in credentials login — see the [Authentication index](./index.md). The SAML-specific features (IdP-driven user provisioning, group-to-role mapping, role synchronization on every login) are what's gated. See [Editions](../../editions.md).
:::

## Description

Integrate NudgeBee with any SAML 2.0 compliant Identity Provider (IdP) to enable Single Sign-On (SSO) for your organization. This allows users to authenticate using their existing corporate credentials through providers such as Okta, Azure AD and others.

Unlike the OAuth-based integrations (e.g., Okta OAuth, Google OAuth), the SAML integration uses the SAML 2.0 protocol directly. This provides additional capabilities such as automatic user provisioning, group-to-role mapping, and role synchronization on every login.

:::info
This guide is applicable to both On-Prem and SaaS deployments.
:::

## How It Works

NudgeBee acts as a **SAML Service Provider (SP)**. When a user clicks the SSO login button, NudgeBee redirects them to your Identity Provider for authentication. After successful authentication, the IdP sends a signed SAML assertion back to nudgebee, which validates it and creates a session.

```mermaid
sequenceDiagram
    participant User
    participant NudgeBee as NudgeBee (SP)
    participant IdP as Identity Provider

    User->>NudgeBee: Click "SSO Login"
    NudgeBee->>IdP: SAML AuthnRequest (redirect)
    IdP->>User: Login page
    User->>IdP: Enter credentials
    IdP->>NudgeBee: SAML Response (POST to ACS URL)
    NudgeBee->>NudgeBee: Validate assertion & signature
    NudgeBee->>NudgeBee: Provision/update user & sync roles
    NudgeBee->>User: Session created, redirect to dashboard
```

## Prerequisites

Before configuring SAML, ensure you have:

1. A SAML 2.0 compliant Identity Provider (Okta, Azure AD, OneLogin, etc.)
2. Admin access to your IdP to create a SAML application
3. Admin access to your NudgeBee deployment to set environment variables
4. The NudgeBee base URL (e.g., `https://app.yourdomain.com`)

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `SAML_ENABLED` | Enable SAML authentication. Set to `true` to activate. | `true` |
| `SAML_ENTRY_POINT` | The SSO URL of your Identity Provider (IdP login endpoint). | `https://yourorg.okta.com/app/app-id/sso/saml` |
| `SAML_ISSUER` | The Entity ID that **NudgeBee** presents when it asks your IdP to authenticate someone. It identifies NudgeBee, not the IdP, and it must match the identifier registered for the NudgeBee application at your IdP. | `https://app.yourdomain.com` |
| `SAML_CERT` | The IdP's X.509 signing certificate in PEM format. Used to verify SAML assertion signatures. | See [Certificate Setup](#certificate-setup) |
| `NEXTAUTH_URL` | The base URL of your NudgeBee application. Used to construct the ACS callback URL unless `SAML_CALLBACK_BASE` is set. | `https://app.yourdomain.com` |
| `NEXTAUTH_SECRET` | A secret key used to sign session tokens. Must be a strong random string — generate one with `openssl rand -base64 32`. | `<your-random-secret>` |

:::warning[`SAML_ISSUER` identifies NudgeBee, not your IdP]
This is the single most common misconfiguration. `SAML_ISSUER` is sent **to** your identity provider so it can recognise which application is asking; it is not the provider's own Entity ID. Your provider looks up the NudgeBee application by this exact string, so it must match the identifier registered there — on AD FS, the relying party identifier. `SAML_AUDIENCE` normally holds the same value, and defaults to `SAML_ISSUER` when you leave it unset.
:::

### Optional Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SAML_AUDIENCE` | The audience NudgeBee expects to find in the assertion. This is also the NudgeBee application's identifier at your IdP, so it is normally the same value as `SAML_ISSUER`. | `SAML_ISSUER` |
| `SAML_CALLBACK_BASE` | Base URL used to build the ACS callback URL (`<base>/api/auth/saml/acs`). Set it when `NEXTAUTH_URL` is unset or differs from the URL registered at your IdP. | `NEXTAUTH_URL` |
| `SAML_GROUP_MAPPING` | JSON object mapping IdP group names to NudgeBee roles. | `{}` (no mapping) |
| `SAML_SYNC_ROLES_ON_LOGIN` | Sync user roles from SAML groups on every login. | `true` |
| `SAML_REMOVE_OLD_ROLES` | Remove roles not present in the current SAML assertion during sync. | `true` |
| `SAML_INCLUDE_UNMAPPED_GROUPS` | Pass through IdP groups that are not in the mapping as-is. | `false` |
| `SAML_SP_PRIVATE_KEY` | PEM private key used to sign outgoing authentication requests. Setting it turns signing on — see [Signed Authentication Requests](#signed-authentication-requests). | Not set (requests are unsigned) |
| `SAML_SP_CERT` | The certificate matching `SAML_SP_PRIVATE_KEY`, in PEM format. Published in SP metadata. | Not set |
| `SAML_FORCE_AUTHN` | Set to `true` to make your IdP ask for credentials on every sign-in, even when the user still has an IdP session — see [Asking for Credentials on Every Sign-In](#asking-for-credentials-on-every-sign-in). | Not set (the IdP may reuse its session) |
| `SAML_LOGOUT_URL` | Your IdP's Single Logout endpoint. Setting it makes logging out of NudgeBee end the IdP session too — see [Single Logout](#single-logout). | Not set (logout ends only the NudgeBee session) |

### Setting the Variables with Helm

Put the `SAML_*` variables under `additional_env_vars` in your Helm values, not under `nudgebee_secret`. `nudgebee_secret` accepts only a fixed list of keys, and an unknown key such as `SAML_ENABLED` makes the Helm render fail. `NEXTAUTH_URL` and `NEXTAUTH_SECRET` stay under `nudgebee_secret`.

```yaml
additional_env_vars:
  SAML_ENABLED: "true"
  SAML_ENTRY_POINT: "https://yourorg.okta.com/app/app-id/sso/saml"
  SAML_ISSUER: "https://app.yourdomain.com"
  SAML_CERT: |
    -----BEGIN CERTIFICATE-----
    ...
    -----END CERTIFICATE-----
```

If you use `nudgebee_secret.existingSecretName`, `additional_env_vars` isn't rendered; put the `SAML_*` keys in that existing Secret instead.

### Certificate Setup

The `SAML_CERT` variable should contain your IdP's X.509 signing certificate. You can provide it with or without the PEM header/footer — NudgeBee will normalize it automatically.

```env
# With PEM headers (recommended)
SAML_CERT="-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAX...
-----END CERTIFICATE-----"

# Without PEM headers (also accepted)
SAML_CERT="MIIDpDCCAoygAwIBAgIGAX..."
```

You can typically download this certificate from your IdP's SAML application settings page.

### Signed Authentication Requests

Some Identity Providers reject sign-in requests that are not digitally signed. Microsoft AD FS is the common case: when its relying party trust has **Require signed SAML authentication requests** turned on, the browser lands on an AD FS error page reading `MSIS7085: The server requires a signed SAML authentication request but no signature is present.`

:::note[Both variables are optional — skip this section unless you need it]
`SAML_SP_PRIVATE_KEY` and `SAML_SP_CERT` are optional and unset by default. **With neither set, NudgeBee sends unsigned authentication requests**, which is how it has always behaved and what most identity providers accept. Setting `SAML_SP_PRIVATE_KEY` is what switches signing on; `SAML_SP_CERT` only publishes the matching certificate in [SP metadata](#endpoints). If your sign-in works today, you do not need either of them.
:::

:::tip[Only SP-initiated login is affected]
Starting from your IdP's portal still works while this is unconfigured, because that flow sends no authentication request at all. Only the SSO button on the NudgeBee sign-in page fails.
:::

#### Step 1 — Generate a signing key pair

Run this wherever you manage your deployment's secrets. The private key stays in your environment; NudgeBee never needs a copy.

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout nudgebee-saml-sp.key \
  -out nudgebee-saml-sp.crt \
  -subj "/CN=nudgebee-saml-sp"
```

| File | Contains | Used for |
|---|---|---|
| `nudgebee-saml-sp.key` | Private key. Keep it secret. | The `SAML_SP_PRIVATE_KEY` variable |
| `nudgebee-saml-sp.crt` | Public certificate. | The `SAML_SP_CERT` variable, and upload to your IdP |

A certificate issued by your own internal CA works just as well — NudgeBee does not check who issued it. A long validity period is recommended so that rotation does not become a recurring task.

#### Step 2 — Give the certificate to your IdP

Do this **before** setting the environment variables. If NudgeBee starts signing while your IdP does not yet hold the certificate, sign-in fails signature validation instead.

For AD FS, in **AD FS Management**:

1. Open **Relying Party Trusts** and select the NudgeBee trust.
2. Open **Properties → Signature → Add…** and select `nudgebee-saml-sp.crt`.
3. On the **Advanced** tab, confirm the secure hash algorithm is **SHA-256**. NudgeBee signs with RSA-SHA256, which is the AD FS default.

For other providers, look for a "request signing", "verification certificate", or "validate signatures" setting on the SAML application.

#### Step 3 — Set the environment variables

```env
SAML_SP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0...
-----END PRIVATE KEY-----"

SAML_SP_CERT="-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAX...
-----END CERTIFICATE-----"
```

What the key variable accepts:

- **RSA keys only.** Requests are signed with RSA-SHA256, so an elliptic-curve key is rejected at startup rather than producing a signature your IdP cannot check.
- Both `BEGIN PRIVATE KEY` and `BEGIN RSA PRIVATE KEY` forms, and the base64 body on its own, the same way `SAML_CERT` works.
- Indented values and Windows line endings, both of which a YAML block or a secret manager can introduce.
- **Not** a passphrase-protected key, and **not** a key collapsed onto one line with `\n` written out as two characters. Both are common when a key is pasted into a values file, and both are refused with the variable named.

Restart the application, then confirm signing is active:

```bash
curl -s https://app.yourdomain.com/api/auth/saml/health | grep -o '"requestSigning":{[^}]*}'
```

A key NudgeBee cannot read disables SAML rather than quietly sending unsigned requests, because an unsigned request is exactly what your IdP is rejecting. The health endpoint names the offending variable in that case, and also reports when `SAML_SP_CERT` does not belong to `SAML_SP_PRIVATE_KEY` — a mismatched pair signs successfully here while your IdP rejects every request it cannot verify.

#### Rotating the signing certificate

Replace the certificate in this order so that sign-in keeps working throughout:

1. Generate a new key pair.
2. Add the new certificate to your IdP **alongside** the existing one. AD FS accepts more than one signing certificate per trust.
3. Update `SAML_SP_PRIVATE_KEY` and `SAML_SP_CERT`, then restart.
4. Remove the old certificate from your IdP.

An expiring signing certificate is reported by the [health endpoint](#health-check) 30 days ahead.

### Asking for Credentials on Every Sign-In

By default your IdP decides whether to ask for credentials. If the user still has a session at the IdP — they signed in to another application earlier, or NudgeBee signed them out after a period of inactivity — the IdP signs them straight back in without a prompt. That is standard single sign-on, and it is what most organizations want.

To make the IdP ask every time, set:

```env
SAML_FORCE_AUTHN="true"
```

NudgeBee then marks every authentication request with `ForceAuthn="true"`, and the IdP authenticates the user again even with a live session.

- **AD FS** honours this flag without further configuration.
- **Okta** honours it when the application's **Honor Force Authentication** setting is **Yes** (the default).
- It applies only to sign-ins started from the NudgeBee sign-in page. Starting from your IdP's own portal (for example the AD FS "sign in to one of the following sites" page) sends no request from NudgeBee, so there is nothing to mark.

The setting works whether or not [request signing](#signed-authentication-requests) is configured. Confirm it is active with the [health endpoint](#health-check): `config.forceAuthn` is `true`.

### Single Logout

By default, logging out of NudgeBee ends only the NudgeBee session. The user stays signed in at the IdP, so the next click on the SSO button signs them straight back in. Single Logout fixes that: NudgeBee sends your IdP a logout request, the IdP ends its own session, and the user lands back on the NudgeBee sign-in page.

:::warning[It also signs the user out of other applications]
Ending the IdP session signs the user out of every application that relies on that session, not only NudgeBee. Tell your users before you turn it on.
:::

```mermaid
sequenceDiagram
    participant User
    participant NudgeBee as NudgeBee (SP)
    participant IdP as Identity Provider

    User->>NudgeBee: Click "Logout"
    NudgeBee->>NudgeBee: End the NudgeBee session
    NudgeBee->>IdP: Signed LogoutRequest (redirect)
    IdP->>IdP: End the IdP session
    IdP->>NudgeBee: LogoutResponse (to /api/auth/saml/slo)
    NudgeBee->>User: Sign-in page
```

The NudgeBee session always ends first, so a user is logged out of NudgeBee even if the IdP step fails.

#### Step 1 — Configure request signing

Identity providers accept only **signed** logout requests. Set up [Signed Authentication Requests](#signed-authentication-requests) first: `SAML_SP_PRIVATE_KEY`, `SAML_SP_CERT`, and the certificate uploaded to your IdP. Without a signing key, the [health endpoint](#health-check) reports a warning.

#### Step 2 — Register NudgeBee's logout endpoint at your IdP

NudgeBee's Single Logout endpoint is:

```
{NEXTAUTH_URL}/api/auth/saml/slo
```

Use `SAML_CALLBACK_BASE` in place of `NEXTAUTH_URL` if you set it. Once `SAML_LOGOUT_URL` is set, the [SP metadata](#endpoints) also lists this endpoint, so re-importing the metadata URL configures it for you.

For **AD FS**, in **AD FS Management**:

1. Open **Relying Party Trusts** and select the NudgeBee trust.
2. Open **Properties → Endpoints → Add SAML…**.
3. Set **Endpoint type** to **SAML Logout**, **Binding** to **POST** (NudgeBee also accepts **Redirect**), and **Trusted URL** to the endpoint above.
4. Confirm the signing certificate from Step 1 is on the **Signature** tab.

For **Okta**, edit the SAML application's settings:

1. Under **Show Advanced Settings**, upload the signing certificate as the **Signature Certificate**.
2. Tick **Enable Single Logout**, set **Single Logout URL** to the endpoint above, and set **SP Issuer** to your `SAML_ISSUER` value.

#### Step 3 — Set `SAML_LOGOUT_URL`

Set it to your IdP's Single Logout endpoint:

| IdP | Where to find it | Typical value |
|---|---|---|
| AD FS | The `SingleLogoutService` entry in the AD FS federation metadata | `https://adfs.yourdomain.com/adfs/ls/` |
| Okta | The application's **View SAML setup instructions** page, or the `SingleLogoutService` entry in its metadata | `https://yourorg.okta.com/app/<app-name>/<app-id>/slo/saml` |

```env
SAML_LOGOUT_URL="https://adfs.yourdomain.com/adfs/ls/"
```

Restart the application, then confirm Single Logout is active:

```bash
curl -s https://app.yourdomain.com/api/auth/saml/health | grep -o '"singleLogout":{[^}]*}'
```

Users who signed in before you set the variable are logged out of NudgeBee only, until they next sign in.

#### When the IdP starts the logout

When a user signs out at the IdP, or of another application behind it, the IdP may send NudgeBee a logout request of its own. NudgeBee ends that user's NudgeBee sessions on every device and answers the IdP. It accepts such a request only if all three hold:
- it is signed with the IdP certificate in `SAML_CERT`;
- it is addressed to NudgeBee's logout endpoint;
- it was issued within the last five minutes.

## NudgeBee Service Provider Details

When creating a SAML application in your IdP, you will need to provide the following NudgeBee SP details:

| Field | Value |
|---|---|
| **ACS URL (Assertion Consumer Service)** | `{NEXTAUTH_URL}/api/auth/saml/acs` |
| **Entity ID / Audience** | The same value you set for `SAML_ISSUER` and `SAML_AUDIENCE` (e.g., `https://app.yourdomain.com`). Whatever you enter here is what your IdP will match incoming requests against. |
| **NameID Format** | `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress` |
| **Sign-on URL** | `{NEXTAUTH_URL}/api/auth/saml/login` |
| **SP Metadata URL** | `{NEXTAUTH_URL}/api/auth/saml/metadata` |

If your IdP can import a Service Provider from a URL, point it at the metadata URL instead of entering the fields by hand. The metadata carries the ACS URL, the entity id, the NameID format, the request-signing certificate when one is configured, and the Single Logout endpoint when `SAML_LOGOUT_URL` is set.

### Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/saml/login` | GET | Initiates the SAML login flow (SP-initiated SSO) |
| `/api/auth/saml/acs` | POST | Assertion Consumer Service — receives the SAML response from the IdP |
| `/api/auth/saml/metadata` | GET | Service Provider metadata for import into your IdP |
| `/api/auth/saml/health` | GET | Returns SAML configuration status and certificate health |
| `/api/auth/saml/logout` | POST, GET | Starts [Single Logout](#single-logout) from the NudgeBee Logout button. Does nothing unless `SAML_LOGOUT_URL` is set |
| `/api/auth/saml/slo` | GET, POST | Single Logout endpoint: receives the IdP's logout response, and logout requests the IdP starts |

## SAML Attribute Mapping

NudgeBee automatically extracts user attributes from the SAML assertion. The following attribute names are supported:

### Email (required)

NudgeBee looks for the user email in this order:
- `email`
- `mail`
- `nameID` (fallback)

### Display Name (optional)

- `displayName`
- `name`
- `firstName` + `lastName` (combined)

### Groups / Roles (optional)

NudgeBee checks for group information using these attribute names:
- `groups`
- `Group`
- `memberOf`
- `roles`
- `Role`
- `http://schemas.xmlsoap.org/claims/Group`
- `http://schemas.microsoft.com/ws/2008/06/identity/claims/groups`

:::tip
Configure your IdP to send one of the above group attributes in the SAML assertion to enable automatic role mapping.
:::

## Group-to-Role Mapping

NudgeBee can automatically map IdP groups to NudgeBee roles on every login. This ensures users always have the correct permissions based on their IdP group membership.

### Configuration

Set the `SAML_GROUP_MAPPING` environment variable to a JSON object where keys are IdP group names and values are NudgeBee role names:

```env
SAML_GROUP_MAPPING='{"idp-admins":"tenant_admin","idp-developers":"tenant_admin","idp-viewers":"tenant_admin_readonly"}'
```

### Available NudgeBee Roles

| Role | Description |
|---|---|
| `tenant_admin` | Full access to the tenant |
| `tenant_admin_readonly` | Read-only access to the tenant |

### Behavior Options

- **`SAML_SYNC_ROLES_ON_LOGIN=true`** (default): User roles are updated from the SAML assertion on every login. This ensures roles stay in sync with your IdP.
- **`SAML_REMOVE_OLD_ROLES=true`** (default): Roles that are no longer present in the SAML assertion are removed. Set to `false` to only add new roles without removing existing ones.
- **`SAML_INCLUDE_UNMAPPED_GROUPS=true`**: IdP groups that are not listed in `SAML_GROUP_MAPPING` are passed through as-is. Useful when your IdP group names already match NudgeBee role names.

### Example

If a user belongs to IdP groups `["developers", "viewers"]` and your mapping is:

```json
{
  "developers": "tenant_admin",
  "viewers": "tenant_admin_readonly"
}
```

## User Provisioning

SAML integration supports **automatic user provisioning** — users are created in NudgeBee on their first SAML login. No pre-registration is required.

### How Provisioning Works

1. **Existing user found by SAML account**: User is logged in directly.
2. **Existing user found by email**: The SAML account is linked to the existing user.
3. **No existing user**: A new user is created automatically.

### On-Prem Deployments

- The user is created under the tenant specified in your license.
- New users get the role set in `AUTH_DEFAULT_ROLE`.
- When `SAML_GROUP_MAPPING` is set and no group matches, role sync falls back to the tenant's `auth_default_role`, then `AUTH_DEFAULT_ROLE`.

### SaaS Deployments

- The user's email domain is matched to a tenant via the `allowed_domains` tenant attribute.
- The default role is determined by the `auth_default_role` tenant attribute.

## Health Check

NudgeBee provides a health check endpoint to monitor your SAML configuration and certificate status:

```
GET /api/auth/saml/health
```

**Response:**

```json
{
  "enabled": true,
  "status": "healthy",
  "certificate": {
    "expired": false,
    "expiringSoon": false,
    "expiresAt": "2025-12-01T00:00:00.000Z",
    "daysUntilExpiry": 365
  },
  "requestSigning": {
    "enabled": true,
    "certificate": {
      "expired": false,
      "expiringSoon": false,
      "expiresAt": "2035-09-01T00:00:00.000Z",
      "daysUntilExpiry": 3650
    }
  },
  "singleLogout": {
    "enabled": true,
    "logoutUrl": "https://yourorg.okta.com/app/.../slo/saml",
    "logoutCallbackUrl": "https://app.yourdomain.com/api/auth/saml/slo"
  },
  "config": {
    "entryPoint": "https://yourorg.okta.com/app/.../sso/saml",
    "issuer": "https://app.yourdomain.com",
    "callbackUrl": "https://app.yourdomain.com/api/auth/saml/acs",
    "forceAuthn": true
  },
  "messages": []
}
```

`requestSigning.enabled` is `false` on deployments that have not configured [signed authentication requests](#signed-authentication-requests), and the `certificate` block is then absent. A signing certificate that cannot be read is reported as `requestSigning.error`.

`singleLogout.enabled` and `config.forceAuthn` are `false` unless `SAML_LOGOUT_URL` and `SAML_FORCE_AUTHN` are set. Single Logout configured without a signing key raises the status to `warning`, because most IdPs refuse an unsigned logout request.

**Status values:**
- `healthy` — Certificate is valid with more than 30 days remaining.
- `warning` — Certificate expires within 30 days, or Single Logout is configured without a signing key.
- `error` — Certificate has expired, or a configured signing key cannot be read. SAML login will fail.

## Troubleshooting

| Issue | Possible Cause | Solution |
|---|---|---|
| SAML login button does not appear | `SAML_ENABLED` is not set to `true` | Set `SAML_ENABLED=true` and restart the application |
| "SAML not configured" error | Missing required environment variables | Ensure `SAML_ENTRY_POINT`, `SAML_ISSUER`, `SAML_CERT`, and `NEXTAUTH_URL` (or `SAML_CALLBACK_BASE`) are all set |
| Signature validation fails | Incorrect or expired IdP certificate | Download a fresh certificate from your IdP and update `SAML_CERT` |
| User gets "not allowed" error | User account is suspended in NudgeBee | Check the user's status in NudgeBee and reactivate if needed |
| Groups/roles not syncing | Group attribute not sent in assertion | Verify your IdP is configured to send group attributes (see [SAML Attribute Mapping](#saml-attribute-mapping)) |
| Groups/roles not mapping correctly | Incorrect `SAML_GROUP_MAPPING` value | Ensure the JSON is valid and the IdP group names match exactly (case-sensitive) |
| "Invalid session data" error | Session token expired (took >60 seconds) | Check network latency between IdP and NudgeBee; ensure clocks are synchronized |
| User created but wrong role | Default role misconfigured | On-Prem: check `AUTH_DEFAULT_ROLE`. SaaS: check the tenant's `auth_default_role` attribute |
| Certificate expiry warning | IdP certificate is expiring soon | Download a new certificate from your IdP and update `SAML_CERT`; use `/api/auth/saml/health` to monitor |
| IdP reports that a signed authentication request is required (AD FS `MSIS7085`) | The IdP requires signed requests and NudgeBee is not configured to sign them | Configure [Signed Authentication Requests](#signed-authentication-requests). To confirm the diagnosis first, note that signing in from the IdP portal still works while the SSO button does not |
| SAML login button disappears right after setting `SAML_SP_PRIVATE_KEY` | The key is malformed, or is protected by a passphrase | Check `/api/auth/saml/health` — it names the variable. Re-export the key in PEM form without a passphrase |
| Signature validation fails only after enabling request signing | The IdP does not hold the matching certificate, or holds an older one | Upload `nudgebee-saml-sp.crt` to the IdP and confirm the hash algorithm is SHA-256 |
| Metadata URL returns `SAML_SP_CERT is required` | A signing key is set without its certificate | Set `SAML_SP_CERT` to the certificate matching `SAML_SP_PRIVATE_KEY` |
| After logging out, clicking SSO signs the user straight back in | The IdP session is still active; NudgeBee only ended its own session | Configure [Single Logout](#single-logout) so logout also ends the IdP session |
| Users are signed in without a password after an idle timeout | The IdP reuses its session, which is standard SSO | Set `SAML_FORCE_AUTHN=true` — see [Asking for Credentials on Every Sign-In](#asking-for-credentials-on-every-sign-in) |
| `SAML_FORCE_AUTHN` is set but the IdP still does not prompt | Sign-in was started from the IdP's portal, or the IdP ignores the flag (Okta: **Honor Force Authentication** is **No**) | Start from the NudgeBee sign-in page; on Okta set **Honor Force Authentication** to **Yes** |
| Logout ends on an IdP error page | The logout request is unsigned, the IdP does not hold the signing certificate, or NudgeBee's logout endpoint is not registered | Check `/api/auth/saml/health`, upload `SAML_SP_CERT` to the IdP, and register `{NEXTAUTH_URL}/api/auth/saml/slo` as its SAML Logout endpoint |
| Health reports the certificate does not match the key | The key was regenerated and the old certificate was left in place | Re-export the certificate from the current key, upload it to the IdP, then update `SAML_SP_CERT` |
| IdP reports an unknown or unsupported application (AD FS `MSIS7007`) | `SAML_ISSUER` does not match the identifier registered for NudgeBee at the IdP | Set `SAML_ISSUER` to that identifier — see the warning under [Required Environment Variables](#required-environment-variables) |
| Sign-in fails on an audience mismatch | `SAML_AUDIENCE` is unset, so it fell back to `SAML_ISSUER`, or the two hold different values | Set both to the NudgeBee application's identifier at your IdP |

## Notes

- SAML authentication supports automatic user provisioning — users do not need to be pre-created in NudgeBee.
- Multiple authentication providers can be enabled alongside SAML (e.g., Google OAuth + SAML).
- The SAML integration uses SP-initiated SSO. The login flow starts from the NudgeBee sign-in page.
- `SAML_FORCE_AUTHN` and `SAML_LOGOUT_URL` are independent and both opt-in; with neither set, sign-in and logout behave as before.
- If you have any issues or require more details, please contact our support.

## Related

- [Authentication](./index.md)
