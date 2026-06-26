import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, accessRequestsTable } from "@workspace/db";
import { CreateAccessRequestBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(row: typeof accessRequestsTable.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/access-requests", async (_req, res) => {
  const rows = await db
    .select()
    .from(accessRequestsTable)
    .orderBy(desc(accessRequestsTable.createdAt));
  res.json(rows.map(serialize));
});

router.get("/access-requests/summary", async (_req, res) => {
  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      today: sql<number>`count(*) filter (where ${accessRequestsTable.createdAt} >= date_trunc('day', now()))::int`,
    })
    .from(accessRequestsTable);

  const [latest] = await db
    .select()
    .from(accessRequestsTable)
    .orderBy(desc(accessRequestsTable.createdAt))
    .limit(1);

  res.json({
    total: totals?.total ?? 0,
    today: totals?.today ?? 0,
    latestEmail: latest?.email ?? null,
    latestAt: latest ? latest.createdAt.toISOString() : null,
  });
});

router.post("/access-requests", async (req, res) => {
  const parsed = CreateAccessRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(accessRequestsTable)
    .where(eq(accessRequestsTable.email, email))
    .limit(1);

  if (existing) {
    res.status(200).json(serialize(existing));
    return;
  }

  const [created] = await db
    .insert(accessRequestsTable)
    .values({ email })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    const [row] = await db
      .select()
      .from(accessRequestsTable)
      .where(eq(accessRequestsTable.email, email))
      .limit(1);
    res.status(200).json(serialize(row!));
    return;
  }

  res.status(201).json(serialize(created));
});

export default router;
