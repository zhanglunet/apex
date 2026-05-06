CREATE TABLE IF NOT EXISTS "SourceFile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "textContent" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "RouteRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routeType" TEXT NOT NULL DEFAULT 'R1_MEETING_INTELLIGENCE',
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sourceFileId" TEXT NOT NULL,
  "inputText" TEXT NOT NULL,
  "generatedOutput" TEXT,
  "editedOutput" TEXT,
  "qualityJson" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "RouteRun_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "SourceFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FailureCard" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routeRunId" TEXT NOT NULL,
  "failureType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "originalOutput" TEXT,
  "userRevision" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FailureCard_routeRunId_fkey" FOREIGN KEY ("routeRunId") REFERENCES "RouteRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MemoryObject" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "routeRunId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MemoryObject_routeRunId_fkey" FOREIGN KEY ("routeRunId") REFERENCES "RouteRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "RouteRun_sourceFileId_idx" ON "RouteRun" ("sourceFileId");
CREATE INDEX IF NOT EXISTS "FailureCard_routeRunId_idx" ON "FailureCard" ("routeRunId");
CREATE INDEX IF NOT EXISTS "MemoryObject_routeRunId_idx" ON "MemoryObject" ("routeRunId");

CREATE TABLE IF NOT EXISTS "EvalCase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routeRunId" TEXT NOT NULL,
  "failureCardId" TEXT,
  "routeType" TEXT NOT NULL,
  "inputText" TEXT NOT NULL,
  "expectedBehavior" TEXT NOT NULL,
  "scoringRubricJson" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvalCase_routeRunId_fkey" FOREIGN KEY ("routeRunId") REFERENCES "RouteRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "EvalCase_failureCardId_fkey" FOREIGN KEY ("failureCardId") REFERENCES "FailureCard" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EvalCase_routeRunId_idx" ON "EvalCase" ("routeRunId");
CREATE INDEX IF NOT EXISTS "EvalCase_failureCardId_idx" ON "EvalCase" ("failureCardId");

CREATE TABLE IF NOT EXISTS "EvidenceItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "routeRunId" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "claim" TEXT NOT NULL,
  "evidenceText" TEXT NOT NULL,
  "sourceHint" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUPPORTED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvidenceItem_routeRunId_fkey" FOREIGN KEY ("routeRunId") REFERENCES "RouteRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EvidenceItem_routeRunId_idx" ON "EvidenceItem" ("routeRunId");
CREATE INDEX IF NOT EXISTS "EvidenceItem_status_idx" ON "EvidenceItem" ("status");
CREATE INDEX IF NOT EXISTS "EvidenceItem_section_idx" ON "EvidenceItem" ("section");
