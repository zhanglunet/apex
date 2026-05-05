import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const id = String(body.routeRunId || "");
  const run = await prisma.routeRun.findUniqueOrThrow({ where: { id } });
  const content = run.editedOutput || run.generatedOutput || "";
  const exportDir = path.join(process.cwd(), "storage", "exports");
  await mkdir(exportDir, { recursive: true });
  const filename = `${run.title.replace(/[^a-zA-Z0-9._-]/g, "_") || "apex_output"}_${Date.now()}.md`;
  const filePath = path.join(exportDir, filename);
  await writeFile(filePath, content, "utf8");
  return NextResponse.json({ filename, path: filePath, content });
}
