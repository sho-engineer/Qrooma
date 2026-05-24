import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

export const analyticsEventsTable = pgTable("analytics_events", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    text("user_id"),
  eventName: text("event_name").notNull(),
  path:      text("path"),
  metadata:  jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertAnalyticsEvent = typeof analyticsEventsTable.$inferInsert;
export type AnalyticsEvent       = typeof analyticsEventsTable.$inferSelect;
