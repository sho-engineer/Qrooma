import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const waitlistEntriesTable = pgTable("waitlist_entries", {
  id:        uuid("id").primaryKey().defaultRandom(),
  email:     text("email").notNull().unique(),
  name:      text("name"),
  role:      text("role"),
  useCase:   text("use_case"),
  source:    text("source").notNull().default("waitlist"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertWaitlistEntry = typeof waitlistEntriesTable.$inferInsert;
export type WaitlistEntry       = typeof waitlistEntriesTable.$inferSelect;
