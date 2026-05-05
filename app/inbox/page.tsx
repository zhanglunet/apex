import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FileUploader } from "@/components/FileUploader";
import { prisma } from "@/lib/db";

export default async function InboxPage() {
  const files = await prisma.sourceFile.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { routeRuns: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <h1 className="text-2xl font-semibold text-ink">Inbox</h1>
          <p className="mt-1 text-sm text-muted">上传 .txt、.md 或 .docx 会议材料，创建 R1 任务。</p>
          <div className="mt-6 rounded border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-ink">上传记录</h2>
            </div>
            <div className="divide-y divide-line">
              {files.length === 0 ? (
                <div className="px-5 py-8 text-sm text-muted">还没有上传文件。</div>
              ) : (
                files.map((file) => {
                  const run = file.routeRuns[0];
                  return (
                    <div key={file.id} className="px-5 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-medium text-ink">{file.filename}</div>
                          <div className="mt-1 text-xs text-muted">{file.textContent.length.toLocaleString()} 字符</div>
                          <p className="mt-3 line-clamp-3 text-sm text-muted">{file.textContent.slice(0, 240)}</p>
                        </div>
                        {run ? (
                          <Link href={`/runs/${run.id}`} className="rounded border border-line px-3 py-2 text-sm text-ink hover:bg-panel">
                            查看任务
                          </Link>
                        ) : (
                          <form action="/api/runs" method="post">
                            <input type="hidden" name="sourceFileId" value={file.id} />
                            <button className="rounded bg-accent px-3 py-2 text-sm font-medium text-white">创建 R1</button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
        <aside>
          <FileUploader />
        </aside>
      </div>
    </AppShell>
  );
}
