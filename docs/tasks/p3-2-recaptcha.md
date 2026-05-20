# P3-2：reCAPTCHA 集成

| 字段 | 值 |
|------|------|
| 编号 | P3-2 |
| 优先级 | P3 — 安全 |
| 预估工时 | 2h |

## 背景

防止机器人注册和表单提交滥用，在登录、注册、联系表单中集成 reCAPTCHA。

## 目标

1. 在关键表单中集成 Google reCAPTCHA v2（checkbox 模式）
2. 前端显示 + 后端验证双重保护

## 涉及文件

1. **新建** `apps/web/app/components/Recaptcha.tsx` — reCAPTCHA 组件
2. **修改** `apps/web/app/components/LoginModal.tsx` — 登录页添加
3. **修改** `apps/web/app/account/register/page.tsx` — 注册页添加
4. **修改** `apps/web/app/contact/page.tsx` — 联系表单添加
5. **新建** `apps/api/src/modules/auth/recaptcha.ts` — 后端验证

## 实现要点

- Google reCAPTCHA v2（不是 invisible，用户需要主动勾选）
- 前端：加载 reCAPTCHA 脚本，渲染组件
- 后端：收到 token 后调用 Google 验证 API
- 验证失败返回明确错误信息

## 环境变量

```
RECAPTCHA_SITE_KEY=xxx
RECAPTCHA_SECRET_KEY=xxx
```

## 验收标准

- [ ] 登录页显示 reCAPTCHA
- [ ] 注册页显示 reCAPTCHA
- [ ] 联系表单显示 reCAPTCHA
- [ ] 后端验证正常
- [ ] 未通过验证时提示用户
