export type MeetingJson = {
  title: string;
  fiveLineSummary: string[];
  detailedNotes: Array<{ topic: string; points: string[] }>;
  keyChanges: Array<{ change: string; evidence: string }>;
  actionItems: Array<{ task: string; owner: string; deadline: string; evidence: string }>;
  openQuestions: string[];
  memoryCandidates: Array<{ type: string; title: string; content: string }>;
  qualityWarnings: string[];
};

type PartialMeetingJson = Partial<{
  title: unknown;
  fiveLineSummary: unknown;
  detailedNotes: unknown;
  keyChanges: unknown;
  actionItems: unknown;
  openQuestions: unknown;
  memoryCandidates: unknown;
  qualityWarnings: unknown;
}>;

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  return items.length ? items : fallback;
}

export function normalizeMeetingJson(raw: PartialMeetingJson): MeetingJson {
  const detailedNotes = Array.isArray(raw.detailedNotes)
    ? raw.detailedNotes.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          topic: stringValue(record.topic, "主题"),
          points: stringArray(record.points, ["待补充"]),
        };
      })
    : [];

  const keyChanges = Array.isArray(raw.keyChanges)
    ? raw.keyChanges.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          change: stringValue(record.change, "待确认"),
          evidence: stringValue(record.evidence, "待确认"),
        };
      })
    : [];

  const actionItems = Array.isArray(raw.actionItems)
    ? raw.actionItems.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          task: stringValue(record.task, "待确认"),
          owner: stringValue(record.owner, "待确认"),
          deadline: stringValue(record.deadline, "待确认"),
          evidence: stringValue(record.evidence, "待确认"),
        };
      })
    : [];

  const memoryCandidates = Array.isArray(raw.memoryCandidates)
    ? raw.memoryCandidates.map((item) => {
        const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          type: stringValue(record.type, "EVENT").toUpperCase(),
          title: stringValue(record.title, "待命名记忆"),
          content: stringValue(record.content, "待补充"),
        };
      })
    : [];

  return {
    title: stringValue(raw.title, "R1 Meeting Intelligence Output"),
    fiveLineSummary: stringArray(raw.fiveLineSummary, ["待补充"]),
    detailedNotes: detailedNotes.length ? detailedNotes : [{ topic: "主题", points: ["待补充"] }],
    keyChanges: keyChanges.length ? keyChanges : [{ change: "待确认", evidence: "待确认" }],
    actionItems: actionItems.length
      ? actionItems
      : [{ task: "待确认", owner: "待确认", deadline: "待确认", evidence: "待确认" }],
    openQuestions: stringArray(raw.openQuestions, ["待补充"]),
    memoryCandidates,
    qualityWarnings: stringArray(raw.qualityWarnings, ["暂无自动质量警告"]),
  };
}
