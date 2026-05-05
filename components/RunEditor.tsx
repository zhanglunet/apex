"use client";

import { useState } from "react";
import { AlertTriangle, Download, Save, Sparkles } from "lucide-react";

type FailureCard = {
  id: string;
  failureType: string;
  severity: string;
  description: string;
  status: string;
  createdAt: string;
};

type RunView = {
  id: string;
  title: string;
  status: string;
  inputText: string;
  generatedOutput: string | null;
  editedOutput: string | null;
  qualityJson: string | null;
  sourceFilename: string;
  failureCards: FailureCard[];
};

export function RunEditor({ run }: { run: RunView }) {
  const [output, setOutput] = useState(run.editedOutput || run.generatedOutput || "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failureType, setFailureType] = useState("FACT_ERROR");
  const [severity, setSeverity] = useState("P2");
  const [description, setDescription] = useState("");

  async function callApi(path: string, body: Record<string, unknown>, method = "POST") {
    setError(null);
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "请求失败");
    return payload;
  }

  async function generate() {
    setBusy("generate");
    try {
      const payload = await callApi("/api/generate", { routeRunId: run.id });
      setOutput(payload.run.editedOutput || payload.run.generatedOutput || "");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setBusy(null);
    }
  }

  async function saveEditedOutput(reload = true) {
    try {
      await callApi(`/api/runs/${run.id}`, { editedOutput: output }, "PATCH");
      if (reload) window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
      throw err;
    }
  }

  async function save() {
    setBusy("save");
    try {
      await saveEditedOutput();
    } finally {
      setBusy(null);
    }
  }

  async function exportMarkdown() {
    setBusy("export");
    try {
      await saveEditedOutput(false);
      const payload = await callApi("/api/export", { routeRunId: run.id });
      const blob = new Blob([payload.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = payload.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导出失败");
    } finally {
      setBusy(null);
    }
  }

  async function createFailureCard() {
    setBusy("failure");
    try {
      await callApi("/api/failure-cards", {
        routeRunId: run.id,
        failureType,
        severity,
        description,
        originalOutput: run.generatedOutput || "",
        userRevision: output,
      });
      setDescription("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建 Failure Card 失败");
    } finally {
      setBusy(null);
    }
  }

  const quality = run.qualityJson ? JSON.parse(run.qualityJson) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted">R1 Meeting Intelligence</div>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{run.title}</h1>
          <p className="mt-1 text-sm text-muted">{run.sourceFilename}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={generate} disabled={!!busy} className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            <Sparkles size={16} />
            {busy === "generate" ? "生成中..." : "生成"}
          </button>
          <button onClick={save} disabled={!!busy} className="inline-flex items-center gap-2 rounded border border-line bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-60">
            <Save size={16} />
            保存
          </button>
          <button onClick={exportMarkdown} disabled={!!busy || !output} className="inline-flex items-center gap-2 rounded border border-line bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-60">
            <Download size={16} />
            导出 Markdown
          </button>
        </div>
      </div>

      {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">原始输入</h2>
          </div>
          <pre className="h-[620px] overflow-auto whitespace-pre-wrap px-4 py-4 text-sm leading-6 text-ink">{run.inputText}</pre>
        </div>
        <div className="rounded border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">生成 / 修订输出</h2>
          </div>
          <textarea
            value={output}
            onChange={(event) => setOutput(event.target.value)}
            placeholder="点击“生成”创建结构化会议纪要。"
            className="h-[620px] w-full border-0 px-4 py-4 text-sm leading-6 outline-none"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded border border-line bg-white p-5">
          <h2 className="text-base font-semibold text-ink">Quality Panel</h2>
          {quality ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Object.entries(quality).map(([key, value]) => (
                <div key={key} className="rounded border border-line bg-panel p-3">
                  <div className="text-xs text-muted">{key}</div>
                  <div className="mt-2 text-sm font-semibold text-ink">{value ? "通过" : "待检查"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">生成后会展示基础质量检查。</p>
          )}
        </div>

        <div className="rounded border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-signal" />
            <h2 className="text-base font-semibold text-ink">Failure Card</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <select value={failureType} onChange={(event) => setFailureType(event.target.value)} className="rounded border border-line px-3 py-2 text-sm">
              <option value="FACT_ERROR">事实错误</option>
              <option value="MISSING_EVIDENCE">证据缺失</option>
              <option value="WRONG_CITATION">引用错误</option>
              <option value="RISK_MISS">风险遗漏</option>
              <option value="FORMAT_ERROR">结构错误</option>
              <option value="OTHER">其他</option>
            </select>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="rounded border border-line px-3 py-2 text-sm">
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="描述失败、修订原因或需要回归测试的点。"
            className="mt-3 h-28 w-full rounded border border-line px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button onClick={createFailureCard} disabled={!!busy || !description} className="mt-3 w-full rounded bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            记录失败样本
          </button>
          <div className="mt-4 space-y-2">
            {run.failureCards.map((card) => (
              <div key={card.id} className="rounded border border-line bg-panel p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{card.failureType}</span>
                  <span className="text-muted">{card.severity}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
