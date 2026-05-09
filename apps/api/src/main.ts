import 'dotenv/config';
import { loadEnv } from './config/env.js';
import { buildServer } from './server.js';

const env = loadEnv();
const app = await buildServer();

try {
  await app.listen({
    host: '0.0.0.0',
    port: env.API_PORT
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
