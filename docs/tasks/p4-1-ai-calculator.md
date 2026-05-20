# P4-1：AI Calculator

| 字段 | 值 |
|------|------|
| 编号 | P4-1 |
| 优先级 | P4 — AI 功能 |
| 预估工时 | 4h |

## 背景

AI Calculator 是 SLEB 的创新功能，帮助用户快速估算建筑能耗和碳排。导航中 "Calculator" 链接到 `/ai-calculator`。

## 目标

实现 AI 驱动的建筑能耗计算器。

## 涉及文件

1. **新建** `apps/web/app/ai-calculator/page.tsx` — 计算器页面
2. **新建** `apps/api/src/modules/calculator/routes.ts` — 计算器 API
3. **新建** `apps/api/src/modules/calculator/calculator.ts` — 计算引擎

## 页面设计

```
┌─────────────────────────────────────────────────┐
│  AI Calculator                                  │
│                                                 │
│  Step 1: Select building type                   │
│    [Office] [Commercial] [Residential] ...      │
│                                                 │
│  Step 2: Enter building details                 │
│    Area: [_____] m²                             │
│    Floors: [_____]                              │
│    Year built: [_____]                          │
│                                                 │
│  Step 3: Energy usage estimate                  │
│    [____] kWh/m²/year                           │
│                                                 │
│  Step 4: Results                                │
│    Annual energy: 500,000 kWh                    │
│    Annual cost: $75,000                          │
│    Carbon footprint: 250 tonnes CO₂              │
│    Efficiency rating: B                          │
│    Suggestions: [3 recommendations]             │
└─────────────────────────────────────────────────┘
```

## 计算逻辑

- 基于建筑类型和面积估算基准能耗
- 使用历史数据或 AI 模型修正估算
- 计算碳排（新加坡电网排放因子）
- 计算年度成本（新加坡电价）
- 生成改进建议

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/calculator/calculate` | POST | 计算 |

## 验收标准

- [ ] 计算流程正常
- [ ] 计算结果合理（对比基准数据）
- [ ] 改进建议生成
- [ ] 需要 Premium 会员权限
