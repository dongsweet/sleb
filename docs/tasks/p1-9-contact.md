# P1-9：联系页面

| 字段 | 值 |
|------|------|
| 编号 | P1-9 |
| 优先级 | P1 — 公共页面 |
| 预估工时 | 2h |

## 背景

用户可以通过联系页面发送消息或查看联系方式。

## 目标

1. 联系表单页面（`/contact`）
2. 支持邮件发送（走 worker 队列）

## 涉及文件

1. **新建** `apps/web/app/contact/page.tsx` — 联系页面
2. **新建** `apps/api/src/modules/contact/routes.ts` — 联系 API
3. **新建** `apps/worker/src/email.ts` — 邮件发送处理器

## 表单字段

| 字段 | 类型 | 必填 |
|------|------|------|
| 姓名 | text | ✅ |
| 邮箱 | email | ✅ |
| 主题 | select | ✅ | 咨询/反馈/合作/其他 |
| 内容 | textarea | ✅ |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/contact/submit` | POST | 提交联系表单 |

## 实现要点

- 表单提交后写入 Valkey 的 `email` 队列
- Worker 消费队列，发送邮件到 `sleb@bca.gov.sg`
- reCAPTCHA 验证（防止垃圾邮件）
- 提交成功后显示确认消息

## 验收标准

- [ ] 表单提交正常
- [ ] 邮件正确发送到管理邮箱
- [ ] reCAPTCHA 验证生效
- [ ] 提交后显示确认消息
