# GraphQL API Documentation

**Generated on:** 2026-02-04T05:55:32.458Z  
**API Type:** GraphQL  
**Protocol:** HTTP/HTTPS

---

## Overview

The Nudgebee GraphQL API provides programmatic access to your account's data, including:
- Agent management and monitoring
- AI-powered anomaly detection and recommendations
- Auto-optimization and auto-pilot features
- Resource and application management
- Audit logging and compliance tracking

## Documentation Guide

### 📚 Getting Started
Start here if you're new to the Nudgebee API.
- **[Getting Started](./getting-started.md)** - API basics, quick start guide, and first API call

### 🔐 Authentication
Learn how to authenticate with the API.
- **[Authentication](./authentication.md)** - Token generation, usage, and implementation examples in multiple languages

### 📖 API Reference
Explore available APIs organized by category.
- **[API Categories](./api-categories.md)** - Complete list of all API endpoints grouped by function

### 💡 Common Patterns
Learn best practices for using the API.
- **[Query Patterns](./query-patterns.md)** - Common GraphQL query patterns and examples
- **[Error Handling](./error-handling.md)** - How to handle errors and common error responses

### 📋 Full Reference
Complete technical reference for all endpoints.
- **[Full API Reference](./reference.md)** - Complete query documentation

---

## API Overview

### Base URL
```
https://api.nudgebee.com/graphql
```

### Supported Methods
- **POST** - For queries and mutations
- **GET** - Introspection queries only (optional)

### Response Format
All responses are in JSON format following GraphQL specification.

---

## Quick Links

| Component | Description |
|-----------|-------------|
| **Endpoint** | `https://api.nudgebee.com/graphql` |
| **Authentication** | Bearer token (obtained via `/api/auth/token`) |
| **Format** | JSON over HTTP POST |
| **Rate Limits** | 100 requests per minute (default) |
| **Timeout** | 30 seconds per request |

---

## Next Steps

- **New to GraphQL?** Start with [Getting Started](./getting-started.md)
- **Ready to authenticate?** See [Authentication](./authentication.md)
- **Looking for specific APIs?** Check [API Categories](./api-categories.md)
- **Having issues?** See [Error Handling](./error-handling.md)
