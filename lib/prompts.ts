export function buildMeetingPrompt(inputText: string) {
  return [
    {
      role: "system" as const,
      content:
        "You are APEX R1 Meeting Intelligence. Convert meeting transcripts into audit-friendly research notes. Be conservative. Do not invent facts. Mark uncertain owners/deadlines as 待确认. Return valid JSON only.",
    },
    {
      role: "user" as const,
      content: `请根据下面的会议材料输出 JSON。字段必须包含 title, fiveLineSummary, detailedNotes, keyChanges, actionItems, openQuestions, memoryCandidates, qualityWarnings。所有行动项必须包含 task, owner, deadline, evidence。若材料不支持某个结论，请放入 qualityWarnings。\n\n会议材料：\n${inputText.slice(0, 60000)}`,
    },
  ];
}
