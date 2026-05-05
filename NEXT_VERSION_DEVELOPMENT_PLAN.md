# APEX V1.1 下一版本开发计划

版本：V1.1 Quality Loop  
目标：在当前 V1 MVP 已跑通“上传 -> 创建 R1 -> 生成 -> 编辑 -> 导出 -> Failure Card”的基础上，把产品从“可演示闭环”推进到“可真实试用的研究工作流”。

## 1. V1.1 核心目标

V1.1 不扩张产品线，继续聚焦 R1 Meeting Intelligence，但补齐三个关键能力：

- 真实 LLM 输出质量更稳定。
- Memory Candidate 能写入 MemoryObject。
- Failure Card 能进入独立质量工作台，并形成基础 eval case。

一句话目标：

```text
让 R1 从能跑通，变成能被连续使用、复盘和改进。
```

## 2. 本版本不做什么

V1.1 暂不做：

- R2 Earnings Workflow。
- R3 Research Desk。
- 音频自动转写。
- PDF 解析。
- 多 workspace / 多用户权限。
- pgvector 检索。
- 生产部署。

这些都放到 V1.2 或之后，避免过早拉大面。

## 3. 优先级总览

| 优先级 | 模块 | 目标 |
| --- | --- | --- |
| P0 | R1 JSON schema 稳定性 | 真实 LLM 输出不再轻易解析失败 |
| P0 | Memory 写入 | 将 `memoryCandidates` 保存为 `MemoryObject` |
| P0 | Failure Ops 页面 | 独立查看、筛选、处理 Failure Cards |
| P1 | Quality Checks | 自动检查行动项、开放问题、质量警告、证据字段 |
| P1 | Eval Case | 从 Failure Card 生成基础 eval case |
| P1 | 样本回归 | 使用 `samples/` 下样本做最小回归测试 |
| P2 | UI 打磨 | 改善 Run Detail 的可读性和任务状态 |
| P2 | README 更新 | 同步新增功能与开发命令 |

## 4. 里程碑

### Milestone 1：R1 生成稳定化

目标：配置真实 `OPENAI_API_KEY` 后，R1 输出更稳定、更容易解析、更符合产品结构。

任务：

- [ ] 将 R1 输出 schema 抽成 TypeScript 类型。
- [ ] 增加 `normalizeMeetingJson`，为缺失字段补默认值。
- [ ] 增加 LLM 输出解析失败后的错误展示。
- [ ] 增加“重新生成”按钮的确认状态。
- [ ] 在 `qualityWarnings` 中强制标记不确定结论。
- [ ] 将模型原始 JSON 保存到 `RouteRun.qualityJson` 或新增字段。

验收标准：

- [ ] 对 3 个样例会议材料连续生成不报错。
- [ ] 生成结果始终包含 7 个固定区块：标题、5 行摘要、详细纪要、关键变化、行动项、Open Questions、Quality Warnings。
- [ ] 行动项缺 owner / deadline 时自动显示 `待确认`。

涉及文件：

- `lib/prompts.ts`
- `lib/llm.ts`
- `lib/markdown.ts`
- `components/RunEditor.tsx`
- `app/api/generate/route.ts`

## 5. Milestone 2：Memory 写入

目标：R1 输出里的 `memoryCandidates` 不再只是 Markdown 展示，而是真正写入 `MemoryObject` 表。

任务：

- [ ] 在 `generateMeetingOutput` 中返回结构化数据和 Markdown，而不只是 Markdown。
- [ ] 调整 `/api/generate`，解析 `memoryCandidates` 并写入 `MemoryObject`。
- [ ] 在 Run Detail 中显示本任务关联的 Memory Objects。
- [ ] 增加 Memory 类型标签：`COMPANY`、`PERSON`、`EVENT`、`THESIS`、`ACTION`。
- [ ] 增加 Memory 写入去重策略，先按 `routeRunId + title + type` 避免重复。

验收标准：

- [ ] 生成 R1 输出后，Memory Candidate 自动保存。
- [ ] Run Detail 能看到关联 Memory Objects。
- [ ] 重复生成不会无限复制同一批 Memory Objects。

涉及文件：

- `prisma/schema.prisma`
- `prisma/init.sql`
- `lib/llm.ts`
- `lib/markdown.ts`
- `app/api/generate/route.ts`
- `app/runs/[id]/page.tsx`
- `components/RunEditor.tsx`

## 6. Milestone 3：Failure Ops 页面

目标：Failure Card 从 Run Detail 的局部表单升级为独立质量工作台。

新增页面：

```text
/failure-ops
```

页面功能：

- [ ] 查看所有 Failure Cards。
- [ ] 按 severity 筛选：P0 / P1 / P2 / P3。
- [ ] 按 status 筛选：OPEN / FIXED / WONT_FIX。
- [ ] 按 failureType 筛选。
- [ ] 点击进入对应 RouteRun。
- [ ] 修改 Failure Card 状态。
- [ ] 显示原输出、用户修订和失败描述。

验收标准：

- [ ] AppShell 导航中出现 Failure Ops。
- [ ] `/failure-ops` 可以查看当前所有失败样本。
- [ ] 可以将 Failure Card 从 `OPEN` 改为 `FIXED`。

涉及文件：

- `components/AppShell.tsx`
- `app/failure-ops/page.tsx`
- `app/api/failure-cards/[id]/route.ts`
- `components/FailureCardTable.tsx`

## 7. Milestone 4：基础 Quality Checks

目标：不是只保存输出，而是自动检查输出是否满足 R1 最低质量线。

检查项：

