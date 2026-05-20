# P1-1：技术目录（列表+筛选+卡片）

| 字段 | 值 |
|------|------|
| 编号 | P1-1 |
| 优先级 | P1 — 目录功能 |
| 预估工时 | 4h |

## 背景

SLEB 提供节能技术/产品目录，按类别组织，包含星级评分和供应商信息。导航中 "Directories → Technology Directory" 链接到 `/technologies`。

## 目标

1. 技术列表页面：卡片展示，支持搜索和分类筛选
2. 技术详情页面：完整信息展示
3. 星级评分展示

## 涉及文件

1. **新建** `apps/web/app/technologies/page.tsx` — 技术列表
2. **新建** `apps/web/app/technologies/[slug]/page.tsx` — 技术详情
3. **新建** `apps/web/app/components/TechnologyCard.tsx` — 卡片组件
4. **新建** `apps/api/src/modules/technology/routes.ts` — 技术 API
5. **已有** `packages/db/src/schema.ts` — `directoryEntries` 表（type: technology）

## 页面布局

```
┌─────────────────────────────────────────────────┐
│  Technology Directory           [搜索框]         │
│                                                 │
│  分类: [全部][HVAC][照明][太阳能][智能控制]...    │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 名称  │ │ 名称  │ │ 名称  │ │ 名称  │           │
│  │ ★★★★★│ │ ★★★   │ │ ★★★★  │ │ ★★★★★│           │
│  │ 摘要  │ │ 摘要  │ │ 摘要  │ │ 摘要  │           │
│  │ 厂商  │ │ 厂商  │ │ 厂商  │ │ 厂商  │           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                 │
│  [1] [2] [3] ... [Next]                        │
└─────────────────────────────────────────────────┘
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/technologies` | GET | 列表（支持 search, category, rating 筛选）|
| `/api/technologies/:slug` | GET | 详情 |

## 实现要点

- 分类数据来自 `directoryEntries.content.category` 字段
- 星级评分来自 `content.rating`（1-5 整数）
- 分页：每页 12 个
- 搜索使用 PostgreSQL 全文搜索（`searchText` 列）

## 验收标准

- [ ] 列表页面展示技术卡片
- [ ] 分类筛选功能正常
- [ ] 搜索功能正常
- [ ] 详情页展示完整信息
- [ ] 星级评分正确显示
- [ ] 分页功能正常
