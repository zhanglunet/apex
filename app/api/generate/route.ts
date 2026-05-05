import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { generateMeetingOutput } from "@/lib/llm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.routeRunId || "");
    if (!id) return NextResponse.json({ error: "Missing routeRunId." }, { status: 400 });

    const run = await prisma.routeRun.update({
      where: { id },
      data: { status: "GENERATING" },
    });
    const output = await generateMeetingOutput(run.inputText);
    const updated = await prisma.routeRun.update({
      where: { id },
      data: {
        generatedOutput: output,
        editedOutput: output,
        status: "READY",
        qualityJson: JSON.stringify({
          hasActionItems: output.includes("## 行动项"),
          hasOpenQuestions: output.includes("## Open Questions"),
          hasQualityWarnings: output.includes("## Quality Warnings"),
        }),
      },
    });
    revalidatePath(`/runs/${id}`);
    revalidatePath("/dashboard");
    return NextResponse.json({ run: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
