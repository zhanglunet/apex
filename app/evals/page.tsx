import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EvalCaseActions } from "@/components/EvalCaseActions";
import { prisma } from "@/lib/db";

function parseRubric(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as { severity?: string; failureType?: string; expected?: string };
  } catch {
    return null;
  }
}

export default async function EvalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const where = {
    ...(params.status ? { status: params.status } : {}),
  };
  const evalCases = await prisma.evalCase.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { routeRun: true, failureCard: true },
  });

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Eval Cases</h1>
        <p className="mt-1 text-sm text-muted">从 Failure Cards 沉淀出的最小回归样本。</p>

        <form className="mt-6 grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-[220px_120px]">
          <select name="status" defaultValue={params.status || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="RETIRED">RETIRED</option>
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">筛选</button>
        </form>

        <section className="mt-6 rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {evalCases.length} 条 Eval Case</div>
          <div className="divide-y divide-line">
            {evalCases.length ? (
              evalCases.map((item) => {
                const rubric = parseRubric(item.scoringRubricJson);
                return (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.routeType}</span>
                          <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.status}</span>
                          {rubric?.severity ? <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{rubric.severity}</span> : null}
                          {rubric?.failureType ? <span className="text-xs font-medium text-ink">{rubric.failureType}</span> : null}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-ink">{item.expectedBehavior}</p>
                        {rubric?.expected ? <p className="mt-2 text-xs leading-5 text-muted">评分要点：{rubric.expected}</p> : null}
                        {item.failureCard ? <p className="mt-2 text-xs leading-5 text-muted">来源失败：{item.failureCard.description}</p> : null}
                        <Link href={`/runs/${item.routeRunId}`} className="mt-2 inline-block text-xs text-accent">
                          查看任务：{item.routeRun.title}
                        </Link>
                      </div>
                      <EvalCaseActions evalCaseId={item.id} status={item.status} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无 Eval Case。可以先从 Failure Ops 中生成。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
