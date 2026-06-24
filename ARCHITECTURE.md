# ARCHITECTURE

## Overview

This repository implements a custom Backstage security plugin as a Yarn 4 monorepo with two primary
plugin packages (frontend and backend) alongside a Backstage application instance. The security
plugin displays vulnerability scan results from Grype (stored in GitHub Actions artifacts) and
integrates with external GraphQL APIs for deployment metadata via Qontract. Both plugins are
designed to be consumed either as static dependencies in a standard Backstage deployment or as
dynamic plugins loaded at runtime via Scalprum/janus-cli, enabling flexible deployment patterns
including Red Hat's dynamic plugin architecture.

The backend plugin exposes a minimal REST API that proxies GitHub Actions artifact downloads and
unzips Grype scan results in-memory. The frontend plugin renders these results as paginated tables
within Backstage entity pages, showing vulnerability details (CVE ID, severity, package, fixed
version) for both the main branch and production deployments.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Backstage App                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Frontend (packages/app)                                  │ │
│  │   - EntityPage with Security tab                           │ │
│  │   - Routes to SecurityFrontendComponent                    │ │
│  └────────────┬───────────────────────────────────────────────┘ │
│               │                                                 │
│               │ (React components)                              │
│               ▼                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Security Frontend Plugin                                 │ │
│  │   (plugins/security-frontend)                              │ │
│  │   - GitRepoMainBranchComponent                             │ │
│  │   - CurrentProductionDeploymentComponent                   │ │
│  │   - PaginatedTable                                         │ │
│  └────────────┬────────────────────┬──────────────────────────┘ │
│               │                    │                            │
└───────────────┼────────────────────┼────────────────────────────┘
                │                    │
                │ HTTP               │ GraphQL
                │                    │
    ┌───────────▼────────┐   ┌───────▼──────────┐
    │ Security Backend   │   │ Qontract GraphQL │
    │ (via /api/proxy)   │   │ (via /api/proxy) │
    │ /grype/main        │   │ /qontract/graphql│
    │ /grype/deployed    │   └──────────────────┘
    └───────────┬────────┘
                │
                │ Fetch + unzip
                ▼
    ┌───────────────────────────────┐
    │ GitHub Actions Artifacts API  │
    │ (via /api/proxy/actions)      │
    │ - Grype scan results (ZIP)    │
    └───────────────────────────────┘
