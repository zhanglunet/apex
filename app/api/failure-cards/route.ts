import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const routeRunId = String(body.routeRunId || "");
  if (!routeRunId) return NextResponse.json({ error: "Missing routeRunId." }, { status: 400 });
  const card = await prisma.failureCard.create({
    data: {
      routeRunId,
      failureType: String(body.failureType || "OTHER"),
      severity: String(body.severity || "P2"),
      description: String(body.description || ""),
      originalOutput: body.originalOutput ? String(body.originalOutput) : null,
      userRevision: body.userRevision ? String(body.userRevision) : null,
    },
  });
  revalidatePath(`/runs/${routeRunId}`);
  revalidatePath("/dashboard");
  return NextResponse.json({ card });
}
