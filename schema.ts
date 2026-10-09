import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
export const memories = sqliteTable('memories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nickname: text('nickname').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
});
