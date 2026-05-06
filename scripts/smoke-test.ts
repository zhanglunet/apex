import { readFile } from "node:fs/promises";

const baseUrl = process.env.APP_URL || "http://localhost:3000";

async function assertOk(response: Response, label: string) {
  if (!response.ok && ![303, 307, 308].includes(response.status)) {
    const text = await response.text();
    throw new Error(`${label} failed: ${response.status} ${text}`);
  }
}

async function assertPage(path: string) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  await assertOk(response, `page ${path}`);
  console.log(`OK page: ${path}`);
}

async function assertBadRequest(response: Response, label: string) {
  if (response.status !== 400) {
    const text = await response.text();
    throw new Error(`${label} expected 400, got ${response.status} ${text}`);
  }
  console.log(`OK validation: ${label}`);
}

async function assertHealth() {
  const response = await fetch(`${baseUrl}/api/health`);
  await assertOk(response, "health");
  const payload = await response.json();
  if (payload.status !== "ok" || !payload.version || !payload.counts) {
    throw new Error("health response missing required fields.");
  }
  console.log(`OK health: ${payload.version}`);
}

async function getHealthCounts() {
  const response = await fetch(`${baseUrl}/api/health`);
  await assertOk(response, "health counts");
  const payload = await response.json();
  return payload.counts as { evidenceItems?: number };
}

async function main() {
  console.log(`Smoke test target: ${baseUrl}`);

  await assertHealth();
  await assertPage("/dashboard");
  await assertPage("/inbox");
  await assertPage("/runs");
  await assertPage("/evidence");

  const sample = await readFile("samples/sample_meeting.md");
  const formData = new FormData();
  formData.append("file", new Blob([sample], { type: "text/markdown" }), "sample_meeting.md");
  const uploadResponse = await fetch(`${baseUrl}/api/upload`, { method: "POST", body: formData });
  await assertOk(uploadResponse, "upload");
  const uploadPayload = await uploadResponse.json();
  const sourceFileId = uploadPayload.sourceFile.id as string;
  console.log(`OK upload: ${sourceFileId}`);

  const runForm = new FormData();
  runForm.append("sourceFileId", sourceFileId);
  const runResponse = await fetch(`${baseUrl}/api/runs`, { method: "POST", body: runForm, redirect: "manual" });
  await assertOk(runResponse, "create run");
  const location = runResponse.headers.get("location");
  const routeRunId = location?.split("/").pop();
  if (!routeRunId) throw new Error("create run did not return a route id.");
  console.log(`OK create run: ${routeRunId}`);

  const emptyExportResponse = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId }),
  });
  await assertBadRequest(emptyExportResponse, "empty export content");

  const missingExportIdResponse = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId: "" }),
  });
  await assertBadRequest(missingExportIdResponse, "missing export routeRunId");

  const generateResponse = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId }),
  });
  await assertOk(generateResponse, "generate");
  console.log("OK generate");

  const countsAfterGenerate = await getHealthCounts();
  if (!countsAfterGenerate.evidenceItems || countsAfterGenerate.evidenceItems < 1) {
    throw new Error("generate did not create Evidence Items.");
  }
  console.log(`OK evidence items: ${countsAfterGenerate.evidenceItems}`);

  const saveResponse = await fetch(`${baseUrl}/api/runs/${routeRunId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ editedOutput: "# Smoke Test Output\n\n## 行动项\n- 任务：验证链路\n  - Owner：待确认\n  - Deadline：待确认\n  - 证据：smoke test" }),
  });
  await assertOk(saveResponse, "save");
  console.log("OK save");

  const emptySaveResponse = await fetch(`${baseUrl}/api/runs/${routeRunId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ editedOutput: "" }),
  });
  await assertBadRequest(emptySaveResponse, "empty edited output");

  const failureResponse = await fetch(`${baseUrl}/api/failure-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routeRunId,
      failureType: "FORMAT_ERROR",
      severity: "P2",
      description: "Smoke test failure card",
      originalOutput: "original",
      userRevision: "revision",
    }),
  });
  await assertOk(failureResponse, "failure card");
  const failurePayload = await failureResponse.json();
  const failureCardId = failurePayload.card.id as string;
  console.log(`OK failure card: ${failureCardId}`);

  const emptyFailureResponse = await fetch(`${baseUrl}/api/failure-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routeRunId,
      failureType: "FORMAT_ERROR",
      severity: "P2",
      description: "",
    }),
  });
  await assertBadRequest(emptyFailureResponse, "empty failure description");

  const invalidSeverityResponse = await fetch(`${baseUrl}/api/failure-cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routeRunId,
      failureType: "FORMAT_ERROR",
      severity: "PX",
      description: "Invalid severity should fail",
    }),
  });
  await assertBadRequest(invalidSeverityResponse, "invalid failure severity");

  const invalidFailureStatusResponse = await fetch(`${baseUrl}/api/failure-cards/${failureCardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "UNKNOWN" }),
  });
  await assertBadRequest(invalidFailureStatusResponse, "invalid failure status");

  const evalResponse = await fetch(`${baseUrl}/api/eval-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId, failureCardId }),
  });
  await assertOk(evalResponse, "eval case");
  const evalPayload = await evalResponse.json();
  const evalCaseId = evalPayload.evalCase.id as string;
  console.log("OK eval case");

  const duplicateEvalResponse = await fetch(`${baseUrl}/api/eval-cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId, failureCardId }),
  });
  await assertOk(duplicateEvalResponse, "duplicate eval case");
  const duplicateEvalPayload = await duplicateEvalResponse.json();
  if (!duplicateEvalPayload.existing) {
    throw new Error("duplicate eval case did not return the existing record.");
  }
  console.log("OK duplicate eval guard");

  const evalStatusResponse = await fetch(`${baseUrl}/api/eval-cases/${evalCaseId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "PAUSED" }),
  });
  await assertOk(evalStatusResponse, "eval case status update");
  const evalStatusPayload = await evalStatusResponse.json();
  if (evalStatusPayload.evalCase.status !== "PAUSED") {
    throw new Error("eval case status update did not persist.");
  }
  console.log("OK eval case status update");

  const exportResponse = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routeRunId }),
  });
  await assertOk(exportResponse, "export");
  console.log("OK export");

  await assertPage(`/runs/${routeRunId}`);
  await assertPage("/runs?status=REVIEWED");
  await assertPage("/failure-ops");
  await assertPage("/failure-ops?status=OPEN");
  await assertPage("/evals");
  await assertPage("/evals?status=PAUSED");
  await assertPage("/evidence?status=MISSING");
  await assertPage("/evidence?section=ACTION_ITEM");
  await assertPage("/memory");
  await assertPage("/memory?type=EVENT");

  console.log("Smoke test passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
