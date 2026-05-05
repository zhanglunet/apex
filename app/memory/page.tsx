import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/db";

const memoryTypes = ["COMPANY", "PERSON", "EVENT", "THESIS", "ACTION"];

export default async function MemoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const where = {
    ...(params.type ? { type: params.type } : {}),
  };
  const memories = await prisma.memoryObject.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { routeRun: true },
  });

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Memory Library</h1>
        <p className="mt-1 text-sm text-muted">跨会议浏览 R1 沉淀出的组织记忆。</p>

        <form className="mt-6 grid gap-3 rounded border border-line bg-white p-4 sm:grid-cols-[220px_120px]">
          <select name="type" defaultValue={params.type || ""} className="rounded border border-line px-3 py-2 text-sm">
            <option value="">全部类型</option>
            {memoryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-medium text-white">筛选</button>
        </form>

        <section className="mt-6 rounded border border-line bg-white">
          <div className="border-b border-line px-5 py-4 text-sm text-muted">共 {memories.length} 条 Memory Object</div>
          <div className="divide-y divide-line">
            {memories.length ? (
              memories.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-line px-2 py-0.5 text-xs text-muted">{item.type}</span>
                        <span className="text-sm font-medium text-ink">{item.title}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink">{item.content}</p>
                      <Link href={`/runs/${item.routeRunId}`} className="mt-2 inline-block text-xs text-accent">
                        来源任务：{item.routeRun.title}
                      </Link>
                    </div>
                    <div className="text-xs text-muted">{item.createdAt.toLocaleDateString("zh-CN")}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-sm text-muted">暂无 Memory Object。可以先在 R1 任务中生成会议输出。</div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
