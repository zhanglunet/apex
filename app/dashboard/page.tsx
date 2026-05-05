import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileText, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const [files, runs, pendingRuns, failures, recentRuns] = await Promise.all([
    prisma.sourceFile.count(),
    prisma.routeRun.count(),
    prisma.routeRun.count({ where: { status: { in: ["DRAFT", "READY"] } } }),
    prisma.failureCard.count(),
    prisma.routeRun.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { sourceFile: true },
    }),
  ]);

  const stats = [
    { label: "上传文件", value: files, icon: FileText },
    { label: "Route Runs", value: runs, icon: PlayCircle },
    { label: "待审核", value: pendingRuns, icon: CheckCircle2 },
    { label: "Failure Cards", value: failures, icon: AlertTriangle },
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded border border-line bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{stat.label}</span>
                  <Icon size={18} className="text-accent" />
                </div>
                <div className="mt-3 text-3xl font-semibold text-ink">{stat.value}</div>
              </div>
            );
          })}
        </section>

        <section className="rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">最近任务</h2>
          </div>
          <div className="divide-y divide-line">
            {recentRuns.length === 0 ? (
              <div className="px-5 py-8 text-sm text-muted">还没有任务。先去 Inbox 上传一份会议转录。</div>
            ) : (
              recentRuns.map((run) => (
                <Link key={run.id} href={`/runs/${run.id}`} className="block px-5 py-4 hover:bg-panel">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-ink">{run.title}</div>
                      <div className="mt-1 text-xs text-muted">{run.sourceFile.filename}</div>
                    </div>
                    <span className="rounded border border-line px-2 py-1 text-xs text-muted">{run.status}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
