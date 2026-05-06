"use client";

import { useState } from "react";

export function EvidenceActions({ evidenceId, status }: { evidenceId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canCreateFailure = status === "MISSING" || status === "WEAK";

  async function createFailureCard() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/failure-card`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "创建 Failure Card 失败");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建 Failure Card 失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-40 flex-col gap-2">
      <button
        onClick={createFailureCard}
        disabled={busy || !canCreateFailure}
        className="rounded border border-line bg-white px-3 py-2 text-sm text-ink disabled:opacity-60"
      >
        创建 Failure Card
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
