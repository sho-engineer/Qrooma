import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminAuditLogsTable = pgTable("admin_audit_logs", {
  id:         text("id").primaryKey().default("gen_random_uuid()"),
  actorUid:   text("actor_uid").notNull(),
  actorEmail: text("actor_email").notNull(),
  action:     text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId:   text("target_id"),
  beforeVal:  text("before_val"),
  afterVal:   text("after_val"),
  note:       text("note"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
});

export type InsertAdminAuditLog = typeof adminAuditLogsTable.$inferInsert;
export type AdminAuditLog       = typeof adminAuditLogsTable.$inferSelect;
