import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Database, FileText, PlayCircle, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";
import { getQualityLabel, getQualityState } from "@/lib/quality-report";

export default async function DashboardPage() {
  const [files, runs, pendingRuns, failures, openFailures, activeEvals, memories, missingEvidence, weakEvidence, supportedEvidence, qualityRuns, recentRuns] = await Promise.all([
    prisma.sourceFile.count(),
    prisma.routeRun.count(),
    prisma.routeRun.count({ where: { status: { in: ["DRAFT", "READY"] } } }),
    prisma.failureCard.count(),
    prisma.failureCard.count({ where: { status: "OPEN" } }),
    prisma.evalCase.count({ where: { status: "ACTIVE" } }),
    prisma.memoryObject.count(),
    prisma.evidenceItem.count({ where: { status: "MISSING" } }),
    prisma.evidenceItem.count({ where: { status: "WEAK" } }),
    prisma.evidenceItem.count({ where: { status: "SUPPORTED" } }),
    prisma.routeRun.findMany({
      where: { qualityJson: { not: null } },
      select: { qualityJson: true },
    }),
    prisma.routeRun.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { sourceFile: true },
    }),
  ]);
  const blockingQualityRuns = qualityRuns.filter((run) => getQualityState(run.qualityJson) === "blocking").length;

  const stats = [
    { label: "上传文件", value: files, icon: FileText, href: "/inbox" },
    { label: "Route Runs", value: runs, icon: PlayCircle, href: "/runs" },
    { label: "待审核", value: pendingRuns, icon: CheckCircle2, href: "/runs?status=READY" },
    { label: "阻断质量项", value: blockingQualityRuns, icon: ShieldCheck, href: "/runs" },
    { label: "Open Failures", value: openFailures, icon: AlertTriangle, href: "/failure-ops?status=OPEN" },
    { label: "Active Evals", value: activeEvals, icon: ClipboardCheck, href: "/evals?status=ACTIVE" },
    { label: "Memory Objects", value: memories, icon: Database, href: "/memory" },
    { label: "Missing Evidence", value: missingEvidence, icon: ShieldCheck, href: "/evidence?status=MISSING" },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">R1 Meeting Intelligence 的本地最小工作台。</p>
          </div>
          <Link href="/inbox" className="inline-flex items-center justify-center rounded bg-accent px-4 py-2 text-sm font-medium text-white">
            上传会议材料
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="rounded border border-line bg-white p-4 hover:bg-panel">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{stat.label}</span>
                  <Icon size={18} className="text-accent" />
                </div>
                <div className="mt-3 text-3xl font-semibold text-ink">{stat.value}</div>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <Link href="/evidence?status=MISSING" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">缺证据项</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{missingEvidence}</div>
            <p className="mt-2 text-xs leading-5 text-muted">进入 Evidence 工作台修复 MISSING 证据缺口。</p>
          </Link>
          <Link href="/evidence?status=WEAK" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">弱证据项</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{weakEvidence}</div>
            <p className="mt-2 text-xs leading-5 text-muted">查看证据不足或仍需确认的输出项。</p>
          </Link>
          <Link href="/evidence?status=SUPPORTED" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">已支持证据项</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{supportedEvidence}</div>
            <p className="mt-2 text-xs leading-5 text-muted">查看已有明确证据支撑的输出项。</p>
          </Link>
          <Link href="/memory" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">组织记忆沉淀</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{memories}</div>
            <p className="mt-2 text-xs leading-5 text-muted">查看从会议输出中沉淀出的 Memory Objects。</p>
          </Link>
          <Link href="/failure-ops?status=OPEN" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">失败样本待处理</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{openFailures}</div>
            <p className="mt-2 text-xs leading-5 text-muted">进入 Failure Ops 关闭、修复或转为回归样本。</p>
          </Link>
          <Link href="/evals?status=ACTIVE" className="rounded border border-line bg-white p-4 hover:bg-panel">
            <div className="text-sm font-medium text-ink">活跃回归样本</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{activeEvals}</div>
            <p className="mt-2 text-xs leading-5 text-muted">查看当前会进入后续回归验证的 Eval Cases。</p>
          </Link>
          <div className="rounded border border-line bg-white p-4">
            <div className="text-sm font-medium text-ink">历史 Failure Cards</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{failures}</div>
            <p className="mt-2 text-xs leading-5 text-muted">累计质量问题数量，用于观察质量运营沉淀速度。</p>
          </div>
        </section>

        <section className="rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">最近任务</h2>
          </div>
          <div className="divide-y divide-line">
            {recentRuns.length === 0 ? (
              <div className="px-5 py-8 text-sm text-muted">还没有任务。先去 Inbox 上传一份会议转录。</div>
            ) : (
              recentRuns.map((run) => {
                const qualityState = getQualityState(run.qualityJson);
                return (
                  <Link key={run.id} href={`/runs/${run.id}`} className="block px-5 py-4 hover:bg-panel">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-ink">{run.title}</div>
                        <div className="mt-1 text-xs text-muted">{run.sourceFile.filename}</div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <span className="rounded border border-line px-2 py-1 text-xs text-muted">{run.status}</span>
                        <span className={qualityState === "blocking" ? "rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700" : "rounded border border-line px-2 py-1 text-xs text-muted"}>
                          {getQualityLabel(qualityState)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
