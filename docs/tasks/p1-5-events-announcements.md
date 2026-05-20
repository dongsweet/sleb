# P1-5：活动和公告页面

| 字段 | 值 |
|------|------|
| 编号 | P1-5 |
| 优先级 | P1 — 公共页面 |
| 预估工时 | 2h |

## 背景

活动和公告是两种不同类型的内容，但结构相似。都需要列表 + 详情。

## 目标

1. 活动列表页（`/events`）— 已有 mock，需改真实数据
2. 活动详情页（`/events/[slug]`）
3. 公告列表页（`/announcements`）
4. 公告详情页（`/announcements/[slug]`）

## 涉及文件

1. **已有** `apps/web/app/events/page.tsx` — 需改造
2. **新建** `apps/web/app/events/[slug]/page.tsx`
3. **新建** `apps/web/app/announcements/page.tsx`
4. **新建** `apps/web/app/announcements/[slug]/page.tsx`
5. **已有** `packages/db/src/schema.ts` — `contentItems` 表（type: event, announcement）

## API 端点

复用 `/api/content` 端点，通过 `type` 参数区分。

## 活动 vs 公告的区别

| 维度 | 活动 | 公告 |
|------|------|------|
| 内容 | 研讨会、展览、讲座 | 政策更新、系统通知 |
| 特殊字段 | 日期、地点、报名链接 | 无 |
| 排序 | 按活动日期 | 按发布日期 |

## 实现要点

- 可以复用新闻页面的组件，只替换 `type` 参数
- 活动页需要显示日期和地点
- 公告页更简单，纯文本为主

## 验收标准

- [ ] 活动列表/详情功能正常
- [ ] 公告列表/详情功能正常
- [ ] 内容正确分类显示
- [ ] 活动日期和地点正确展示
