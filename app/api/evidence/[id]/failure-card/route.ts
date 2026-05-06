import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const evidence = await prisma.evidenceItem.findUnique({
    where: { id },
    include: { routeRun: true },
  });
  if (!evidence) {
    return NextResponse.json({ error: "Evidence Item not found." }, { status: 404 });
  }

  const card = await prisma.failureCard.create({
    data: {
      routeRunId: evidence.routeRunId,
      failureType: "MISSING_EVIDENCE",
      severity: evidence.status === "MISSING" ? "P1" : "P2",
      description: `证据不足：${evidence.claim}`,
      originalOutput: evidence.routeRun.generatedOutput || null,
      userRevision: evidence.routeRun.editedOutput || null,
    },
  });

  revalidatePath("/evidence");
  revalidatePath("/failure-ops");
  revalidatePath(`/runs/${evidence.routeRunId}`);
  revalidatePath("/dashboard");
  return NextResponse.json({ card });
}
