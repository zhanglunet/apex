export type QualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type QualityReport = {
  checks: QualityCheck[];
  summary: {
    passed: number;
    total: number;
    blocking: boolean;
  };
};

function check(id: string, label: string, passed: boolean, detail: string): QualityCheck {
  return { id, label, passed, detail };
}

export function runQualityChecks(markdown: string): QualityReport {
  const checks = [
    check("has_action_items", "包含行动项", markdown.includes("## 行动项"), "输出必须包含行动项区块。"),
    check("has_open_questions", "包含开放问题", markdown.includes("## Open Questions"), "输出必须包含 Open Questions 区块。"),
    check("has_quality_warnings", "包含质量警告", markdown.includes("## Quality Warnings"), "输出必须包含 Quality Warnings 区块。"),
    check("has_owner", "行动项包含 Owner", /Owner：/.test(markdown), "每个行动项至少应显式出现 Owner 字段。"),
    check("has_deadline", "行动项包含 Deadline", /Deadline：/.test(markdown), "每个行动项至少应显式出现 Deadline 字段。"),
    check("has_evidence", "包含证据字段", /证据：/.test(markdown), "关键变化和行动项应包含证据字段。"),
    check("minimum_length", "输出长度合理", markdown.trim().length >= 220, "过短输出通常无法支撑研究工作流。"),
  ];
  const passed = checks.filter((item) => item.passed).length;
  return {
    checks,
    summary: {
      passed,
      total: checks.length,
      blocking: checks.some((item) => !item.passed && ["has_action_items", "has_open_questions"].includes(item.id)),
    },
  };
}

