"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export function FileUploader() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "上传失败");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-panel text-accent">
          <Upload size={19} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">上传会议材料</h2>
          <p className="text-xs text-muted">支持 .txt、.md、.docx</p>
        </div>
      </div>
      <input
        className="mt-5 w-full rounded border border-line bg-white px-3 py-2 text-sm"
        type="file"
        name="file"
        accept=".txt,.md,.docx,text/plain,text/markdown"
        required
      />
      {error ? <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <button disabled={pending} className="mt-4 w-full rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "上传中..." : "上传"}
      </button>
    </form>
  );
}
