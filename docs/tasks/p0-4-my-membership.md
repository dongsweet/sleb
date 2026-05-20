# P0-4：My Membership 仪表板

| 字段 | 值 |
|------|------|
| 编号 | P0-4 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 3h |

## 背景

会员登录后需要看到自己的会员状态、可用功能、到期提醒等。

## 目标

实现 `/my-account/membership` 页面，展示：

1. 当前会员等级和状态
2. 到期日期和续费提醒
3. 可用功能卡片
4. 升级/降级入口

## 涉及文件

1. **新建** `apps/web/app/my-account/membership/page.tsx` — 会员仪表板
2. **新建** `apps/web/app/my-account/page.tsx` — 账户入口页
3. **已有** `packages/shared/src/index.ts` — `memberFeatureMatrix`
4. **已有** `packages/db/src/schema.ts` — `memberships` 表

## 页面布局

```
┌──────────────────────────────────────┐
│  My Membership                       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Current: Standard   Active    │  │
│  │  Expires: 2027-03-15           │  │
│  │  [Renew] [Upgrade]             │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │评估   │ │目录   │ │AI    │         │
│  │工具   │ │访问   │ │计算器 │         │
│  └──────┘ └──────┘ └──────┘         │
│                                      │
│  Associated buildings: 3 / 10       │
│  Associated accounts:  2 / 8        │
└──────────────────────────────────────┘
```

## 实现要点

- 需要登录后访问（auth guard）
- 从 `memberships` 表查询当前用户所属公司的会员信息
- 功能卡片根据会员等级动态展示（来自 `memberFeatureMatrix`）
- 到期前 30 天显示黄色警告，到期后显示红色

## 验收标准

- [ ] 未登录用户被重定向到登录页
- [ ] 正确显示会员等级、状态、到期日期
- [ ] 功能卡片按等级动态展示
- [ ] 到期提醒正确显示
- [ ] 升级/降级入口可用
