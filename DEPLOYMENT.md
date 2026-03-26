# Color Awesome - Cloudflare Worker Deployment

This project is deployed as a **Cloudflare Worker** with static assets served from `dist/`.

## Prerequisites

- Node.js 18+
- npm
- Cloudflare account
- Wrangler CLI (already included in devDependencies)

## 1. Install Dependencies

```bash
npm install
```

## 2. Authenticate Wrangler

```bash
npx wrangler login
```

## 3. Build the App

```bash
npm run build
```

This generates the static bundle in `dist/`.

## 4. Run Worker Locally

```bash
npm run worker:dev
```

This uses:

- `worker/index.js` as Worker entrypoint
- `wrangler.toml` for Worker config
- `dist/` as static assets (`[assets] directory = "./dist"`)

## 5. Deploy to Production

```bash
npm run worker:deploy
```

This runs a fresh build and then deploys the Worker via Wrangler.

## Configuration Reference

### `wrangler.toml`

```toml
name = "color-awesome"
compatibility_date = "2024-09-23"
main = "worker/index.js"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

- `main` points to the Worker runtime code.
- `[assets]` serves files from `dist/`.
- `not_found_handling = "single-page-application"` enables SPA route fallback.

## Custom Domain

After deploy, bind a domain in Cloudflare Dashboard:

1. Go to `Workers & Pages`.
2. Open the `color-awesome` Worker.
3. Add a route or custom domain.
4. Point DNS records if needed.

## Optional: GitHub Actions CI/CD

Use Wrangler Action to deploy on push to `main`:

```yaml
name: Deploy Worker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:run
      - run: npm run worker:deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Create a Cloudflare API token with Worker deploy permissions and store it as `CLOUDFLARE_API_TOKEN`.

## Troubleshooting

### `ASSETS` binding errors

- Ensure `dist/` exists (`npm run build`).
- Ensure `wrangler.toml` `[assets] directory` points to `./dist`.

### SPA routes returning 404

- Confirm `not_found_handling = "single-page-application"` is set in `wrangler.toml`.

### Authentication/deploy errors

- Re-run `npx wrangler login` locally.
- Verify API token scopes in CI.
