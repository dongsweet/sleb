# P0-8：用户注册页面

| 字段 | 值 |
|------|------|
| 编号 | P0-8 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 3h |

## 背景

新用户注册账户。导航栏有 "Sign Up" 链接到 `/account/register`。

## 目标

1. 注册表单页面（`/account/register`）
2. 邮箱验证流程
3. reCAPTCHA 防刷

## 涉及文件

1. **新建** `apps/web/app/account/register/page.tsx` — 注册页面
2. **新建** `apps/api/src/modules/auth/routes.ts` — 注册 API（已有 login，需加 register）
3. **已有** `packages/db/src/schema.ts` — `users` 表

## 表单字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 姓名 | text | ✅ | 完整姓名 |
| 邮箱 | email | ✅ | 工作邮箱 |
| 密码 | password | ✅ | 8+ 字符，含大小写+数字 |
| 确认密码 | password | ✅ | 与密码一致 |
| reCAPTCHA | captcha | ✅ | Google reCAPTCHA v2 |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册 |
| `/api/auth/verify-email/:token` | GET | 邮箱验证 |
| `/api/auth/resend-verification` | POST | 重发验证邮件 |

## 注册流程

```
1. 填写表单 → 2. reCAPTCHA 验证 → 3. 创建用户（status: unverified）
4. 发送验证邮件 → 5. 点击链接 → 6. 状态改为 active → 7. 自动登录
```

## 实现要点

- 密码使用 bcrypt 哈希存储
- reCAPTCHA 在前端验证后，后端也需验证 token
- 邮箱验证 token 设置 24h 过期
- 已验证用户登录后可跳转到会员申请流程

## 验收标准

- [ ] 注册表单提交正常
- [ ] reCAPTCHA 验证生效
- [ ] 验证邮件发送成功
- [ ] 邮箱验证流程完成
- [ ] 密码正确哈希存储
