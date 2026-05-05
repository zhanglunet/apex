import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { parseUploadedFile } from "@/lib/parsers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }
    const textContent = await parseUploadedFile(file);
    if (!textContent) {
      return NextResponse.json({ error: "File did not contain readable text." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "storage", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${Date.now()}_${safeName}`;
    const storedPath = path.join(uploadDir, storedName);
    await writeFile(storedPath, Buffer.from(await file.arrayBuffer()));

    const sourceFile = await prisma.sourceFile.create({
      data: {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        path: storedPath,
        textContent,
      },
    });
    revalidatePath("/inbox");
    revalidatePath("/dashboard");
    return NextResponse.json({ sourceFile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
