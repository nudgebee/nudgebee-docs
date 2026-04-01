---
sidebar_position: 16
sidebar_label: Crypto Tasks
---

# Crypto Tasks

Encode, decode, hash, encrypt, and decrypt data.

## `crypto.encode`

**Display Name:** Encode

Encode data to Base64 or Hex format.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `data` | string | Yes | Data to encode. |
| `algorithm` | string | Yes | Encoding algorithm. Options: `base64`, `hex`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Encoded data. |

---

## `crypto.decode`

**Display Name:** Decode

Decode data from Base64 or Hex format.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `data` | string | Yes | Data to decode. |
| `algorithm` | string | Yes | Decoding algorithm. Options: `base64`, `hex`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Decoded data. |

---

## `crypto.hash`

**Display Name:** Hash

Generate a hash digest of data.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `data` | string | Yes | Data to hash. |
| `algorithm` | string | Yes | Hash algorithm. Options: `md5`, `sha1`, `sha256`, `sha512`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Hash digest (hex encoded). |

---

## `crypto.encrypt`

**Display Name:** Encrypt

Encrypt data using AES-256-GCM symmetric encryption.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `data` | string | Yes | Data to encrypt. |
| `key` | string | Yes | Encryption key (stored encrypted). |
| `algorithm` | string | No | Encryption algorithm. Options: `aes-256-gcm`. Default: `aes-256-gcm`. |
| `key_encoding` | string | No | Key encoding format. Options: `text`, `base64`, `hex`. Default: `text`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Encrypted data (base64 encoded). |

---

## `crypto.decrypt`

**Display Name:** Decrypt

Decrypt AES-256-GCM encrypted data.

### Parameters

| Name | Type | Required | Description |
|:---|:---|:---|:---|
| `data` | string | Yes | Data to decrypt (base64 encoded). |
| `key` | string | Yes | Decryption key (stored encrypted). |
| `algorithm` | string | No | Encryption algorithm. Options: `aes-256-gcm`. Default: `aes-256-gcm`. |
| `key_encoding` | string | No | Key encoding format. Options: `text`, `base64`, `hex`. Default: `text`. |

### Output

| Name | Type | Description |
|:---|:---|:---|
| `data` | string | Decrypted data. |
