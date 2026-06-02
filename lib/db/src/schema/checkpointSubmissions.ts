import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const checkpointSubmissionsTable = pgTable("decision_checkpoint_submissions", {
  id:                     uuid("id").primaryKey().defaultRandom(),
  nameOrHandle:           text("name_or_handle").notNull(),
  email:                  text("email").notNull(),
  whatAreYouBuilding:     text("what_are_you_building").notNull(),
  decisionToMake:         text("decision_to_make").notNull(),
  optionsConsidered:      text("options_considered").notNull(),
  whatHappensIfWrong:     text("what_happens_if_wrong").notNull(),
  messyNotes:             text("messy_notes").notNull(),
  websiteUrl:             text("website_url"),
  alreadyTried:           text("already_tried"),
  source:                 text("source"),
  whereDidYouFind:        text("where_did_you_find"),
  preferredContactMethod: text("preferred_contact_method"),
  consentAccepted:        boolean("consent_accepted").notNull().default(false),
  status:                 text("status").notNull().default("new"),
  paymentStatus:          text("payment_status").notNull().default("not_sent"),
  adminNotes:             text("admin_notes"),
  stakes:                 text("stakes"),
  decisionType:           text("decision_type"),
  goodFit:                boolean("good_fit"),
  paymentLinkSentAt:      timestamp("payment_link_sent_at"),
  deliveredAt:            timestamp("delivered_at"),
  secondUse:              boolean("second_use"),
  createdAt:              timestamp("created_at").notNull().defaultNow(),
  updatedAt:              timestamp("updated_at").notNull().defaultNow(),
});

export type InsertCheckpointSubmission = typeof checkpointSubmissionsTable.$inferInsert;
export type CheckpointSubmission       = typeof checkpointSubmissionsTable.$inferSelect;
