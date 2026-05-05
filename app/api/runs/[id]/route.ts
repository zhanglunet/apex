import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requiredText } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const run = await prisma.routeRun.update({
      where: { id },
      data: {
        editedOutput: requiredText(body.editedOutput, "editedOutput"),
        status: "REVIEWED",
      },
    });
    revalidatePath(`/runs/${id}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update RouteRun failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
