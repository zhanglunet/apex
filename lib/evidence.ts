import type { MeetingJson } from "./meeting";

export type EvidenceSection = "KEY_CHANGE" | "ACTION_ITEM" | "OPEN_QUESTION" | "QUALITY_WARNING";
export type EvidenceStatus = "SUPPORTED" | "WEAK" | "MISSING";

export type EvidenceDraft = {
  section: EvidenceSection;
  claim: string;
  evidenceText: string;
  sourceHint?: string;
  status: EvidenceStatus;
};

const missingPatterns = ["", "无", "无证据", "缺少", "缺失", "无法确认", "未提及", "不确定"];
const weakPatterns = ["待确认", "可能", "会议中提及", "需要确认", "需确认"];

function cleanText(value: string) {
  return value.trim();
}

export function classifyEvidence(evidenceText: string): EvidenceStatus {
  const normalized = cleanText(evidenceText);
  if (!normalized) return "MISSING";
  if (missingPatterns.some((pattern) => pattern && normalized.includes(pattern))) return "MISSING";
  if (weakPatterns.some((pattern) => normalized.includes(pattern))) return "WEAK";
  if (normalized.length < 8) return "WEAK";
  return "SUPPORTED";
}

function evidenceItem(section: EvidenceSection, claim: string, evidenceText: string, sourceHint?: string): EvidenceDraft {
  const cleanedClaim = cleanText(claim) || "待确认";
  const cleanedEvidence = cleanText(evidenceText);
  return {
    section,
    claim: cleanedClaim,
    evidenceText: cleanedEvidence || "缺少证据",
    sourceHint,
    status: classifyEvidence(cleanedEvidence),
  };
}

export function extractEvidenceItems(data: MeetingJson): EvidenceDraft[] {
  const items: EvidenceDraft[] = [];

  for (const item of data.keyChanges) {
    items.push(evidenceItem("KEY_CHANGE", item.change, item.evidence, "keyChanges.evidence"));
  }

  for (const item of data.actionItems) {
    items.push(evidenceItem("ACTION_ITEM", item.task, item.evidence, "actionItems.evidence"));
  }

  for (const question of data.openQuestions) {
    items.push({
      section: "OPEN_QUESTION",
      claim: cleanText(question) || "待确认开放问题",
      evidenceText: "开放问题默认需要补充证据",
      sourceHint: "openQuestions",
      status: "MISSING",
    });
  }

  for (const warning of data.qualityWarnings) {
    const claim = cleanText(warning) || "质量警告";
    items.push({
      section: "QUALITY_WARNING",
      claim,
      evidenceText: claim,
      sourceHint: "qualityWarnings",
      status: classifyEvidence(claim),
    });
  }

  return items;
}
