# APEX V1 最小版本实际开发计划

版本：V1 MVP Build Plan  
目标：为下一步编码做准备，先做一个能本地运行、能上传资料、能生成会议研究输出、能记录用户修订和失败样本的最小闭环。

## 1. MVP 范围

### 1.1 只做一条主路线

V1 最小版本先只做 R1 Meeting Intelligence。

原因：

- R1 是最容易拿到真实样本的入口。
- 会议天然包含人物、公司、行动项、观点变化和后续问题。
- R1 可以沉淀 Memory、Evidence、Failure Card，为 R2/R3 打底。

### 1.2 MVP 必须跑通的闭环

```text
上传会议转录
-> 创建任务
-> LLM 生成结构化纪要
-> 用户编辑输出
-> 保存修订
-> 生成 Failure Card
-> 导出 Markdown
```

### 1.3 暂不做的功能

- 暂不做音频自动转写，先支持文本 / Markdown / DOCX 上传。
- 暂不做多用户企业权限，先做单 workspace。
- 暂不做复杂向量检索，先存 Evidence 文本，后续加 pgvector。
- 暂不做 R2 Earnings Workflow。
- 暂不做 R3 Research Desk。
- 暂不做飞书/Slack/邮件集成。
- 暂不做生产部署。

## 2. 技术选型

为快速开工，采用单仓库、轻量单体。

| 模块 | 选择 | 说明 |
| --- | --- | --- |
| 前端 | Next.js + TypeScript + Tailwind CSS | 快速搭建工作台 |
| 后端 | Next.js Route Handlers | MVP 先不拆 FastAPI |
| 数据库 | SQLite + Prisma | 本地开发最轻，后续可迁 PostgreSQL |
| 文件存储 | 本地 `storage/uploads` | 先满足上传和解析 |
| LLM | OpenAI Chat Completions / Responses 封装 | 通过一个 provider 文件隔离 |
| 文档解析 | mammoth for DOCX，原生 text/markdown | PDF 暂不纳入 MVP |
| UI | 原生组件 + lucide-react | 避免一开始引入重 UI 框架 |

## 3. 项目目录

建议在根目录新建 `apex-v1/`：

```text
apex-v1/
  app/
    page.tsx
    dashboard/
      page.tsx
    inbox/
      page.tsx
    runs/
      [id]/
        page.tsx
    api/
      upload/
        route.ts
      runs/
        route.ts
      runs/
        [id]/
          route.ts
      generate/
        route.ts
      failure-cards/
        route.ts
  components/
    AppShell.tsx
    FileUploader.tsx
    RunEditor.tsx
    QualityPanel.tsx
    FailureCardForm.tsx
  lib/
    db.ts
    llm.ts
    parsers.ts
    prompts.ts
    markdown.ts
  prisma/
    schema.prisma
  storage/
    uploads/
    exports/
  package.json
  README.md
  .env.example
```

## 4. 数据模型

### 4.1 SourceFile

上传的原始资料。

字段：

- `id`
- `filename`
- `mimeType`
- `path`
- `textContent`
- `createdAt`

### 4.2 RouteRun

一次 R1 运行任务。

字段：

- `id`
- `routeType`，固定为 `R1_MEETING_INTELLIGENCE`
- `title`
- `status`：`DRAFT` / `GENERATING` / `READY` / `REVIEWED`
- `sourceFileId`
- `inputText`
- `generatedOutput`
- `editedOutput`
- `qualityJson`
- `createdAt`
- `updatedAt`

### 4.3 FailureCard

用户发现的问题和修订。

字段：

- `id`
- `routeRunId`
- `failureType`
- `severity`：`P0` / `P1` / `P2` / `P3`
- `description`
- `originalOutput`
- `userRevision`
- `status`：`OPEN` / `FIXED` / `WONT_FIX`
- `createdAt`

### 4.4 MemoryObject

MVP 只做轻量版本。

字段：

- `id`
- `type`：`COMPANY` / `PERSON` / `EVENT` / `THESIS` / `ACTION`
- `title`
- `content`
- `routeRunId`
- `createdAt`

## 5. R1 输出格式

LLM 必须输出结构化 JSON，再渲染成 Markdown。

```json
{
  "title": "会议标题",
  "fiveLineSummary": ["..."],
  "detailedNotes": [
    {
      "topic": "主题",
      "points": ["..."]
    }
  ],
  "keyChanges": [
    {
      "change": "...",
      "evidence": "..."
    }
  ],
  "actionItems": [
    {
      "task": "...",
      "owner": "待确认",
      "deadline": "待确认",
      "evidence": "..."
    }
  ],
  "openQuestions": ["..."],
  "memoryCandidates": [
    {
      "type": "EVENT",
      "title": "...",
      "content": "..."
    }
  ],
  "qualityWarnings": ["..."]
}
```

## 6. 页面设计

### 6.1 Dashboard

第一版显示：

- 总上传文件数。
- 总 RouteRun 数。
- 待审核任务数。
- Failure Card 数。
- 最近 5 个任务。

### 6.2 Inbox

功能：

