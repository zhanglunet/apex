# APEX V1.2 下一版本产品设计与开发计划

版本：V1.2 Evidence Layer
目标：在 V1.1 Quality Loop 已经具备“生成、修订、失败样本、Eval Case、Memory、Runs 工作台、健康检查”的基础上，补上 R1 Meeting Intelligence 最关键的证据层，让会议输出从“结构化纪要”升级为“可审计研究对象”。

## 1. 版本判断

V1.1 已解决的问题：

- R1 任务可以被连续创建、生成、编辑、导出。
- Failure Card 可以进入质量工作台并转成 Eval Case。
- Memory Object 可以跨会议浏览。
- Dashboard 可以看到质量健康指标。
- smoke test 覆盖核心页面和 API 校验。
- `/api/health` 可以快速确认服务状态。

V1.2 要解决的问题：

- 当前关键结论只有文本里的 `证据：...` 字段，尚未成为可筛选、可复用、可复盘的数据对象。
- 用户无法集中查看“哪些结论缺证据、哪些证据来源不清、哪些行动项只有待确认”。
- Eval Case 只能记录失败描述，尚不能把“证据缺失”转成明确回归标准。
- Memory Object 已经沉淀，但和证据来源之间没有关系。

一句话目标：

```text
让 R1 输出中的关键变化、行动项、开放问题和质量警告都有可追踪的证据线索。
```

## 2. 产品设计

### 2.1 目标用户

V1.2 仍面向高频处理复杂会议材料的研究与决策团队：

- 投资研究团队。
- 企业战略和产业研究团队。
- 高管办公室或决策支持团队。
- 专业服务团队的项目负责人。

这些用户最关心的不是“有没有纪要”，而是：

- 重要判断能否回到原始材料。
- 结论是否只是模型补全。
- 行动项是否有明确责任人和时间。
- 质量问题能否沉淀为后续检查标准。

### 2.2 核心用户故事

1. 作为研究负责人，我希望打开一个 Run 时能看到“哪些输出有证据、哪些缺证据”，避免把没有来源的结论带入决策。
2. 作为分析师，我希望从所有 Runs 中集中查看证据缺口，优先修复高风险输出。
3. 作为质量运营者，我希望把“证据缺失”类 Failure Card 转成更明确的 Eval Case，后续验证模型是否补上证据。
4. 作为团队成员，我希望 Memory Object 能显示来源任务，后续知道这条记忆是从哪次会议沉淀出来的。

### 2.3 新增产品对象：Evidence Item

V1.2 新增 `EvidenceItem`，用于保存 R1 输出中可追踪的证据信息。

建议字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | String | 主键 |
| `routeRunId` | String | 所属 R1 任务 |
| `section` | String | 来源区块：`KEY_CHANGE` / `ACTION_ITEM` / `OPEN_QUESTION` / `QUALITY_WARNING` |
| `claim` | String | 被支撑的结论、行动项或问题 |
| `evidenceText` | String | 输出中提取出的证据文本 |
| `sourceHint` | String? | 可选，原文位置或上下文提示 |
| `status` | String | `SUPPORTED` / `WEAK` / `MISSING` |
| `createdAt` | DateTime | 创建时间 |

### 2.4 页面与交互

#### Run Detail：Evidence Panel

在 Run Detail 中新增 Evidence Panel：

- 显示本 Run 的 Evidence Items。
- 按 `SUPPORTED` / `WEAK` / `MISSING` 标记证据质量。
- 对缺证据项提供“创建 Failure Card”入口。
- 显示证据对应的 claim 和 section。

#### Evidence Workbench：`/evidence`

新增独立页面：

- 查看所有 Evidence Items。
- 按 status 筛选。
- 按 section 筛选。
- 点击进入对应 Run。
- 快速查看缺证据数量。

#### Dashboard

新增指标：

- Missing Evidence 数量。
- Weak Evidence 数量。
- Supported Evidence 数量。

#### Eval Case

从 Evidence 缺口创建 Eval Case 时，`expectedBehavior` 应更明确：

```text
新输出必须为该 claim 提供可回到原始会议材料的证据；如果材料不支持，应明确写入 Quality Warnings，而不是补全结论。
```

## 3. 本版本不做什么

V1.2 暂不做：

- 不做向量数据库和语义检索。
- 不做逐字级引用定位。
- 不做 PDF 解析。
- 不做音频自动转写。
- 不做多用户权限。
- 不做飞书、Slack、邮件集成。

V1.2 只做“结构化证据对象”和“证据缺口运营”，为后续 Evidence Layer 深化打基础。

## 4. 技术设计

### 4.1 数据模型

新增 Prisma 模型：

```prisma
model EvidenceItem {
  id           String   @id @default(cuid())
  routeRunId   String
  section      String
  claim        String
  evidenceText String
  sourceHint   String?
  status       String   @default("SUPPORTED")
  createdAt    DateTime @default(now())
  routeRun     RouteRun @relation(fields: [routeRunId], references: [id])
}
```

同时在 `RouteRun` 增加：

```prisma
evidenceItems EvidenceItem[]
```

### 4.2 Evidence 提取策略

V1.2 先使用结构化输出抽取，不引入复杂模型：

- 从 `keyChanges[].evidence` 生成 Evidence Item。
- 从 `actionItems[].evidence` 生成 Evidence Item。
- Open Questions 默认可生成 `MISSING` 或 `WEAK` 证据项。
- Quality Warnings 中包含“不确定”“缺少”“无法确认”等关键词时生成缺口项。

状态判定规则：

