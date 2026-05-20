# P4-3：搜索功能

| 字段 | 值 |
|------|------|
| 编号 | P4-3 |
| 优先级 | P4 — 搜索 |
| 预估工时 | 3h |

## 背景

全局搜索功能，可以搜索所有类型的内容（新闻、技术、服务、建筑、出版物等）。

## 目标

1. 全局搜索入口（导航栏）
2. 搜索结果页面（分类展示）
3. 搜索建议（输入时显示）

## 涉及文件

1. **新建** `apps/web/app/search/page.tsx` — 搜索结果页
2. **新建** `apps/web/app/components/SearchBar.tsx` — 搜索栏组件
3. **新建** `apps/api/src/modules/search/routes.ts` — 搜索 API
4. **已有** `packages/db/src/schema.ts` — `search_index` 表

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 搜索（关键词、类型筛选）|
| `/api/search/suggestions` | GET | 搜索建议 |

## 页面布局

```
┌─────────────────────────────────────────────────┐
│  [搜索框] 🔍                                    │
│  ▽                                              │
│  建议:                                          │
│  • Green Mark Platinum                           │
│  • HVAC efficiency                              │
│  • ...                                          │
└─────────────────────────────────────────────────┘
```

## 搜索索引

使用 PostgreSQL 全文搜索：

```sql
-- 索引表设计
CREATE TABLE search_index (
  id uuid PRIMARY KEY,
  type text,          -- news, technology, building, etc.
  ref_id uuid,        -- 指向原始记录的 ID
  title text,
  body text,
  tsvector tsvector,  -- 全文搜索向量
  created_at timestamp
);
```

## 实现要点

- 使用 `to_tsvector('english', ...)` 构建搜索向量
- 支持 `websearch_to_tsquery`（用户友好的查询语法）
- 搜索结果按类型分组展示
- 搜索建议使用 Top-N 查询
- 索引通过 worker 队列维护（监听内容变更）

## 验收标准

- [ ] 全局搜索功能正常
- [ ] 搜索结果分类展示
- [ ] 搜索建议功能正常
- [ ] 搜索结果与索引同步
