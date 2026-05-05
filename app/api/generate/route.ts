import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateMeetingOutput } from "@/lib/llm";
import { runQualityChecks } from "@/lib/quality";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.routeRunId || "");
    if (!id) return NextResponse.json({ error: "Missing routeRunId." }, { status: 400 });

    const run = await prisma.routeRun.update({
      where: { id },
      data: { status: "GENERATING" },
    });
    const result = await generateMeetingOutput(run.inputText);
    const quality = runQualityChecks(result.markdown);
    const updated = await prisma.routeRun.update({
      where: { id },
      data: {
        generatedOutput: result.markdown,
        editedOutput: result.markdown,
        status: "READY",
        qualityJson: JSON.stringify({ ...quality, rawJson: result.rawJson }),
      },
    });
    await prisma.memoryObject.deleteMany({ where: { routeRunId: id } });
    if (result.data.memoryCandidates.length) {
      await prisma.memoryObject.createMany({
        data: result.data.memoryCandidates.map((item) => ({
          routeRunId: id,
          type: item.type,
          title: item.title,
          content: item.content,
        })),
      });
    }
    revalidatePath(`/runs/${id}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ run: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
