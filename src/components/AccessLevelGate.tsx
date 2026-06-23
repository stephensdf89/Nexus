"use client";

import { ReactNode, useEffect, useState } from "react";

type AccessLevel = "user" | "pro" | "admin";

type AccessResponse = {
  isOwner: boolean;
  accessLevel: AccessLevel;
};

const rank: Record<AccessLevel, number> = {
  user: 0,
  pro: 1,
  admin: 2,
};

export default function AccessLevelGate({
  minimum,
  children,
  blockedTitle,
  blockedDescription,
}: {
  minimum: AccessLevel;
  children: ReactNode;
  blockedTitle: string;
  blockedDescription: string;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/access/me");
        if (!res.ok) {
          setAllowed(false);
          return;
        }

        const data = (await res.json()) as AccessResponse;
        const canAccess = Boolean(data.isOwner) || rank[data.accessLevel] >= rank[minimum];
        setAllowed(canAccess);
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [minimum]);

  if (loading) {
    return <p className="text-sm text-cyan-100/70">Checking feature access...</p>;
  }

  if (!allowed) {
    return (
      <div className="rounded-xl border border-violet-400/35 bg-violet-500/10 p-6">
        <h2 className="text-xl font-semibold text-violet-200">{blockedTitle}</h2>
        <p className="mt-2 text-sm text-violet-100/80">{blockedDescription}</p>
      </div>
    );
  }

  return <>{children}</>;
}
