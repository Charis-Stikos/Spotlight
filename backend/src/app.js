import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config, isDev } from './config/env.js';
import { router as apiRouter } from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(',') }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  if (isDev) app.use(morgan('dev'));

  app.get('/', (_req, res) =>
    res.json({ name: 'Spotlight API', status: 'ok', endpoints: { health: '/health', api: '/api' } }));

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', service: 'spotlight-api', time: new Date().toISOString() }));

  app.use('/api', apiRouter);

  // 404 και κεντρική διαχείριση σφαλμάτων — πάντα τελευταία
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
