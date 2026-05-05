import type { QualityReport } from "./quality";

export type ParsedQualityReport = QualityReport & {
  rawJson?: string;
};

export type QualityState = "not_generated" | "passed" | "blocking" | "needs_review";

export function parseQualityReport(value: string | null): ParsedQualityReport | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ParsedQualityReport>;
    if (!Array.isArray(parsed.checks) || !parsed.summary) return null;
    return parsed as ParsedQualityReport;
  } catch {
    return null;
  }
}

export function getQualityState(value: string | null): QualityState {
  const report = parseQualityReport(value);
  if (!report) return "not_generated";
  if (report.summary.blocking) return "blocking";
  if (report.summary.passed === report.summary.total) return "passed";
  return "needs_review";
}

export function getQualityLabel(state: QualityState) {
  switch (state) {
    case "passed":
      return "质量通过";
    case "blocking":
      return "存在阻断";
    case "needs_review":
      return "待复核";
    case "not_generated":
      return "未生成";
  }
}
