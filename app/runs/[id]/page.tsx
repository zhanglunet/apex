import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RunEditor } from "@/components/RunEditor";
import { prisma } from "@/lib/db";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await prisma.routeRun.findUnique({
    where: { id },
    include: {
      sourceFile: true,
      failureCards: { orderBy: { createdAt: "desc" } },
      memoryObjects: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!run) notFound();

  return (
    <AppShell>
      <RunEditor
        run={{
          id: run.id,
          title: run.title,
          status: run.status,
          inputText: run.inputText,
          generatedOutput: run.generatedOutput,
          editedOutput: run.editedOutput,
          qualityJson: run.qualityJson,
          sourceFilename: run.sourceFile.filename,
          failureCards: run.failureCards.map((card) => ({
            id: card.id,
            failureType: card.failureType,
            severity: card.severity,
            description: card.description,
            status: card.status,
            createdAt: card.createdAt.toISOString(),
          })),
          memoryObjects: run.memoryObjects.map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            content: item.content,
          })),
        }}
      />
    </AppShell>
  );
}
