# P3-1：LinkedIn OAuth 登录

| 字段 | 值 |
|------|------|
| 编号 | P3-1 |
| 优先级 | P3 — 认证增强 |
| 预估工时 | 3h |

## 背景

支持通过 LinkedIn 账号快捷登录，方便职场用户。

## 目标

1. LinkedIn OAuth 登录流程
2. 自动关联已有邮箱账户（可选）

## 涉及文件

1. **新建** `apps/api/src/modules/auth/linkedin.ts` — LinkedIn OAuth 配置
2. **修改** `apps/api/src/modules/auth/routes.ts` — OAuth 端点
3. **修改** `apps/web/app/components/LoginModal.tsx` — 添加 "Sign in with LinkedIn" 按钮
4. **新建** `apps/web/app/account/linkedin/callback/page.tsx` — OAuth 回调页

## 流程

```
1. 用户点击 "Sign in with LinkedIn" → 2. 跳转 LinkedIn OAuth 授权页
3. 用户授权 → 4. 回调到 /account/linkedin/callback
5. 后端交换 code 获取 access_token → 6. 获取用户信息
7. 查找是否有匹配邮箱的账户 → 8. 有则关联登录，无则创建账户
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/linkedin` | GET | 跳转 LinkedIn 授权 |
| `/api/auth/linkedin/callback` | GET | OAuth 回调 |

## 实现要点

- LinkedIn OAuth 需要配置 Client ID 和 Client Secret
- 请求 scope: `profile email`
- 邮箱匹配：如果已有用户注册了相同邮箱，自动关联
- 新用户：使用 LinkedIn 姓名创建账户，邮箱验证标记为已验证

## 环境变量

```
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
LINKEDIN_REDIRECT_URI=http://localhost:4000/api/auth/linkedin/callback
```

## 验收标准

- [ ] LinkedIn 登录按钮可用
- [ ] OAuth 流程正常
- [ ] 新用户自动创建
- [ ] 已有用户自动关联
- [ ] 登录态正确建立
