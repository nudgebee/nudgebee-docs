# NudgeBee Documentation

This repository hosts the official documentation for [NudgeBee](https://nudgebee.com), built using [Docusaurus 3](https://docusaurus.io/).

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local dev server**:
   ```bash
   npm start
   ```
   This command starts the local development server at `http://localhost:3000` (or `http://localhost:4000`). Edits in `docs/` reflect live via hot-reloading.

## Production Build

To verify and generate static assets:

```bash
npm run build
```

The compiled output will be generated inside the `build/` directory.

To preview the production build locally:

```bash
npm run serve
```
