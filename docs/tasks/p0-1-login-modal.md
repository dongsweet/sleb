# Task P0-1: 登录模态框（弹窗式）

| 字段 | 值 |
|------|------|
| 编号 | P0-1 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 2h |

## 背景

当前登录是一个独立页面 `/account/login`，原网站是弹窗式的登录模态框，点击导航栏 "Log in" 弹出。

## 目标

1. 在导航栏 SiteChrome 组件中，点击 "Log in" 时弹出登录模态框
2. 模态框包含：邮箱 + 密码输入框、Sign in 按钮
3. 登录成功后关闭模态框，跳转到 `/admin/content` 或 `returnTo` 参数指定的页面
4. 登录失败显示错误提示
5. 保持现有 `/account/login` 页面作为 fallback

## 已有代码参考

- 导航栏：`apps/web/app/components/SiteChrome.tsx`
  - 已有 "Sign Up" 和 "Log in" 按钮（第275-281行），当前链接到 `/account/login`
- 登录表单：`apps/web/app/account/login/LoginClient.tsx`
  - 完整的登录逻辑：submitLogin() → POST /api/auth/login → 检查 /api/auth/me
- API 端点：`apps/api/src/modules/auth/routes.ts`
  - `/auth/login` (POST), `/auth/me` (GET), `/auth/logout` (POST)

## 需要改动的文件

1. **新建** `apps/web/app/components/LoginModal.tsx`
   - 模态框组件，复用 LoginClient 的登录逻辑
   - Props: `{ open: boolean; onClose: () => void }`
   - 包含邮箱、密码输入框和 Sign in 按钮

2. **修改** `apps/web/app/components/SiteChrome.tsx`
   - 添加 state 控制模态框开关
   - 将 "Log in" 的 `<a>` 改为 `<button>`，点击打开模态框
   - 在组件底部 render `<LoginModal>`

3. **修改** `apps/web/app/styles.css`
   - 添加模态框样式：遮罩层、居中白色面板、关闭按钮

## 样式参考

- 模态框：居中白色面板，max-width 400px，padding 2rem
- 遮罩层：全屏半透明黑色背景 (rgba(0,0,0,0.5))
- 关闭按钮：右上角 ×
- 输入框样式复用现有 `.loginPanel label input` 样式

## 验收标准

- [ ] 点击导航栏 "Log in" 弹出模态框
- [ ] 输入 admin@sleb.local / admin 可以成功登录
- [ ] 登录成功后模态框关闭并跳转
- [ ] 输入错误密码显示错误提示
- [ ] 点击遮罩层或 × 关闭模态框
- [ ] ESC 键关闭模态框
- [ ] 已登录状态不显示 "Log in" 按钮（当前行为保持不变）
