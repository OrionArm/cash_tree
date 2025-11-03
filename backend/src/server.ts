import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Fastify from 'fastify';
import { app, options } from './app';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const server = Fastify(options);

const start = async () => {
  try {
    // Регистрируем приложение перед запуском
    await server.register(app);

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    server.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
