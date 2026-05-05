import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requiredText } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = requiredText(body.routeRunId, "routeRunId");
    const run = await prisma.routeRun.findUnique({ where: { id } });
    if (!run) {
      return NextResponse.json({ error: "RouteRun not found." }, { status: 404 });
    }
    const content = requiredText(run.editedOutput || run.generatedOutput, "export content");
    const exportDir = path.join(process.cwd(), "storage", "exports");
    await mkdir(exportDir, { recursive: true });
    const filename = `${run.title.replace(/[^a-zA-Z0-9._-]/g, "_") || "apex_output"}_${Date.now()}.md`;
    const filePath = path.join(exportDir, filename);
    await writeFile(filePath, content, "utf8");
    return NextResponse.json({ filename, path: filePath, content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
