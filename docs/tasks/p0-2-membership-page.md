# P0-2：会员等级页面 + 注册表单

| 字段 | 值 |
|------|------|
| 编号 | P0-2 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 4h |

## 背景

导航栏有 "MEMBERSHIP" 链接到 `/membership`，但页面不存在。原站有三个会员等级（Basic/Standard/Premium），会员需要申请注册。

## 目标

1. 实现 `/membership` 页面：三栏对比展示三个等级
2. 实现 `/membership/register` 页面：会员申请表单

## 涉及文件

1. **新建** `apps/web/app/membership/page.tsx` — 会员等级展示页
2. **新建** `apps/web/app/membership/register/page.tsx` — 申请表单页
3. **已有** `packages/shared/src/index.ts` — `membershipLevels`, `memberFeatureMatrix`, `membershipStatusDescriptions`
4. **已有** `apps/api/src/modules/membership/routes.ts` — `/membership/plans`, `/membership/statuses`
5. **已有** `packages/db/src/schema.ts` — `membershipApplications` 表

## 会员等级（从 shared 包获取）

| 等级 | 价格 | 最大账号数 | 核心功能 |
|------|------|-----------|---------|
| Basic | 免费 | 5 | 查看目录、THEEA 评估 |
| Standard | 付费 | 更多 | BEEA/SMEEA 评估、下载报告 |
| Premium | 付费 | 更多 | 全部功能、AI Calculator |

## 页面设计

### `/membership` 等级对比页

- 三栏卡片（Basic / Standard / Premium）
- 每栏显示：价格、功能列表
- "Sign Up" 按钮跳转到 `/membership/register`
- Basic 免费，直接注册无需支付
- Standard/Premium 需要先申请，管理员审批

### `/membership/register` 申请表单

- 公司信息：名称、UEN、类型、地址、联系人
- 选择申请等级（Basic/Standard/Premium）
- 提交后创建 `membershipApplications` 记录（status: submitted）
- Basic 自动审批，Standard/Premium 需要管理员审核

## 实现要点

- 调用 `GET /api/membership/plans` 获取等级数据
- 表单提交 `POST /api/membership/applications`（待实现 API 端点）
- 表单校验使用 Zod schema
- 提交成功后显示确认页面

## 验收标准

- [ ] `/membership` 页面正确展示三个等级
- [ ] 功能对比清晰可读
- [ ] `/membership/register` 表单包含公司基本信息
- [ ] 表单校验通过后可提交
- [ ] 提交后创建申请记录
- [ ] Basic 级别自动通过
