# P3-3：管理后台（内容管理 + 会员审批）

| 字段 | 值 |
|------|------|
| 编号 | P3-3 |
| 优先级 | P3 — 管理后台 |
| 预估工时 | 10h |

## 背景

管理员需要管理网站内容（新闻、公告、目录等）和处理会员申请。当前 `/admin` 只有骨架结构。

## 目标

### 3.1 内容管理

- 新闻/公告/出版物/目录条目的 CRUD
- 富文本编辑器
- 图片上传到 MinIO
- 发布/草稿状态管理

### 3.2 会员审批

- 查看待审批申请列表
- 审批/拒绝操作
- Standard/Premium 触发支付流程

## 涉及文件

1. **已有** `apps/web/app/admin/[[...section]]/page.tsx` — 需扩展
2. **新建** `apps/web/app/components/admin/ContentManager.tsx` — 内容管理
3. **新建** `apps/web/app/components/admin/MemberApprover.tsx` — 会员审批
4. **新建** `apps/api/src/modules/admin/routes.ts` — 管理 API
5. **已有** `packages/db/src/schema.ts` — `contentItems`, `membershipApplications`

## 管理页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/admin` | 仪表盘 | 概览统计 |
| `/admin/content` | 内容管理 | CRUD 所有内容类型 |
| `/admin/members` | 会员管理 | 审批申请、管理会员 |
| `/admin/buildings` | 建筑管理 | 审核建筑数据 |
| `/admin/users` | 用户管理 | 查看/管理用户 |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/content` | GET | 内容列表 |
| `/api/admin/content` | POST | 创建内容 |
| `/api/admin/content/:id` | PATCH | 编辑内容 |
| `/api/admin/content/:id` | DELETE | 删除内容 |
| `/api/admin/members/applications` | GET | 待审批列表 |
| `/api/admin/members/approve/:id` | POST | 审批通过 |
| `/api/admin/members/reject/:id` | POST | 拒绝申请 |
| `/api/admin/upload` | POST | 上传文件到 MinIO |

## 实现要点

- 管理员角色检查：只有 `role: admin` 可以访问
- 富文本编辑器：使用 TipTap 或 Slate.js
- 图片上传：前端选择 → POST 到 API → MinIO 存储 → 返回 URL
- 会员审批：通过 → 创建 membership → 触发支付（Standard/Premium）
- 操作日志记录

## 验收标准

- [ ] 管理员可以登录并访问管理后台
- [ ] 非管理员被拒绝访问
- [ ] 内容 CRUD 功能正常
- [ ] 富文本编辑器可用
- [ ] 图片上传到 MinIO 正常
- [ ] 会员审批流程正常
- [ ] 操作日志记录
