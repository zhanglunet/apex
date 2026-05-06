import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const section = url.searchParams.get("section") || undefined;
  const evidenceItems = await prisma.evidenceItem.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(section ? { section } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { routeRun: true },
  });
  return NextResponse.json({ evidenceItems });
}