- 上传 `.txt`、`.md`、`.docx`。
- 显示解析后的文本预览。
- 一键创建 R1 任务。

### 6.3 Run Detail

功能：

- 左侧显示原始输入。
- 右侧显示生成输出。
- 用户可编辑 Markdown。
- 按钮：生成、保存修订、导出 Markdown、创建 Failure Card。

### 6.4 Failure Ops

MVP 可先放在 Run Detail 里，不单独做页面。

功能：

- 选择失败类型。
- 选择 P0-P3。
- 填写描述。
- 自动带入原输出和用户修订。

## 7. 第一轮编码任务

### Day 1：项目初始化

- [ ] 创建 `apex-v1` Next.js 项目。
- [ ] 安装依赖：Prisma、SQLite、lucide-react、mammoth。
- [ ] 配置 Tailwind。
- [ ] 创建 `.env.example`。
- [ ] 创建 Prisma schema。
- [ ] 初始化 SQLite 数据库。

验收：

- `npm run dev` 可启动。
- 首页可打开。
- Prisma migration 成功。

### Day 2：基础布局与 Dashboard

- [ ] 创建 AppShell。
- [ ] 创建导航：Dashboard、Inbox。
- [ ] 实现 Dashboard 数据统计。
- [ ] 实现最近任务列表。

验收：

- Dashboard 可查看数据库统计。
- 空状态展示正常。

### Day 3：文件上传与解析

- [ ] 实现 `/api/upload`。
- [ ] 支持 `.txt`、`.md`、`.docx`。
- [ ] 保存文件到 `storage/uploads`。
- [ ] 解析文本并写入 SourceFile。
- [ ] Inbox 显示上传记录和文本预览。

验收：

- 上传一份会议转录后能看到文本内容。

### Day 4：创建 RouteRun

- [ ] 从 SourceFile 创建 R1 RouteRun。
- [ ] 实现 `/api/runs`。
- [ ] 实现 Run Detail 页面。
- [ ] 左侧显示输入文本。
- [ ] 右侧显示输出编辑区。

验收：

- 可以从上传文件进入一个任务详情页。

### Day 5：LLM 生成 R1 输出

- [ ] 实现 `lib/llm.ts`。
- [ ] 实现 `lib/prompts.ts`。
- [ ] 实现 `/api/generate`。
- [ ] LLM 输出 JSON。
- [ ] 将 JSON 渲染为 Markdown。
- [ ] 保存到 `generatedOutput`。

验收：

- 点击生成后，可以得到结构化会议纪要 Markdown。
- 生成失败时显示错误。

### Day 6：编辑、导出、Failure Card

- [ ] 保存用户编辑后的 Markdown。
- [ ] 实现导出 Markdown 文件。
- [ ] 实现 Failure Card 表单。
- [ ] 保存 FailureCard。
- [ ] 在 Run Detail 显示关联 Failure Cards。

验收：

- 用户能保存修订。
- 用户能导出 Markdown。
- 用户能记录一个失败样本。

### Day 7：打磨与样本测试

- [ ] 用 3 个真实会议样本测试。
- [ ] 修 prompt。
- [ ] 修 UI 空状态和错误状态。
- [ ] 补 README。
- [ ] 写下一阶段 R2/R3 backlog。

验收：

- 3 个样本均能完成上传 -> 生成 -> 编辑 -> 导出 -> Failure Card。

## 8. MVP 验收标准

功能验收：

- [ ] 本地能启动。
- [ ] 能上传 `.txt`、`.md`、`.docx`。
- [ ] 能创建 R1 RouteRun。
- [ ] 能调用 LLM 生成结构化会议纪要。
- [ ] 能编辑输出。
- [ ] 能导出 Markdown。
- [ ] 能创建 Failure Card。

质量验收：

- [ ] 行动项里必须包含 owner 和 deadline 字段，即使是“待确认”。
- [ ] 输出必须有 open questions。
- [ ] 输出必须显式标记 quality warnings。
- [ ] 不允许把不确定信息写成确定结论。

工程验收：

- [ ] 数据库 schema 清晰。
- [ ] LLM 调用集中在 `lib/llm.ts`。
- [ ] Prompt 集中在 `lib/prompts.ts`。
- [ ] 文件解析集中在 `lib/parsers.ts`。
- [ ] README 能指导本地启动。

## 9. 下一阶段 Backlog

MVP 完成后再做：

- [ ] 单独 Failure Ops 页面。
- [ ] Memory 页面。
- [ ] Evidence 对象和引用回链。
- [ ] pgvector 检索。
- [ ] PDF 解析。
- [ ] 音频转写。
- [ ] R2 Earnings Workflow。
- [ ] R3 Research Desk。
- [ ] 多 workspace / 用户权限。
- [ ] 设计伙伴 pilot dashboard。

## 10. 立即开工前确认

编码前只需要确认 3 件事：

- [ ] 项目目录使用 `apex-v1/`。
- [ ] MVP 技术栈使用 Next.js + Prisma + SQLite。
- [ ] 第一条路线只做 R1 Meeting Intelligence。

如果以上默认方案成立，下一步可以直接开始 scaffold 项目并实现 Day 1。
