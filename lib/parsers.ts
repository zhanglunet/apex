import mammoth from "mammoth";

export async function parseUploadedFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return buffer.toString("utf8").trim();
  }
  throw new Error("Only .txt, .md, and .docx files are supported in this MVP.");
}
