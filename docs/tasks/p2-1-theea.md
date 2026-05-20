# P2-1：THEEA 住宅能效评估

| 字段 | 值 |
|------|------|
| 编号 | P2-1 |
| 优先级 | P2 — 评估工具 |
| 预估工时 | 5h |

## 背景

THEEA（Total Home Energy Assessment）是最简单的评估工具，面向住宅业主。导航中 "Assessment → Home Owner" 链接到 `/theea`。

## 目标

实现多步骤表单，收集住宅参数后计算能效评分。

## 涉及文件

1. **新建** `apps/web/app/theea/page.tsx` — 评估入口页
2. **新建** `apps/web/app/components/assessments/TheeaForm.tsx` — 多步骤表单
3. **新建** `apps/api/src/modules/assessments/routes.ts` — 评估 API
4. **新建** `apps/api/src/modules/assessments/theea.ts` — 计算逻辑
5. **已有** `packages/db/src/schema.ts` — `assessmentRecords` 表（type: theea）

## 表单步骤

| 步骤 | 标题 | 内容 |
|------|------|------|
| 1 | 基本信息 | 住宅类型、面积、住户人数 |
| 2 | 电器清单 | 空调数量、冰箱、电视、照明等 |
| 3 | 使用习惯 | 空调时长、照明时长、外出频率 |
| 4 | 结果 | 综合评分、分项能耗、改进建议 |

## 输入参数

- 住宅类型：组屋 / 排屋 / 公寓 / 别墅
- 建筑面积（m²）
- 住户人数
- 电器清单（类型 × 数量 × 功率）
- 使用时长（小时/天）

## 计算逻辑

- 基于固定参数和公式计算各系统能耗
- 对比基准值得出评分（0-100）
- 生成改进建议列表

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/assessments` | POST | 创建评估记录 |
| `/api/assessments/:id` | GET | 获取评估结果 |

## 实现要点

- 多步骤表单使用 step wizard 组件
- 每步完成后才能进入下一步
- 结果页展示评分（环形进度条）、分项柱状图
- Standard/Premium 会员可下载报告（PDF）

## 验收标准

- [ ] 多步骤表单流程正常
- [ ] 计算逻辑正确（对比基准数据）
- [ ] 结果页面展示评分和图表
- [ ] 评估记录保存到数据库
- [ ] Standard/Premium 会员可下载报告
