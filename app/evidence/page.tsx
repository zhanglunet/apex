import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";

const statuses = ["SUPPORTED", "WEAK", "MISSING"];
const sections = ["KEY_CHANGE", "ACTION_ITEM", "OPEN_QUESTION", "QUALITY_WARNING"];

function statusClass(status: string) {
  if (status === "SUPPORTED") return "border-green-200 bg-green-50 text-green-700";
  if (status === "WEAK") return "border-yellow-200 bg-yellow-50 text-yellow-700";
  return "border-red-200 bg-red-50 text-red-700";
}

export default async function EvidencePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; section?: string }>;
}) {
  const params = await searchParams;
  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.section ? { section: params.section } : {}),
  };
  const evidenceItems = await prisma.evidenceItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { routeRun: true },
  });

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Evidence</h1>
        <p className="mt-1 text-sm text-muted">集中查看 R1 输出中的证据项和证据缺口。</p>

        <form className="mt-6 grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-[220px_220px_120px]">
          <select name="status" defaultValue={params.status || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部状态</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="section" defaultValue={params.section || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部区块</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">筛选</button>
        </form>

        <section className="mt-6 rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {evidenceItems.length} 条 Evidence Item</div>
          <div className="divide-y divide-line">
            {evidenceItems.length ? (
              evidenceItems.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.section}</span>
                        <span className={`rounded border px-2 py-0.5 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                      <p className="mt-3 text-sm font-medium leading-6 text-ink">{item.claim}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.evidenceText}</p>
                      {item.sourceHint ? <div className="mt-2 text-xs text-muted">来源字段：{item.sourceHint}</div> : null}
                      <Link href={`/runs/${item.routeRunId}`} className="mt-2 inline-block text-xs text-accent">
                        查看任务：{item.routeRun.title}
                      </Link>
                    </div>
                    <div className="text-xs text-muted">{item.createdAt.toLocaleDateString("zh-CN")}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无符合条件的 Evidence Item。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
