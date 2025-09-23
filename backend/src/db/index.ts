import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from 'dotenv';

// Загружаем переменные окружения
config({ path: '../.env' });

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER}${process.env.POSTGRES_PASSWORD ? ':' + encodeURIComponent(process.env.POSTGRES_PASSWORD) : ''}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB}`;

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export * from './schema';
