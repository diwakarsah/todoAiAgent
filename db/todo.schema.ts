import { integer, pgTable, text,boolean, timestamp } from "drizzle-orm/pg-core";

export const ToDoTable = pgTable('todo', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  todo: text().notNull(),
  isCompleted: boolean().default(false),
  createdAt:timestamp('created_at').notNull().defaultNow(),
  updatedAt:timestamp('updated_at').notNull().$onUpdate(()=>new Date())}
)