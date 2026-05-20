# P0-5：My Building 仪表板（6 个 Tab）

| 字段 | 值 |
|------|------|
| 编号 | P0-5 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 8h |

## 背景

会员的核心功能是管理自己的建筑数据。原站提供 6 个 Tab 展示建筑的不同维度。

## 目标

实现 `/my-account/buildings` 页面，包含 6 个 Tab：

## Tab 列表

| Tab | 说明 | 内容 |
|-----|------|------|
| Operation Report | 运营报告 | 月度能耗报表、趋势图 |
| Performance | 性能评估 | EUI 评分、能效等级 |
| WLCA | 全生命周期碳排 | 碳足迹计算和展示 |
| Energy | 能耗详情 | 分项能耗（ACMV/照明/电梯等）|
| Smart Advisor | AI 建议 | 基于建筑数据的个性化节能建议 |
| Upload | 上传数据 | 上传月度能耗数据（Excel/CSV）|

## 涉及文件

1. **新建** `apps/web/app/my-account/buildings/page.tsx` — 仪表板入口
2. **新建** `apps/web/app/components/BuildingTabs.tsx` — Tab 组件
3. **新建** `apps/web/app/components/tabs/` — 各 Tab 内容组件
4. **已有** `packages/db/src/schema.ts` — `directoryEntries`（建筑数据）
5. **待新建** `member_buildings` 表

## 页面布局

```
┌─────────────────────────────────────────────────┐
│  My Buildings                                   │
│  [Building A ▼]  [+ Add Building]               │
│                                                 │
│  [Operation Report][Performance][WLCA][Energy]  │
│  [Smart Advisor][Upload]                        │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Tab 内容区域                            │    │
│  │                                         │    │
│  │  图表 / 数据表 / 表单                    │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

## 实现要点

- 顶部下拉选择建筑（一个公司可能有多个建筑）
- 每个 Tab 独立组件，按需加载
- Operation Report / Performance / Energy 使用图表（Chart.js / Recharts）
- Smart Advisor 调用 AI API（P4-5 完成前先用占位数据）
- Upload 支持 Excel/CSV 解析，数据校验后存入数据库

## 验收标准

- [ ] 6 个 Tab 均可切换
- [ ] 建筑选择下拉正常工作
- [ ] Operation Report 显示能耗趋势图
- [ ] Performance 显示 EUI 评分
- [ ] Energy 显示分项能耗饼图
- [ ] Upload 支持文件上传和校验
- [ ] Smart Advisor 显示建议（占位即可）
