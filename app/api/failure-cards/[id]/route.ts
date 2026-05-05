import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status || "OPEN");
  const card = await prisma.failureCard.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/failure-ops");
  revalidatePath(`/runs/${card.routeRunId}`);
  return NextResponse.json({ card });
}