- 是否包含 `## 行动项`。
- 是否包含 `## Open Questions`。
- 是否包含 `## Quality Warnings`。
- 行动项是否包含 Owner。
- 行动项是否包含 Deadline。
- 是否存在 `待确认`。
- 输出长度是否低于最小阈值。

任务：

- [ ] 新增 `lib/quality.ts`。
- [ ] 在 `/api/generate` 后运行 `runQualityChecks`。
- [ ] 将检查结果保存到 `RouteRun.qualityJson`。
- [ ] Quality Panel 展示每个检查项的状态。
- [ ] P0/P1 规则先用静态规则表达，不接复杂评测模型。

验收标准：

- [ ] 生成后 Quality Panel 展示不少于 6 个检查项。
- [ ] 缺少行动项或 Open Questions 时明确提示。
- [ ] Quality Panel 不再只显示通过/待检查，而显示检查说明。

涉及文件：

- `lib/quality.ts`
- `app/api/generate/route.ts`
- `components/RunEditor.tsx`

## 8. Milestone 5：Eval Case 最小闭环

目标：Failure Card 可以沉淀为未来回归测试的候选样本。

新增模型：

```prisma
model EvalCase {
  id                  String   @id @default(cuid())
  routeRunId          String
  failureCardId       String?
  routeType           String
  inputText           String
  expectedBehavior    String
  scoringRubricJson   String?
  status              String   @default("ACTIVE")
  createdAt           DateTime @default(now())
}
```

任务：

- [ ] 更新 `prisma/schema.prisma`。
- [ ] 更新 `prisma/init.sql`。
- [ ] 在 Failure Card 页面增加“生成 Eval Case”按钮。
- [ ] 保存输入文本、失败描述、期望行为。
- [ ] 增加 `/evals` 页面，先列出 Eval Cases。

验收标准：

- [ ] 任意 Failure Card 可以生成 Eval Case。
- [ ] `/evals` 能看到生成的 eval case。
- [ ] Eval Case 保留原输入和期望行为。

涉及文件：

- `prisma/schema.prisma`
- `prisma/init.sql`
- `app/api/eval-cases/route.ts`
- `app/evals/page.tsx`
- `components/FailureCardTable.tsx`

## 9. Milestone 6：样本回归测试

目标：用本地样本保证每次改 Prompt 或 LLM 封装后，基础链路不坏。

任务：

- [ ] 新增 `scripts/smoke-test.ts`。
- [ ] 用 `samples/sample_meeting.md` 创建本地测试流程。
- [ ] 检查上传、创建 route、生成、保存、Failure Card 创建是否成功。
- [ ] 在 `package.json` 增加 `test:smoke`。

验收标准：

- [ ] `npm run test:smoke` 可以本地跑通。
- [ ] 不依赖真实 `OPENAI_API_KEY`。
- [ ] 输出明确显示每一步是否通过。

涉及文件：

- `scripts/smoke-test.ts`
- `package.json`
- `samples/`

## 10. 推荐开发顺序

### Day 1：R1 schema 和质量检查

- [ ] 抽 TypeScript 类型。
- [ ] 加 `normalizeMeetingJson`。
- [ ] 加 `lib/quality.ts`。
- [ ] 更新 Quality Panel。
- [ ] 构建验证。

### Day 2：Memory 写入

- [ ] 调整 LLM 返回结构。
- [ ] `/api/generate` 写入 MemoryObject。
- [ ] Run Detail 展示 Memory Objects。
- [ ] 去重。
- [ ] 构建验证。

### Day 3：Failure Ops 页面

- [ ] 新增 `/failure-ops`。
- [ ] 新增筛选和状态更新。
- [ ] AppShell 增加导航。
- [ ] 构建验证。

### Day 4：Eval Case

- [ ] 新增 `EvalCase` schema。
- [ ] 更新 SQL 初始化脚本。
- [ ] Failure Card 生成 Eval Case。
- [ ] 新增 `/evals` 页面。
- [ ] 构建验证。

### Day 5：Smoke Test 和文档

- [ ] 新增 `scripts/smoke-test.ts`。
- [ ] 增加 `npm run test:smoke`。
- [ ] 更新 README。
- [ ] 用真实样本跑一次完整流程。
- [ ] 推送 GitHub。

## 11. V1.1 完成标准

功能完成：

- [ ] 真实 LLM 输出可稳定解析。
- [ ] Memory Candidates 自动写入数据库。
- [ ] Failure Ops 有独立页面。
- [ ] Quality Panel 展示具体检查项。
- [ ] Failure Card 可以生成 Eval Case。
- [ ] 本地 smoke test 可跑通。

质量完成：

- [ ] `npm run build` 通过。
- [ ] `npm run test:smoke` 通过。
- [ ] README 更新。
- [ ] 无 API Key 泄露。
- [ ] `storage/uploads`、`storage/exports`、`prisma/dev.db` 不进入 Git。

产品完成：

- [ ] R1 不再只是单次生成，而具备“生成 -> 修订 -> 失败记录 -> 质量检查 -> 记忆沉淀”的闭环。
- [ ] 可以拿给第一个设计伙伴做低风险试用。

## 12. V1.2 预告

V1.1 完成后，V1.2 可以选择两个方向之一：

方向 A：继续增强 R1

- 音频转写。
- 更细的证据回链。
- 多模板会议输出。
- 飞书文档导出。

方向 B：启动 R3 Research Desk

- PDF 解析。
- Evidence 对象。
- 简单检索。
- 研究问题回答。
- Memory reuse 指标。

建议优先方向：先做方向 A，把 R1 打磨到真实可用，再进入 R3。
