import type { FastifyInstance } from 'fastify';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    ok: true,
    service: 'sleb-api',
    timestamp: new Date().toISOString()
  }));

  app.get('/ready', async () => ({
    ok: true,
    checks: {
      api: 'ok'
    }
  }));
}
