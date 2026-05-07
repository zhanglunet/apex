# 2026-05-07 环境搭建与界面测试报告

## 测试目标

确认 APEX 当前本地开发环境可正常启动，并完成所有核心界面的桌面端渲染回归检查，为后续小版本持续迭代提供稳定基线。

## 环境搭建结果

- 数据库同步：`npm run db:push` 通过，Prisma Client 已生成。
- 生产构建：`npm run build` 通过。
- 本地服务：`npm run dev` 已启动在 `http://localhost:3001`。
- 端口说明：`3000` 端口已有进程占用，本次使用 Next.js 自动分配的 `3001`。
- Smoke Test：`APP_URL=http://localhost:3001 npm run test:smoke` 通过。

## 界面测试范围

| 页面 | 路径 | 截图 |
| --- | --- | --- |
| Dashboard | `/dashboard` | `docs/screenshots/ui-test/dashboard.png` |
| Inbox | `/inbox` | `docs/screenshots/ui-test/inbox.png` |
| Runs | `/runs` | `docs/screenshots/ui-test/runs.png` |
| Run Detail | `/runs/cmov8pzx50002lgkac39ysol2` | `docs/screenshots/ui-test/run-detail.png` |
| Run Detail 高视口 | `/runs/cmov8pzx50002lgkac39ysol2` | `docs/screenshots/ui-test/run-detail-full.png` |
| Evidence | `/evidence` | `docs/screenshots/ui-test/evidence.png` |
| Failure Ops | `/failure-ops` | `docs/screenshots/ui-test/failure-ops.png` |
| Evals | `/evals` | `docs/screenshots/ui-test/evals.png` |
| Memory | `/memory` | `docs/screenshots/ui-test/memory.png` |

## 检查结论

- 所有核心页面均能正常渲染。
- 未发现 404、500、空白页或明显服务端错误。
- 左侧导航、列表页筛选器、详情页编辑区、质量面板、证据面板、失败样本表单均可见。
- 未发现明显组件重叠、主要文本溢出或按钮不可读问题。
- Run Detail 页面内容较长，已使用高视口截图补充检查 Evidence Panel 和 Failure Card 区域。

## 本次测试产生的数据

- Smoke test 创建的 RouteRun ID：`cmov8pzx50002lgkac39ysol2`。
- 本次截图目录：`docs/screenshots/ui-test/`。

## 后续建议

- 下一个小版本可以补充移动端视口截图检查，覆盖侧边导航和主要表单在窄屏下的表现。
- 建议后续将截图回归脚本化，避免每次手动维护页面截图命令。
