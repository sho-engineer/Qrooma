import { pgTable, text, integer, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const feedbackStatusEnum = pgEnum("feedback_status", [
  "under_review", "planned", "in_progress", "released", "not_planned",
]);
export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "feature_request", "improvement", "bug", "integration", "pricing", "other",
]);
export const roadmapPriorityEnum = pgEnum("roadmap_priority", ["low", "medium", "high"]);

export const feedbackPostsTable = pgTable("feedback_posts", {
  id:                  uuid("id").primaryKey().defaultRandom(),
  userId:              text("user_id").notNull(),
  title:               text("title").notNull(),
  description:         text("description").notNull(),
  status:              feedbackStatusEnum("status").notNull().default("under_review"),
  category:            feedbackCategoryEnum("category"),
  adminNote:           text("admin_note"),
  adminPriorityNote:   text("admin_priority_note"),
  upvoteCount:         integer("upvote_count").notNull().default(0),
  isHidden:            boolean("is_hidden").notNull().default(false),
  isPinned:            boolean("is_pinned").notNull().default(false),
  isRoadmapCandidate:  boolean("is_roadmap_candidate").notNull().default(false),
  roadmapPriority:     roadmapPriorityEnum("roadmap_priority"),
  voteThreshold:       integer("vote_threshold"),
  costSensitive:       boolean("cost_sensitive").notNull().default(false),
  createdAt:           timestamp("created_at").notNull().defaultNow(),
  updatedAt:           timestamp("updated_at").notNull().defaultNow(),
});

export const feedbackVotesTable = pgTable("feedback_votes", {
  id:             uuid("id").primaryKey().defaultRandom(),
  feedbackPostId: uuid("feedback_post_id").notNull().references(() => feedbackPostsTable.id),
  userId:         text("user_id"),
  voterEmail:     text("voter_email"),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
});

export type InsertFeedbackPost = typeof feedbackPostsTable.$inferInsert;
export type FeedbackPost       = typeof feedbackPostsTable.$inferSelect;
export type FeedbackVote       = typeof feedbackVotesTable.$inferSelect;
