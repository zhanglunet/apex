import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { allowedValue, failureTypes, requiredText, severityLevels } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const routeRunId = requiredText(body.routeRunId, "routeRunId");
    const card = await prisma.failureCard.create({
      data: {
        routeRunId,
        failureType: allowedValue(body.failureType || "OTHER", failureTypes, "failureType"),
        severity: allowedValue(body.severity || "P2", severityLevels, "severity"),
        description: requiredText(body.description, "description"),
        originalOutput: body.originalOutput ? String(body.originalOutput) : null,
        userRevision: body.userRevision ? String(body.userRevision) : null,
      },
    });
    revalidatePath(`/runs/${routeRunId}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ card });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create Failure Card failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
