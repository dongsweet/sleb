# P0-7：建筑数据导入

| 字段 | 值 |
|------|------|
| 编号 | P0-7 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 3h |

## 背景

会员可能需要批量导入建筑数据（特别是已有大量建筑的公司），而不是逐条手动录入。

## 目标

支持 Excel/CSV 格式的建筑数据批量导入，包含数据校验和导入报告。

## 涉及文件

1. **新建** `apps/web/app/components/BuildingImportModal.tsx` — 导入弹窗
2. **新建** `apps/api/src/modules/buildings/routes.ts` — 建筑 API
3. **新建** `apps/api/src/modules/buildings/import.ts` — 导入解析逻辑
4. **已有** `packages/db/src/schema.ts` — `directoryEntries` 表

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/buildings/import` | POST | 上传文件并导入 |

## 导入流程

```
1. 用户选择文件（.xlsx / .csv）
2. 前端预览前 5 行数据（确认格式）
3. 提交到后端
4. 后端逐行校验：
   - 必填字段检查
   - 数据格式检查（邮编、年份等）
   - 重复检查（slug 唯一）
5. 返回导入报告：
   - 成功导入 N 条
   - 跳过 M 条（附原因）
   - 错误 K 条（附行号和原因）
```

## 模板格式

提供标准模板下载，CSV 格式：

```csv
name,address,postalCode,greenMark,area,yearBuilt,type,eUI,floors
ABC Building,123 Main St,012345,Gold,5000,2010,office,120,20
```

## 实现要点

- 使用 `xlsx` 库解析 Excel 文件
- 逐行 Zod 校验
- 事务操作：全部成功或全部回滚
- 大文件限制：最大 10MB
- 异步处理：超过 100 条走 worker 队列

## 验收标准

- [ ] 支持 .xlsx 和 .csv 上传
- [ ] 前端预览功能正常
- [ ] 数据校验错误有明确提示
- [ ] 导入报告显示成功/跳过/错误统计
- [ ] 重复数据正确识别
- [ ] 模板下载可用
