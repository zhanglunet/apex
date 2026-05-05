import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FailureCardActions } from "@/components/FailureCardActions";
import { prisma } from "@/lib/db";

export default async function FailureOpsPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; status?: string; failureType?: string }>;
}) {
  const params = await searchParams;
  const where = {
    ...(params.severity ? { severity: params.severity } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.failureType ? { failureType: params.failureType } : {}),
  };
  const cards = await prisma.failureCard.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { routeRun: true, evalCases: true },
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Failure Ops</h1>
          <p className="mt-1 text-sm text-muted">集中处理 R1 输出失败样本，并沉淀为 eval case。</p>
        </div>

        <form className="grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-4">
          <select name="severity" defaultValue={params.severity || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部等级</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
          <select name="status" defaultValue={params.status || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="OPEN">OPEN</option>
            <option value="FIXED">FIXED</option>
            <option value="WONT_FIX">WONT_FIX</option>
          </select>
          <select name="failureType" defaultValue={params.failureType || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部类型</option>
            <option value="FACT_ERROR">事实错误</option>
            <option value="MISSING_EVIDENCE">证据缺失</option>
            <option value="WRONG_CITATION">引用错误</option>
            <option value="RISK_MISS">风险遗漏</option>
            <option value="FORMAT_ERROR">结构错误</option>
            <option value="OTHER">其他</option>
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">筛选</button>
        </form>

        <section className="rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {cards.length} 条 Failure Card</div>
          <div className="divide-y divide-line">
            {cards.length ? (
              cards.map((card) => (
                <div key={card.id} className="px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{card.severity}</span>
                        <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{card.status}</span>
                        <span className="text-sm font-medium text-ink">{card.failureType}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink">{card.description}</p>
                      <Link href={`/runs/${card.routeRunId}`} className="mt-2 inline-block text-xs text-accent">
                        查看任务：{card.routeRun.title}
                      </Link>
                    </div>
                    <FailureCardActions cardId={card.id} routeRunId={card.routeRunId} status={card.status} evalCaseCount={card.evalCases.length} />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无失败样本。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
