import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const run = await prisma.routeRun.update({
    where: { id },
    data: {
      editedOutput: String(body.editedOutput || ""),
      status: "REVIEWED",
    },
  });
  revalidatePath(`/runs/${id}`);
  revalidatePath("/dashboard");
  return NextResponse.json({ run });
}
