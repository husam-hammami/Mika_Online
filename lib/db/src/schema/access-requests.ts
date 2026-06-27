import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accessRequestsTable = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // --- Early-access approval queue (manual approve -> emailed install link) ---
  // All columns nullable or defaulted so `drizzle-kit push` is non-destructive
  // on the already-populated live table (old email-only rows keep null/default).
  firstName: text("first_name"), // nullable (legacy rows = null)
  profession: text("profession"), // nullable
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  approvalEmailSentAt: timestamp("approval_email_sent_at", { withTimezone: true }),

  // Download tracking (retained; per-user download analytics is out of scope).
  // downloadedAt stays null until the first download.
  downloadedAt: timestamp("downloaded_at", { withTimezone: true }),
  downloadCount: integer("download_count").notNull().default(0),
});

export const insertAccessRequestSchema = createInsertSchema(
  accessRequestsTable,
).omit({ id: true, createdAt: true });

export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AccessRequest = typeof accessRequestsTable.$inferSelect;
