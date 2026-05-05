# 样例会议转录

会议主题：APEX V1 MVP 开发同步

Jason：第一版先只做 R1 Meeting Intelligence，目标是让会议转录可以上传、生成结构化纪要、编辑并导出 Markdown。

张路：数据库先用 SQLite，后续再迁到 PostgreSQL。现在不做音频转写，先支持 txt、md、docx。

Jason：行动项需要明确 owner 和 deadline。如果材料里没有，就标记待确认，不能编造。

张路：Failure Card 要先做最小版本，至少能记录事实错误、证据缺失、风险遗漏和结构错误。

Jason：本周验收标准是三个样本都能完成上传、生成、编辑、导出和失败样本记录。