| 状态 | 判定 |
| --- | --- |
| `SUPPORTED` | evidence 非空，且不是 `待确认` / `无` / `缺失` |
| `WEAK` | evidence 过短，或包含 `待确认` |
| `MISSING` | evidence 为空，或明确表示缺少证据 |

### 4.3 API 变更

新增：

- `GET /api/evidence`
- `PATCH /api/evidence/[id]`

调整：

- `/api/generate` 在写入 MemoryObject 后，同时写入 EvidenceItem。
- 重复生成时先删除本 Run 的旧 EvidenceItem，再写入新版本，保持和 MemoryObject 一致。

### 4.4 前端组件

新增：

- `components/EvidenceList.tsx`
- `components/EvidenceStatusActions.tsx`
- `app/evidence/page.tsx`

调整：

- `components/AppShell.tsx` 增加 Evidence 导航。
- `components/RunEditor.tsx` 增加 Evidence Panel。
- `app/dashboard/page.tsx` 增加 Evidence 健康指标。

## 5. 开发里程碑

### Milestone 1：Evidence 数据模型与抽取

任务：

- [ ] 更新 `prisma/schema.prisma`。
- [ ] 更新 `prisma/init.sql`。
- [ ] 新增 `lib/evidence.ts`，实现 `extractEvidenceItems`。
- [ ] 在 `/api/generate` 中写入 EvidenceItem。
- [ ] 生成时按 `routeRunId` 删除旧 EvidenceItem，避免重复。

验收标准：

- [ ] 生成 R1 输出后自动写入 EvidenceItem。
- [ ] 重复生成不会无限复制 EvidenceItem。
- [ ] smoke test 能验证至少生成 1 条 EvidenceItem。

### Milestone 2：Run Detail Evidence Panel

任务：

- [ ] Run Detail 查询 Evidence Items。
- [ ] RunEditor 展示 Evidence Panel。
- [ ] 按 status 使用不同视觉状态。
- [ ] 缺证据项可以快速创建 Failure Card。

验收标准：

- [ ] 任意已生成 Run 可以看到 Evidence Items。
- [ ] `MISSING` 和 `WEAK` 能被清楚识别。

### Milestone 3：Evidence Workbench

任务：

- [ ] 新增 `/evidence` 页面。
- [ ] 支持 status 筛选。
- [ ] 支持 section 筛选。
- [ ] AppShell 增加 Evidence 导航。
- [ ] Dashboard 增加 Evidence 指标。

验收标准：

- [ ] `/evidence` 可查看全部 Evidence Items。
- [ ] `/evidence?status=MISSING` 可筛选缺证据项。
- [ ] 每条 Evidence Item 可进入对应 Run。

### Milestone 4：Eval Case 与质量闭环增强

任务：

- [ ] Evidence 缺口可创建 Failure Card。
- [ ] Evidence 缺口生成 Eval Case 时写入更明确的 expectedBehavior。
- [ ] smoke test 覆盖 Evidence 页面和关键 API。
- [ ] README 和开发日志更新。

验收标准：

- [ ] 缺证据项能进入 Failure Ops。
- [ ] 缺证据 Failure Card 能转成 Eval Case。
- [ ] smoke test 覆盖 Evidence 最小闭环。

## 6. 建议小版本拆分

| 小版本 | 目标 | 说明 |
| --- | --- | --- |
| `v0.1.12` | Evidence 数据模型 | 增加 EvidenceItem schema、init.sql、抽取 helper |
| `v0.1.13` | 生成写入 Evidence | `/api/generate` 写入 EvidenceItem，smoke test 验证 |
| `v0.1.14` | Run Detail Evidence Panel | 单个 Run 内查看证据项 |
| `v0.1.15` | Evidence Workbench | `/evidence` 页面、筛选、导航 |
| `v0.1.16` | Evidence 质量闭环 | 缺证据项进入 Failure/Eval 流程 |
| `v0.1.17` | 文档与发布 | README、截图、Release Notes、GitHub Release |

## 7. 验证计划

每个小版本必须执行：

```bash
npm run build
APP_URL=http://localhost:3001 npm run test:smoke
```

新增 smoke test 覆盖：

- `/api/health`
- `/evidence`
- `/evidence?status=MISSING`
- 生成后 EvidenceItem 数量大于 0
- 重复生成不重复复制 EvidenceItem

## 8. V1.2 完成标准

功能完成：

- [ ] EvidenceItem 数据模型可用。
- [ ] R1 生成后自动产生 Evidence Items。
- [ ] Run Detail 可以查看证据项。
- [ ] Evidence Workbench 可以集中运营证据缺口。
- [ ] 缺证据项可以进入 Failure/Eval 闭环。

质量完成：

- [ ] `npm run build` 通过。
- [ ] `npm run test:smoke` 通过。
- [ ] README 更新。
- [ ] 开发日志记录每个小版本。
- [ ] GitHub tag 和 release 发布。

产品完成：

- [ ] 用户能回答“这条结论的证据是什么”。
- [ ] 用户能集中查看“哪些输出缺证据”。
- [ ] 证据缺口能沉淀为后续回归样本。

## 9. V1.3 预告

V1.2 完成后，V1.3 可以进入两个方向之一：

方向 A：Evidence 深化

- 原文片段定位。
- 证据引用上下文。
- 结论-证据对照视图。
- Evidence completeness score。

方向 B：资料包 Research Desk

- PDF / DOCX 资料包解析。
- 多材料 Evidence 对象。
- 简单检索。
- 研究问题回答。

建议优先方向：先做方向 A，把 R1 的证据可信度打牢，再扩展资料类型。
