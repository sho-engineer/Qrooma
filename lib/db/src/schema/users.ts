import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id:                  text("id").primaryKey(),
  email:               text("email").notNull().unique(),
  name:                text("name").notNull(),
  role:                userRoleEnum("role").notNull().default("user"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  lastActiveAt:        timestamp("last_active_at").notNull().defaultNow(),
  fullAccessExpiresAt: timestamp("full_access_expires_at"),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User       = typeof usersTable.$inferSelect;
