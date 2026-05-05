import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";

export default async function EvalsPage() {
  const evalCases = await prisma.evalCase.findMany({
    orderBy: { createdAt: "desc" },
    include: { routeRun: true, failureCard: true },
  });

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Eval Cases</h1>
        <p className="mt-1 text-sm text-muted">从 Failure Cards 沉淀出的最小回归样本。</p>
        <section className="mt-6 rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {evalCases.length} 条 Eval Case</div>
          <div className="divide-y divide-line">
            {evalCases.length ? (
              evalCases.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.routeType}</span>
                    <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink">{item.expectedBehavior}</p>
                  <Link href={`/runs/${item.routeRunId}`} className="mt-2 inline-block text-xs text-accent">
                    查看任务：{item.routeRun.title}
                  </Link>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无 Eval Case。可以先从 Failure Ops 中生成。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