```

**Data Flow Summary:**

1. User navigates to a service entity's Security tab in Backstage catalog
2. Frontend components extract service name from `github.com/project-slug` annotation
3. Frontend queries Qontract GraphQL (via backend proxy) to resolve production deployment hash
4. Frontend calls backend `/api/security/grype/{main|deployed}` with service name and hash
5. Backend queries GitHub Actions API, downloads artifact ZIP, unzips in-memory, returns JSON
6. Frontend renders vulnerability data in paginated tables

## Plugin Architecture

### Backstage Plugin Model

Both frontend and backend follow Backstage's standard plugin structure:

- **Backend Plugin** (`plugins/security-backend/src/plugin.ts`):
  - Exports `securityPlugin` created via `createBackendPlugin()` from `@backstage/backend-plugin-api`
  - Registers with `pluginId: 'security'`
  - Depends on `coreServices.httpRouter`, `coreServices.logger`, `coreServices.rootConfig`
  - Mounts Express router at `/api/security` via `httpRouter.use()`
  - Defines auth policies: `/health` is unauthenticated, `/grype/*` requires `user-cookie`

- **Frontend Plugin** (`plugins/security-frontend/src/plugin.ts`):
  - Exports `SecurityFrontendPlugin` created via `createPlugin()`
  - Exports component extensions via `createComponentExtension()`:
    - `EntitySecurityFrontendContent`: main security page component
    - `OverviewDisplayCardContent`: optional overview card
  - Components are lazy-loaded for code splitting

### Integration Points

**App Integration** (`packages/app/src/components/catalog/EntityPage.tsx`):

The frontend plugin is consumed by adding `EntitySecurityFrontendContent` to entity layouts for
`service`, `website`, and default entity types. It appears as a `/security` tab route within
`EntityLayout`.

### Dynamic Plugin Export

Both plugins support dynamic loading via `janus-cli package export-dynamic-plugin`:

- **Backend** (`plugins/security-backend/src/dynamic/index.ts`):
  - Exports `dynamicPluginInstaller` with `kind: 'new'` and `install()` returning `securityPlugin`
  - Built output: `dist-dynamic/` containing `package.json`, `dist/`, and optional Scalprum bundles
  - `--no-embed-as-dependencies` flag skips bundling dependencies into the dynamic plugin

- **Frontend** (`plugins/security-frontend/src/dynamic/index.ts`):
  - Re-exports the same plugin and component extensions as static build
  - Built output: `dist-dynamic/` and `dist-scalprum/` for Scalprum module federation

This dual-mode support allows the plugins to be deployed either as:

1. Static workspace dependencies (development/traditional Backstage)
2. Dynamic plugins loaded at runtime from `dist-dynamic/` archives (Red Hat Janus IDP pattern)

## Backend Design

### Routes

Defined in `plugins/security-backend/src/service/router.ts`:

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/health` | GET | unauthenticated | Health check endpoint |
| `/grype/main` | GET | user-cookie | Fetch Grype scan for main branch |
| `/grype/deployed` | GET | user-cookie | Fetch Grype scan for specific commit hash |

Both `/grype/*` routes accept query params: `service` (repo name) and `deployedHash` (optional
commit SHA), and delegate to `QueryGithubActionsRunsData()`.

### Services

**`QueryGithubActionsRunsData`**
(`plugins/security-backend/src/service/common/getGrypeGitRepoBranchData.ts`):

1. Constructs artifact URL via backend proxy:
   `${backendUrl}/api/proxy/actions/repos/RedHatInsights/${serviceName}/actions/artifacts`
2. Fetches artifact list (100 items per page) from GitHub Actions API
3. Filters for main branch artifact (`workflow_run.head_branch === 'main' || 'master'`) or deployed
   hash artifact (`workflow_run.head_sha === deployedHash`)
4. Downloads artifact ZIP into memory using axios (`responseType: 'arraybuffer'`)
5. Unzips using `yauzl.fromBuffer()` (streaming zip parser)
6. Extracts first entry (assumes single JSON file in artifact)
7. Parses and returns JSON

### Data Access

No database access. The backend is stateless and acts purely as a proxy/transformation layer.
Configuration is read from `@backstage/config` (injected `Config` instance) to resolve
`backend.baseUrl` for constructing proxy URLs.

## Frontend Design

### Components

```
SecurityFrontendComponent
├── GitRepoMainBranchComponent
│   └── PaginatedTable (main branch vulnerabilities)
└── CurrentProductionDeploymentComponent
    └── PaginatedTable (deployed hash vulnerabilities)
```

**`SecurityFrontendComponent`**
(`plugins/security-frontend/src/components/SecurityFrontendComponent/SecurityFrontendComponent.tsx`):

- Root component rendered in entity security tab
- Uses `useEntity()` hook to extract `github.com/project-slug` annotation
- Queries Qontract GraphQL to resolve production deployment hash
- Renders two sections: main branch scans and production deployment scans

**`PaginatedTable`**
(`plugins/security-frontend/src/components/PaginatedTable/PaginatedTable.tsx`):

- Material-UI `Table` with client-side pagination (5 rows per page)
- Columns: Vulnerability (CVE link), Severity, Package, Type, Fixed Version
- Data structure: `grypeData.matches[]` where each match has `vulnerability`, `artifact` fields

### State Management

No global state management library. Component state is managed via:

- **React hooks** (`useState`, `useEffect`) for local component state
- **Backstage hooks** (`useEntity`, `useApi`) for entity context and API access
- **Custom data-fetching hooks**:
  - `GetGrypeDataMain(data)`: Fetches `/api/security/grype/main?service={serviceName}`
  - `GetGrypeDataDeployed(data)`: Fetches
    `/api/security/grype/deployed?service={serviceName}&deployedHash={hash}`
  - `QueryQontract(query, path?)`: Fetches GraphQL data for deployment hashes

## Data Flow

### Vulnerability Scan Retrieval (Grype)

```
Frontend Component
  │ 1. Extract service name from entity.metadata.annotations["github.com/project-slug"]
  ▼
GetGrypeDataMain/Deployed Hook
  │ 2. Fetch ${backendUrl}/api/security/grype/{main|deployed}?service={name}&deployedHash={hash}
  ▼
Backend Router
  │ 3. Construct GitHub Actions artifacts URL via proxy
  │ 4. Fetch artifact list, filter by branch/hash
  │ 5. Download artifact ZIP from GitHub (via redirect)
  │ 6. Unzip in-memory, extract JSON
  │ 7. Return vulnerability JSON
  ▼
Frontend Component
  │ 8. Render PaginatedTable with matches[] array
```

### Deployment Hash Retrieval (Qontract)

```
SecurityFrontendComponent
  │ 1. Extract platform/service labels from entity.metadata.labels
  │ 2. Construct App Interface path: /services/{platform}/{service}/deploy.yml
  ▼
QueryQontract Hook
  │ 3. GraphQL query to ${backendUrl}/api/proxy/qontract/graphql
  │    Query: saas_files_v2(path: $path) { resourceTemplates { targets { namespace { path }, ref } } }
  ▼
Qontract GraphQL API (external)
  │ 4. Returns deployment targets with namespace paths and git refs
  ▼
Frontend Component
  │ 5. Filter for prod environment (namespace path contains "prod.yml")
  │ 6. Extract ref (commit hash) for production deployment
  │ 7. Pass hash to CurrentProductionDeploymentComponent
```

## Dependencies & Integration Points

### External Systems

| System | Protocol | Purpose | Authentication |
|--------|----------|---------|----------------|
| GitHub Actions API | REST | Download Grype scan artifacts | GitHub PAT (via proxy) |
| Qontract GraphQL | GraphQL | Resolve production deployment hashes | Optional token (via proxy) |

### Backstage APIs

- `@backstage/backend-plugin-api`: Plugin lifecycle, HTTP router, logger, config
- `@backstage/plugin-proxy-backend`: Proxy configuration for external APIs
- `@backstage/core-plugin-api`: Plugin definition, API access (`useApi`, `configApiRef`,
  `fetchApiRef`)
- `@backstage/plugin-catalog-react`: Entity context (`useEntity` hook)

### Database

The backend declares dependencies on both `better-sqlite3` (in-memory SQLite for development) and
`pg` (PostgreSQL for production) in `packages/backend/package.json`, but neither is used directly
by the security plugin. These are consumed by other Backstage plugins (catalog, search, etc.). The
security plugin is entirely stateless.

## Key Design Decisions

### In-Memory ZIP Processing

Download and unzip GitHub artifacts entirely in-memory using `yauzl.fromBuffer()`. This avoids
filesystem dependencies and simplifies containerization, but limits artifact size to Node.js heap
capacity and provides no caching — every request re-downloads.

### Hardcoded GitHub Organization

Artifact URLs are constructed as `repos/RedHatInsights/${serviceName}/actions/artifacts`. This
simplifies the implementation for single-org deployment but limits reusability for forks or
multi-tenant Backstage instances.

### No Caching Layer

Each frontend request triggers a fresh backend request to the GitHub Actions API. This ensures
fresh data but risks rate limiting (5000 req/hour for authenticated users) and increases page load
times.

### Dual Plugin Distribution (Static + Dynamic)

Both standard Backstage plugins and dynamic plugins via `janus-cli` are built. This supports
multiple deployment patterns (Spotify OSS Backstage + Red Hat Janus IDP) at the cost of two
build/test paths to maintain.

### Client-Side Pagination

`PaginatedTable` fetches all vulnerabilities upfront and paginates in React. This enables instant
page switching but may degrade performance for large vulnerability lists (1000+ items).

### Material-UI 4

Constrained by Backstage 1.48.0 compatibility. MUI 4 is in maintenance mode; migration to MUI 5
will require a Backstage upgrade.
