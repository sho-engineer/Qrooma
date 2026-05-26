import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum   = pgEnum("user_role",   ["user", "tester", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "waitlist", "blocked", "deleted"]);

export const usersTable = pgTable("users", {
  id:                  text("id").primaryKey(),
  email:               text("email").notNull().unique(),
  name:                text("name").notNull(),
  role:                userRoleEnum("role").notNull().default("user"),
  status:              userStatusEnum("status").notNull().default("active"),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  lastActiveAt:        timestamp("last_active_at").notNull().defaultNow(),
  fullAccessExpiresAt: timestamp("full_access_expires_at"),
  blockedAt:           timestamp("blocked_at"),
  blockedBy:           text("blocked_by"),
  blockedReason:       text("blocked_reason"),
  deletedAt:           timestamp("deleted_at"),
  deletedBy:           text("deleted_by"),
  deleteReason:        text("delete_reason"),
  adminNote:           text("admin_note"),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User       = typeof usersTable.$inferSelect;
