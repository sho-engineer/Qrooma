import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed_amount", "free_trial_days"]);

export const couponsTable = pgTable("coupons", {
  id:                    uuid("id").primaryKey().defaultRandom(),
  code:                  text("code").notNull().unique(),
  name:                  text("name").notNull(),
  description:           text("description"),
  discountType:          discountTypeEnum("discount_type").notNull(),
  discountValue:         integer("discount_value").notNull(),
  currency:              text("currency"),
  startsAt:              timestamp("starts_at"),
  expiresAt:             timestamp("expires_at"),
  maxRedemptions:        integer("max_redemptions"),
  maxRedemptionsPerUser: integer("max_redemptions_per_user").notNull().default(1),
  currentRedemptions:    integer("current_redemptions").notNull().default(0),
  isActive:              boolean("is_active").notNull().default(true),
  createdBy:             text("created_by").notNull(),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
  // Access-coupon fields
  accessDays:            integer("access_days").notNull().default(14),
  couponType:            text("coupon_type").notNull().default("beta_14d"),
  note:                  text("note"),
});

export const couponRedemptionsTable = pgTable("coupon_redemptions", {
  id:                      uuid("id").primaryKey().defaultRandom(),
  couponId:                uuid("coupon_id").notNull().references(() => couponsTable.id),
  userId:                  text("user_id").notNull(),
  redeemedAt:              timestamp("redeemed_at").notNull().defaultNow(),
  metadata:                jsonb("metadata"),
  userEmail:               text("user_email"),
  accessDaysGranted:       integer("access_days_granted"),
  previousAccessExpiresAt: timestamp("previous_access_expires_at"),
  newAccessExpiresAt:      timestamp("new_access_expires_at"),
});

export type InsertCoupon     = typeof couponsTable.$inferInsert;
export type Coupon           = typeof couponsTable.$inferSelect;
export type CouponRedemption = typeof couponRedemptionsTable.$inferSelect;
