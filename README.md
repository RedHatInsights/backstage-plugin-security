# Backstage Security Plugin

A Backstage plugin monorepo for displaying Grype vulnerability scan results from GitHub Actions
artifacts and integrating with Qontract GraphQL for deployment metadata.

## Features

- **Frontend Plugin** (`@redhatinsights/backstage-plugin-security-frontend`) — React-based UI for
  viewing vulnerability scan results and deployment status
- **Backend Plugin** (`@redhatinsights/backstage-plugin-security-backend`) — Express API for
  fetching Grype scan results from GitHub Actions artifacts
- **Qontract Integration** — Optional GraphQL integration for retrieving deployment hashes and
  production metadata
- **Backstage Integration** — Drop-in plugins for existing Backstage instances

## Prerequisites

- **Node.js:** 22 or 24 (as specified in `package.json` engines)
- **Yarn:** 4.4.1 (included via Corepack)
- **GitHub PAT:** Personal Access Token with `repo` and `actions:read` scopes
- **Qontract GraphQL endpoint** (optional, for deployment metadata)

## Installation

### Clone and Install Dependencies

```bash
git clone <repository-url>
cd backstage-plugin-security
yarn install
```

### Configure Environment Variables

Create a `.env` file or export the following variables:

```bash
export GITHUB_TOKEN="ghp_your_personal_access_token"
```

### Configure Backstage

Edit `app-config.yaml` to configure the proxy endpoints:

1. **GitHub Actions Proxy** — Enable fetching Grype scan results from GitHub Actions artifacts:

   ```yaml
   proxy:
     endpoints:
       actions:
         target: https://api.github.com
         headers:
           Authorization: Bearer ${GITHUB_TOKEN}
           Accept: application/vnd.github+json
           X-GitHub-Api-Version: "2022-11-28"
   ```

2. **Qontract GraphQL** (optional) — Configure your Qontract server URL for deployment metadata:

   ```yaml
       qontract:
         target: https://your-qontract-server/graphql
         changeOrigin: true
         # headers:
         #   Authorization: Bearer ${QONTRACT_TOKEN}
   ```

## Development

### Start the Development Server

```bash
# Start frontend and backend concurrently
yarn start
```

The frontend runs on [http://localhost:3000](http://localhost:3000), backend on
[http://localhost:7007](http://localhost:7007).

To start services independently:

```bash
yarn start                # Frontend only
yarn start-backend        # Backend only
```

### Build

```bash
yarn build:all            # Build all packages
yarn build:backend        # Build backend only
```

### Linting and Formatting

```bash
yarn lint                 # Lint changed files since origin/main
yarn lint:all             # Lint all files
yarn fix                  # Auto-fix lint issues
yarn prettier:check       # Check formatting
```

### Type Checking

```bash
yarn tsc                  # TypeScript type check (skipLibCheck)
yarn tsc:full             # Full type check (no skipLibCheck)
```

### Testing

```bash
yarn test                 # Run tests
yarn test:all             # Run tests with coverage
yarn test:e2e             # Run Playwright E2E tests
```

### Clean Build Artifacts

```bash
yarn clean
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for internal design details, plugin structure, and data
flow.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

Apache-2.0
