# AGENTS.md

## Project Overview

The Backstage Security Plugin is a custom Backstage plugin distributed as a Yarn 4 monorepo. It
displays vulnerability scan results from Grype (stored as GitHub Actions artifacts) and integrates
with Qontract GraphQL for deployment metadata. The frontend plugin renders paginated vulnerability
tables within Backstage entity pages, while the backend proxies GitHub Actions artifact downloads
and unzips scan results in-memory. Both plugins support dual distribution: static workspace
dependencies for traditional Backstage deployments and dynamic plugins via janus-cli/Scalprum for
Red Hat Janus IDP runtime loading.

## Dependencies

**Runtime:** Node.js 22 or 24, TypeScript ^5.8.0, React 18, Express 4, Backstage 1.48.0,
Yarn 4.4.1

**Frontend plugin:** `@backstage/core-components`, `@backstage/plugin-catalog-react`, Material-UI 4,
`graphql-request` 7.1.0, React Router DOM 6

**Backend plugin:** `@backstage/backend-plugin-api`, axios 1.7.7, yauzl 3.1.3 (ZIP parsing),
unzipper 0.12.3

**Dev/Test:** `@backstage/cli` 0.35.4, Jest 30.2.0, Playwright 1.32.3, Prettier 2.3.2,
`@janus-idp/cli` (dynamic plugin export)

## Development Commands

See [Development][readme-dev] in the README for the full command reference.

```sh
yarn install              # Install dependencies for all workspace packages
yarn start                # Start Backstage app in development mode
yarn test                 # Run Jest tests for changed packages
yarn test:all             # Run all tests with coverage
yarn lint                 # Lint changed packages since origin/main
yarn lint:all             # Lint all workspace packages
yarn build:all            # Build all packages (frontend, backend, plugins)
yarn tsc                  # Type-check all packages
yarn export-dynamic       # Build dynamic plugin artifacts for both frontend and backend
```

To run commands in a specific workspace package:

```sh
yarn workspace @redhatinsights/backstage-plugin-security-backend test
```

[readme-dev]: ./README.md#development

## Architecture

Yarn 4 monorepo with four workspace packages: `packages/app` (Backstage frontend app),
`packages/backend` (Backstage backend app), `plugins/security-frontend` (React plugin), and
`plugins/security-backend` (Express router). Frontend components consume
`/api/security/grype/{main|deployed}` routes exposed by the backend plugin. Backend queries GitHub
Actions API via Backstage proxy, downloads ZIP artifacts, unzips in-memory, and returns parsed JSON.
See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed data flow diagrams, plugin integration points,
and design rationale.

## Code Style

**Linter:** ESLint via `@backstage/cli` with Backstage's default ruleset (root `.eslintrc.js`
inherits from CLI config).

**Formatter:** Prettier 2.3.2 using `@backstage/cli/config/prettier` (2-space indentation, single
quotes, trailing commas, 80-character print width).

**TypeScript:** Strict mode via `@backstage/cli/config/tsconfig.json` parent config. Target: ES2021.
JSX mode: `react-jsx`. Compiler checks run via `yarn tsc` (skips lib checks by default; use
`yarn tsc:full` for complete validation).

**Conventions:** React components use functional components with hooks (no class components). Fenced
code blocks in Markdown require language identifiers. lint-staged is configured for pre-commit
formatting (ESLint + Prettier on code files, Prettier on JSON/MD).

## Common Mistakes

1. **Assuming octokit is configured.** The `octokit` package is declared in
   `plugins/security-backend/package.json` but never imported or used. The backend fetches GitHub
   data via the Backstage proxy (`/api/proxy/actions`) using axios, not the Octokit client.

2. **Modifying GitHub organization in one place.** The `RedHatInsights` organization is hardcoded in
   `plugins/security-backend/src/service/common/getGrypeGitRepoBranchData.ts`. This is not
   configurable via environment variables or Backstage config — any multi-tenant or fork support
   requires code changes.

3. **Breaking dynamic plugin builds.** Both frontend and backend export dynamic plugins via
   `janus-cli package export-dynamic-plugin`. The backend uses `--no-embed-as-dependencies` to skip
   bundling dependencies; the frontend bundles them for Scalprum. Changing dependency structures
   (e.g., moving a runtime dep to devDependencies) can break the dynamic plugin output in
   `dist-dynamic/` without breaking the static build. Always test both `yarn build:all` and
   `yarn export-dynamic` after dependency changes.

4. **Assuming ZIP artifacts contain multiple files.** The `QueryGithubActionsRunsData` function
   extracts only the first entry from the ZIP artifact. If GitHub Actions artifacts contain multiple
   files, subsequent files are silently ignored.

5. **Forgetting Yarn 4 PnP mode.** This repo uses Yarn 4.4.1 with Plug'n'Play. Do not use `npm` or
   `pnpm` commands. Do not expect `node_modules/` directories to exist. IDE integrations must use
   Yarn SDK (`yarn dlx @yarnpkg/sdks vscode` for VS Code).

6. **Ignoring Material-UI 4 constraints.** The frontend is locked to Material-UI 4 due to Backstage
   1.48.0 compatibility. Do not import from `@mui/material`; use `@material-ui/core` instead.

## Testing

Run `yarn test` to execute Jest tests for changed packages, or `yarn test:all` for full coverage
across all workspaces. E2E tests use Playwright (`yarn test:e2e`).

Test files follow the pattern `src/**/*.test.ts` and are co-located with source files. E2E tests
live in `packages/app/e2e-tests/`.

## Deployment

**Static Backstage deployments:** Include plugins as workspace dependencies in the Backstage app.
Build with `yarn build:all` and deploy via the standard Backstage backend Docker image
(`yarn build-image`).

**Dynamic plugins (Red Hat Janus IDP):** Run `yarn export-dynamic` to generate Scalprum-compatible
artifacts in `dist-dynamic/` for both frontend and backend plugins. These archives can be loaded at
runtime without rebuilding the Backstage app.
