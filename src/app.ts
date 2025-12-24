import express from 'express';
import { router } from './routes';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use(router);
  return app;
}
