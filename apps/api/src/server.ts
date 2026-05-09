import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { registerHealthRoutes } from './modules/health/routes.js';
import { registerMembershipRoutes } from './modules/membership/routes.js';

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: true,
    credentials: true
  });

  app.get('/', async () => ({
    name: 'SLEB API',
    version: '0.1.0'
  }));

  await registerHealthRoutes(app);
  await registerMembershipRoutes(app);

  return app;
}
