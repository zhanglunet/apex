import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";
import { getQualityLabel, getQualityState } from "@/lib/quality-report";

const runStatuses = ["DRAFT", "GENERATING", "READY", "REVIEWED"];

export default async function RunsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const where = {
    ...(params.status ? { status: params.status } : {}),
  };
  const runs = await prisma.routeRun.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { sourceFile: true },
  });

  return (
    <AppShell>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Route Runs</h1>
            <p className="mt-1 text-sm text-muted">查看和筛选全部 R1 任务。</p>
          </div>
          <Link href="/inbox" className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-white">
            上传会议材料
          </Link>
        </div>

        <form className="mt-6 grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-[220px_120px]">
          <select name="status" defaultValue={params.status || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部状态</option>
            {runStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">筛选</button>
        </form>

        <section className="mt-6 rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {runs.length} 个 RouteRun</div>
          <div className="divide-y divide-line">
            {runs.length ? (
              runs.map((run) => {
                const qualityState = getQualityState(run.qualityJson);
                return (
                  <Link key={run.id} href={`/runs/${run.id}`} className="block px-5 py-4 hover:bg-panel">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-ink">{run.title}</div>
                        <div className="mt-1 text-xs text-muted">{run.sourceFile.filename}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <span className="rounded border border-line px-2 py-1 text-xs text-muted">{run.status}</span>
                        <span className={qualityState === "blocking" ? "rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700" : "rounded border border-line px-2 py-1 text-xs text-muted"}>
                          {getQualityLabel(qualityState)}
                        </span>
                        <span className="rounded border border-line px-2 py-1 text-xs text-muted">
                          {run.updatedAt.toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无符合条件的任务。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
