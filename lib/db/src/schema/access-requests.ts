import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accessRequestsTable = pgTable("access_requests", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAccessRequestSchema = createInsertSchema(
  accessRequestsTable,
).omit({ id: true, createdAt: true });

export type InsertAccessRequest = z.infer<typeof insertAccessRequestSchema>;
export type AccessRequest = typeof accessRequestsTable.$inferSelect;
