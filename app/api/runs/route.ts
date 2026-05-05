import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const sourceFileId = String(formData.get("sourceFileId") || "");
  if (!sourceFileId) {
    throw new Error("Missing sourceFileId.");
  }
  const sourceFile = await prisma.sourceFile.findUniqueOrThrow({ where: { id: sourceFileId } });
  const run = await prisma.routeRun.create({
    data: {
      title: sourceFile.filename.replace(/\.[^.]+$/, ""),
      sourceFileId,
      inputText: sourceFile.textContent,
    },
  });
  redirect(`/runs/${run.id}`);
}
