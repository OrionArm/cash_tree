import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
  jsonb,
  json,
} from 'drizzle-orm/pg-core';

// Таблица игроков
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 64 }).notNull().unique(), // Уникальный ID сессии
  name: varchar('name', { length: 100 }).notNull(),
  health: integer('health').notNull().default(100),
  maxHealth: integer('max_health').notNull().default(100),
  steps: integer('steps').notNull().default(0),
  gold: integer('gold').notNull().default(0),
  cristal: integer('cristal').notNull().default(0),
  position: integer('position').notNull().default(0),
  inventory: json('inventory').default({}), // Упрощенный инвентарь как JSON объект
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица инвентаря игрока
export const playerInventory = pgTable('player_inventory', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  house: jsonb('house'),
  vehicle: jsonb('vehicle'),
  insurance: jsonb('insurance').default([]),
  card: jsonb('card').default([]),
  deposit: jsonb('deposit').default([]),
  loan: jsonb('loan').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица игровых событий
export const gameEvents = pgTable('game_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  type: varchar('type', { length: 50 }).notNull(), // 'npc_encounter' | 'treasure' | 'monster' | 'shop' | 'random_event'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  requiresAction: boolean('requires_action').notNull().default(false),
  actions: jsonb('actions').default([]),
  rewards: jsonb('rewards'),
  isCompleted: boolean('is_completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Типы для TypeScript
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type PlayerInventory = typeof playerInventory.$inferSelect;
export type NewPlayerInventory = typeof playerInventory.$inferInsert;

export type GameEvent = typeof gameEvents.$inferSelect;
export type NewGameEvent = typeof gameEvents.$inferInsert;
