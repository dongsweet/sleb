# P1-10：订阅页面

| 字段 | 值 |
|------|------|
| 编号 | P1-10 |
| 优先级 | P1 — 公共页面 |
| 预估工时 | 2h |

## 背景

用户订阅邮件列表，接收 SLEB 的最新新闻和更新。

## 目标

1. 订阅表单页面（`/subscribe`）
2. 邮件订阅管理（确认/退订）

## 涉及文件

1. **新建** `apps/web/app/subscribe/page.tsx` — 订阅页面
2. **新建** `apps/api/src/modules/subscribe/routes.ts` — 订阅 API
3. **已有** `packages/db/src/schema.ts` — 需添加 `subscribers` 表

## 表单字段

| 字段 | 类型 | 必填 |
|------|------|------|
| 姓名 | text | ✅ |
| 邮箱 | email | ✅ |
| 兴趣领域 | checkbox | ❌ | 技术/活动/政策/全部 |

## 流程

```
1. 用户填写邮箱 → 2. 发送确认邮件 → 3. 点击确认链接 → 4. 订阅成功
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/subscribe` | POST | 订阅 |
| `/api/subscribe/confirm/:token` | GET | 确认订阅 |
| `/api/subscribe/unsubscribe/:token` | GET | 退订 |

## 验收标准

- [ ] 订阅表单提交正常
- [ ] 确认邮件发送成功
- [ ] 确认链接可点击并生效
- [ ] 退订功能正常
