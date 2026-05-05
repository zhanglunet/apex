"use client";

import { useState } from "react";

export function FailureCardActions({
  cardId,
  routeRunId,
  status,
}: {
  cardId: string;
  routeRunId: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  async function patchStatus() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/failure-cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("更新状态失败");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新状态失败");
    } finally {
      setBusy(false);
    }
  }

  async function createEvalCase() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/eval-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failureCardId: cardId, routeRunId }),
      });
      if (!response.ok) throw new Error("生成 Eval Case 失败");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成 Eval Case 失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-56 flex-col gap-2">
      <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded border border-line px-3 py-2 text-sm">
        <option value="OPEN">OPEN</option>
        <option value="FIXED">FIXED</option>
        <option value="WONT_FIX">WONT_FIX</option>
      </select>
      <button onClick={patchStatus} disabled={busy || nextStatus === status} className="rounded border border-line bg-white px-3 py-2 text-sm text-ink disabled:opacity-60">
        更新状态
      </button>
      <button onClick={createEvalCase} disabled={busy} className="rounded bg-ink px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
        生成 Eval Case
      </button>
      {error ? <div className="text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
