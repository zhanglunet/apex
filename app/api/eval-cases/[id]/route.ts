import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

const allowedStatuses = new Set(["ACTIVE", "PAUSED", "RETIRED"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status || "").toUpperCase();

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Unsupported Eval Case status." }, { status: 400 });
  }

  const evalCase = await prisma.evalCase.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/evals");
  revalidatePath("/failure-ops");
  return NextResponse.json({ evalCase });
}
