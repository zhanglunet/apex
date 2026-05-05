import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const failureCardId = String(body.failureCardId || "");
  const routeRunId = String(body.routeRunId || "");
  if (!failureCardId || !routeRunId) {
    return NextResponse.json({ error: "Missing failureCardId or routeRunId." }, { status: 400 });
  }
  const [card, run] = await Promise.all([
    prisma.failureCard.findUniqueOrThrow({ where: { id: failureCardId } }),
    prisma.routeRun.findUniqueOrThrow({ where: { id: routeRunId } }),
  ]);
  if (card.routeRunId !== run.id) {
    return NextResponse.json({ error: "Failure Card does not belong to this RouteRun." }, { status: 400 });
  }

  const existing = await prisma.evalCase.findFirst({
    where: { failureCardId },
  });
  if (existing) {
    revalidatePath("/evals");
    revalidatePath("/failure-ops");
    return NextResponse.json({ evalCase: existing, existing: true });
  }

  const evalCase = await prisma.evalCase.create({
    data: {
      failureCardId,
      routeRunId,
      routeType: run.routeType,
      inputText: run.inputText,
      expectedBehavior: `避免再次出现 ${card.failureType}：${card.description}`,
      scoringRubricJson: JSON.stringify({
        severity: card.severity,
        failureType: card.failureType,
        expected: "新输出应修复该失败，并保留行动项、开放问题和质量警告。",
      }),
    },
  });
  revalidatePath("/evals");
  revalidatePath("/failure-ops");
  return NextResponse.json({ evalCase });
}
