import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import packageJson from "@/package.json";

export async function GET() {
  const [sourceFiles, routeRuns, failureCards, evalCases, memoryObjects] = await Promise.all([
    prisma.sourceFile.count(),
    prisma.routeRun.count(),
    prisma.failureCard.count(),
    prisma.evalCase.count(),
    prisma.memoryObject.count(),
  ]);

  return NextResponse.json({
    status: "ok",
    version: packageJson.version,
    checkedAt: new Date().toISOString(),
    counts: {
      sourceFiles,
      routeRuns,
      failureCards,
      evalCases,
      memoryObjects,
    },
  });
}
