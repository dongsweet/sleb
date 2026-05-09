# SLEB Platform

Modernized SLEB scaffold for a container-friendly Node.js stack.

## Stack

- Web: Next.js + TypeScript
- API: Fastify + TypeScript
- Worker: BullMQ-ready TypeScript worker
- Database: PostgreSQL + PostGIS
- Cache/queue: Valkey
- Object storage: S3-compatible storage, MinIO for local demo

## Local Demo

Install dependencies:

```bash
npm install
```

Run the API demo:

```bash
npm run dev:api
```

Run the web app:

```bash
npm run dev:web
```

Docker Compose is included for the production-like local stack, but this machine does not currently have Docker installed.

For the `sleb.sweethome.vip` test server, use:

```bash
docker compose -f docker-compose.server.yml up -d --build
```

## Services

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- API health: `http://localhost:4000/health`
- Architecture note: `docs/architecture.md`
