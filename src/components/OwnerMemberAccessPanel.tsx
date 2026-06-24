"use client";

import { useEffect, useMemo, useState } from "react";

type MemberRecord = {
  id: string;
  email: string | null;
  created_at: string;
  access_level: "user" | "pro" | "admin";
};

export default function OwnerMemberAccessPanel() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canAdmin, setCanAdmin] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAccessLevel, setGrantAccessLevel] = useState<"user" | "pro" | "admin">("admin");
  const [granting, setGranting] = useState(false);
  const [ownerId, setOwnerId] = useState<string>("");
  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [roleByUserId, setRoleByUserId] = useState<Record<string, "user" | "pro" | "admin">>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const accessRes = await fetch("/api/access/me");
        if (!accessRes.ok) {
          setMembers([]);
          setCanAdmin(false);
          return;
        }

        const accessData = await accessRes.json();
        const allowed = Boolean(accessData?.isOwner) || accessData?.accessLevel === "admin";
        if (!allowed) {
          setMembers([]);
          setCanAdmin(false);
          return;
        }

        setCanAdmin(true);

        const res = await fetch("/api/admin/members");

        if (res.status === 403 || res.status === 401) {
          setMembers([]);
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load members");
        }

        const rows: MemberRecord[] = data.members || [];
        setMembers(rows);
        setOwnerId(String(data.ownerId || ""));
        setOwnerEmail(String(data.ownerEmail || ""));

        const map: Record<string, "user" | "pro" | "admin"> = {};
        for (const row of rows) {
          map[row.id] = row.access_level || "user";
        }
        setRoleByUserId(map);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load members";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visibleMembers = useMemo(() => members.filter((m) => m.id !== ownerId), [members, ownerId]);

  const updateRole = async (userId: string) => {
    const accessLevel = roleByUserId[userId] || "user";
    setSavingId(userId);
    setError("");

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, accessLevel }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update member access");
      }

      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, access_level: accessLevel } : m)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update member access";
      setError(msg);
    } finally {
      setSavingId("");
    }
  };

  const grantByEmail = async () => {
    const email = grantEmail.trim();
    if (!email) {
      setError("Enter an email address to grant access.");
      return;
    }

    setGranting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessLevel: grantAccessLevel }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update member access");
      }

      const updated = data?.userId ? String(data.userId) : "";
      if (updated) {
        setMembers((prev) => {
          const index = prev.findIndex((member) => member.id === updated);
          if (index === -1) return prev;
          const next = [...prev];
          next[index] = { ...next[index], access_level: grantAccessLevel };
          return next;
        });
        setRoleByUserId((prev) => ({ ...prev, [updated]: grantAccessLevel }));
      }

      setGrantEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update member access";
      setError(msg);
    } finally {
      setGranting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
        <h2 className="text-lg font-bold text-violet-300">Owner Controls</h2>
        <p className="text-sm text-violet-100/70 mt-2">Loading member access controls...</p>
      </div>
    );
  }

  if (!canAdmin) {
    return null;
  }

  return (
    <div className="bg-slate-900/80 border border-violet-400/35 rounded-xl p-5 shadow-[0_0_18px_rgba(167,139,250,0.15)]">
      <h2 className="text-lg font-bold text-violet-300">Owner Controls</h2>
      <p className="text-sm text-violet-100/70 mt-1">
        Signed in as owner: <span className="font-semibold text-violet-200">{ownerEmail || "Configured owner"}</span>
      </p>
      <p className="text-xs text-violet-100/60 mt-1">Upgrade members to Pro/Admin. This panel is hidden for non-owners.</p>

      <div className="mt-4 rounded-lg border border-violet-300/20 bg-violet-500/5 p-3">
        <p className="text-sm font-medium text-violet-100">Grant access by email</p>
        <div className="mt-3 flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="email"
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="creator@example.com"
            className="w-full rounded-md border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-sm text-violet-100 placeholder:text-violet-100/40"
          />

          <select
            value={grantAccessLevel}
            onChange={(e) => setGrantAccessLevel(e.target.value as "user" | "pro" | "admin")}
            className="rounded-md border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-sm text-violet-100"
          >
            <option value="user">User</option>
            <option value="pro">Pro</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="button"
            onClick={grantByEmail}
            disabled={granting}
            className="rounded-md bg-violet-500/80 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-violet-400 disabled:opacity-60"
          >
            {granting ? "Granting..." : "Grant"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300 mt-3">{error}</p>}

      <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
        {visibleMembers.length === 0 ? (
          <p className="text-sm text-violet-100/60">No members to show yet.</p>
        ) : visibleMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-violet-300/20 bg-violet-500/5 p-3"
          >
            <div>
              <p className="text-sm font-medium text-violet-100">{member.email || member.id}</p>
              <p className="text-xs text-violet-100/60">Joined: {new Date(member.created_at).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleByUserId[member.id] || "user"}
                onChange={(e) =>
                  setRoleByUserId((prev) => ({
                    ...prev,
                    [member.id]: e.target.value as "user" | "pro" | "admin",
                  }))
                }
                className="rounded-md border border-violet-300/30 bg-slate-950/80 px-2 py-1 text-sm text-violet-100"
              >
                <option value="user">User</option>
                <option value="pro">Pro</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="button"
                onClick={() => updateRole(member.id)}
                disabled={savingId === member.id}
                className="rounded-md bg-violet-500/80 px-3 py-1 text-sm font-medium text-slate-950 hover:bg-violet-400 disabled:opacity-60"
              >
                {savingId === member.id ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
