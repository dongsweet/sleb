# SLEB Modernization Architecture

## Direction

Use a modular monolith first, deployed as containers:

- `apps/web`: public website, member portal, and admin UI shell.
- `apps/api`: HTTP API, authentication boundary, business modules.
- `apps/worker`: async jobs such as email, imports, report generation, and search indexing.
- `packages/shared`: shared domain enums and validation schemas.
- `packages/db`: database schema and persistence helpers.

This keeps the demo simple while leaving a clean path to run multiple replicas of web/api/worker in production.

## Runtime Topology

```text
Cloudflare / Load Balancer
        |
      Web
        |
      API  ---- Worker
        |        |
   PostgreSQL   Valkey
        |
   Object Storage
```

## Data Strategy

PostgreSQL is the system of record. It should own:

- account and company records
- membership applications and lifecycle
- public directories
- assessment records
- audit trails
- JSONB extension fields for legacy-compatible data
- PostGIS geometry for buildings and projects

Valkey is not a source of truth. Use it for:

- rate limits
- session cache, if not using stateless sessions
- queues
- short-lived hot query cache

OpenSearch is optional. Start with PostgreSQL full-text search and add OpenSearch only when search quality, volume, or analytics justify the extra operating cost.

## Deployment Path

1. Single-machine demo: Node.js processes + optional local services.
2. Compose demo: web, api, worker, postgres/postgis, valkey, minio.
3. Production cluster: stateless web/api/worker replicas behind a load balancer; managed or HA PostgreSQL; managed S3-compatible object storage.

