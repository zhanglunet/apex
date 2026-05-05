import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { allowedValue, failureStatuses } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = allowedValue(body.status || "OPEN", failureStatuses, "status");
    const card = await prisma.failureCard.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/failure-ops");
    revalidatePath(`/runs/${card.routeRunId}`);
    return NextResponse.json({ card });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update Failure Card failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
