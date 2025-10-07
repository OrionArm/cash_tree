import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Fastify from 'fastify';
import { app, options } from './app';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const server = Fastify(options);

server.register(app);

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
