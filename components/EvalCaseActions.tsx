"use client";

import { useState } from "react";

export function EvalCaseActions({ evalCaseId, status }: { evalCaseId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/eval-cases/${evalCaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "更新 Eval Case 状态失败");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新 Eval Case 状态失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-48 flex-col gap-2">
      <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded border border-line px-3 py-2 text-sm">
        <option value="ACTIVE">ACTIVE</option>
        <option value="PAUSED">PAUSED</option>
        <option value="RETIRED">RETIRED</option>
      </select>
      <button onClick={updateStatus} disabled={busy || nextStatus === status} className="rounded border border-line bg-white px-3 py-2 text-sm text-ink disabled:opacity-60">
        更新状态
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
