import { useState, useEffect, useCallback, type FormEvent } from "react";

// Admin endpoints are hand-fetched (not in the generated client). The httpOnly
// cookie set by /api/admin/login is sent automatically with credentials:"include".

type AccessRow = {
  id: number;
  firstName: string | null;
  profession: string | null;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decidedAt: string | null;
  approvalEmailSentAt: string | null;
};

function call(path: string, init?: RequestInit) {
  return fetch(path, { credentials: "include", ...init });
}

function fmt(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const load = useCallback(async () => {
    setError(null);
    try {
      const q = filter === "pending" ? "?status=pending" : "";
      const res = await call(`/api/access-requests${q}`);
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      setRows(await res.json());
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setChecking(false);
    }
  }, [filter]);

  // Attempt on mount / filter change — the cookie may already be valid.
  useEffect(() => {
    void load();
  }, [load]);

  const login = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await call("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      setError("Invalid token.");
      return;
    }
    setToken("");
    await load();
  };

  const decide = async (id: number, approve: boolean) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await call(`/api/access-requests/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-white text-[#05070d] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-white text-[#05070d] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold tracking-tight">MIKA · Admin</h1>
          <p className="text-sm text-gray-500">Enter the admin token to manage the early-access queue.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            autoComplete="current-password"
            autoFocus
            className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e6bff]"
          />
          <button
            type="submit"
            className="w-full h-11 bg-[#05070d] text-white rounded-md font-medium hover:bg-black transition-colors"
          >
            Sign in
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#05070d] p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Early-access queue</h1>
            <p className="text-sm text-gray-500 mt-1">
              Approve to email a download link · {rows.length} {filter === "pending" ? "pending" : "total"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={`h-9 px-3 rounded-md text-sm border ${filter === "pending" ? "bg-[#05070d] text-white border-[#05070d]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`h-9 px-3 rounded-md text-sm border ${filter === "all" ? "bg-[#05070d] text-white border-[#05070d]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              All
            </button>
            <button
              onClick={() => void load()}
              className="h-9 px-3 rounded-md text-sm border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Profession</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Requested</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      Nothing here.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium">{r.firstName || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.profession || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.email}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(r.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.status === "pending" && <span className="text-amber-600">Pending</span>}
                        {r.status === "rejected" && <span className="text-gray-400">Rejected</span>}
                        {r.status === "approved" &&
                          (r.approvalEmailSentAt ? (
                            <span className="text-green-600">Approved · emailed</span>
                          ) : (
                            <span className="text-red-600">Approved · email failed</span>
                          ))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === "pending" && (
                            <>
                              <button
                                disabled={busyId === r.id}
                                onClick={() => decide(r.id, true)}
                                className="h-8 px-3 rounded-md text-xs font-medium bg-[#1e6bff] text-white hover:bg-[#1a5fe6] disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={busyId === r.id}
                                onClick={() => decide(r.id, false)}
                                className="h-8 px-3 rounded-md text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {r.status === "approved" && !r.approvalEmailSentAt && (
                            <button
                              disabled={busyId === r.id}
                              onClick={() => decide(r.id, true)}
                              className="h-8 px-3 rounded-md text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
