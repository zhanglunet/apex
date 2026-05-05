import OpenAI from "openai";
import { normalizeMeetingJson } from "./meeting";
import { buildMeetingPrompt } from "./prompts";
import { renderMeetingMarkdown, safeJsonParse } from "./markdown";

export async function generateMeetingOutput(inputText: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const data = normalizeMeetingJson({
      title: "示例会议纪要",
      fiveLineSummary: [
        "当前未配置 OPENAI_API_KEY，因此返回本地示例输出。",
        "上传和任务创建链路已可测试。",
        "配置 API key 后将生成真实 R1 输出。",
        "行动项、开放问题和质量警告字段会固定出现。",
        "用户可以继续编辑、导出并创建 Failure Card。",
      ],
      detailedNotes: [{ topic: "本地占位输出", points: ["请在 .env.local 中配置 OPENAI_API_KEY。"] }],
      keyChanges: [{ change: "LLM 生成尚未启用", evidence: "缺少 OPENAI_API_KEY" }],
      actionItems: [{ task: "配置 OPENAI_API_KEY", owner: "待确认", deadline: "待确认", evidence: "环境变量为空" }],
      openQuestions: ["是否使用默认模型？", "第一批真实会议样本是哪几个？"],
      memoryCandidates: [{ type: "EVENT", title: "APEX V1 本地测试", content: "完成上传到编辑的最小链路测试。" }],
      qualityWarnings: ["这是本地占位输出，不应用于真实研究工作。"],
    });
    return { data, markdown: renderMeetingMarkdown(data), rawJson: JSON.stringify(data) };
  }

  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: buildMeetingPrompt(inputText),
    temperature: 0.2,
    response_format: { type: "json_object" },
  });
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned an empty response.");
  const data = safeJsonParse(content);
  return { data, markdown: renderMeetingMarkdown(data), rawJson: content };
}
