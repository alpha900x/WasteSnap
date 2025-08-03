import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reportStatusEnum = pgEnum('report_status', ['new', 'in_progress', 'resolved']);
export const wasteTypeEnum = pgEnum('waste_type', ['general', 'recyclables', 'organic', 'hazardous']);

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  wasteType: wasteTypeEnum("waste_type").notNull(),
  status: reportStatusEnum("status").notNull().default('new'),
  latitude: varchar("latitude").notNull(),
  longitude: varchar("longitude").notNull(),
  address: text("address"),
  photoUrl: varchar("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved'])
});

export type InsertReportData = z.infer<typeof insertReportSchema>;
export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;
