type MeetingJson = {
  title?: string;
  fiveLineSummary?: string[];
  detailedNotes?: Array<{ topic?: string; points?: string[] }>;
  keyChanges?: Array<{ change?: string; evidence?: string }>;
  actionItems?: Array<{ task?: string; owner?: string; deadline?: string; evidence?: string }>;
  openQuestions?: string[];
  memoryCandidates?: Array<{ type?: string; title?: string; content?: string }>;
  qualityWarnings?: string[];
};

function list(items: string[] | undefined) {
  if (!items?.length) return "- 待补充";
  return items.map((item) => `- ${item}`).join("\n");
}

export function renderMeetingMarkdown(data: MeetingJson) {
  const lines: string[] = [];
  lines.push(`# ${data.title || "R1 Meeting Intelligence Output"}`);
  lines.push("");
  lines.push("## 5 行摘要");
  lines.push(list(data.fiveLineSummary));
  lines.push("");
  lines.push("## 详细纪要");
  if (data.detailedNotes?.length) {
    for (const section of data.detailedNotes) {
      lines.push(`### ${section.topic || "主题"}`);
      lines.push(list(section.points));
      lines.push("");
    }
  } else {
    lines.push("- 待补充");
    lines.push("");
  }
  lines.push("## 关键变化");
  if (data.keyChanges?.length) {
    for (const item of data.keyChanges) {
      lines.push(`- ${item.change || "待确认"}`);
      lines.push(`  - 证据：${item.evidence || "待确认"}`);
    }
  } else {
    lines.push("- 待补充");
  }
  lines.push("");
  lines.push("## 行动项");
  if (data.actionItems?.length) {
    for (const item of data.actionItems) {
      lines.push(`- 任务：${item.task || "待确认"}`);
      lines.push(`  - Owner：${item.owner || "待确认"}`);
      lines.push(`  - Deadline：${item.deadline || "待确认"}`);
      lines.push(`  - 证据：${item.evidence || "待确认"}`);
    }
  } else {
    lines.push("- 任务：待确认");
    lines.push("  - Owner：待确认");
    lines.push("  - Deadline：待确认");
    lines.push("  - 证据：待确认");
  }
  lines.push("");
  lines.push("## Open Questions");
  lines.push(list(data.openQuestions));
  lines.push("");
  lines.push("## Memory Candidates");
  if (data.memoryCandidates?.length) {
    for (const item of data.memoryCandidates) {
      lines.push(`- [${item.type || "EVENT"}] ${item.title || "待命名"}：${item.content || "待补充"}`);
    }
  } else {
    lines.push("- 待补充");
  }
  lines.push("");
  lines.push("## Quality Warnings");
  lines.push(list(data.qualityWarnings));
  lines.push("");
  return lines.join("\n");
}

export function safeJsonParse(raw: string): MeetingJson {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed) as MeetingJson;
}
