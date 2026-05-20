# SLEB Smart Hub — 设计文档

> 目标：复刻 https://sleb.sg/ （Singapore Low Energy Building Smart Hub）
> 项目根目录：`/home/dq/code/sleb`
> 当前代码量：38 个源文件，~10,000 行
>
> ⚠️ **注意**：本文档为早期架构设计，已于 2026-05-20 合并到 `task-list.md`。
> 完整的任务清单、优先级和工时请看 [task-list.md](task-list.md)（62 个任务，~231h）。
> 本文档保留作为参考。

---

## 1. 项目概述

### 1.1 原始站点

SLEB 是一个新加坡绿色建筑服务平台，面向物业管理、能源顾问、政府机构等用户，提供：

- **建筑目录** — Green Mark 认证建筑列表（3,297+ 栋）
- **技术目录** — 节能技术/产品目录（供应商、星级评分）
- **服务目录** — 节能服务提供商
- **评估工具** — THEEA（住宅）、BEEA（建筑）、SMEEA（中小企业）能效评估
- **AI 计算器** — ROI 计算和节能方案推荐
- **会员系统** — 三级会员（Free/Standard/Premium），支持公司注册、审批、支付
- **项目管理** — 政府补贴项目、调查问卷
- **绿色金融** — 与银行（OCBC/DBS/UOB）对接的绿色贷款工具
- **管理后台** — 用户管理、内容管理、审批流程、日志审计

### 1.2 我们的复刻范围

**Phase 1（P0）**：核心功能 — 登录、会员系统、My Building 仪表板
**Phase 2（P1）**：目录功能 — 建筑/技术/服务目录，搜索和筛选
**Phase 3（P2）**：评估工具 — THEEA/BEEA/SMEEA/AI Calculator
**Phase 4（P3）**：管理后台 — 完整 CRUD、审批流程
**Phase 5（P4）**：杂项 — 项目地图、绿色金融、多语言、性能优化

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 15 (App Router), React 19, TypeScript |
| 后端 API | Fastify + TypeScript |
| 数据库 | PostgreSQL (Drizzle ORM) |
| 对象存储 | MinIO (S3 兼容) |
| 共享类型 | @sleb/shared 包 |
| 样式 | 纯 CSS (2545 行) |
| 认证 | Session Cookie (当前为硬编码 admin) |

---

## 3. 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (Next.js)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ 公开页面  │ │ 会员页面  │ │ 管理后台  │ │ 工具页 │ │
│  │ / /news  │ │ /account │ │ /admin   │ │ /tools │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ fetch /api/*
┌────────────────────────▼────────────────────────────┐
│              API 层 (Fastify, :8001)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  /auth    │ │ /content │ │ /member  │ │ /tools │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ Drizzle ORM
┌────────────────────────▼────────────────────────────┐
│              PostgreSQL (14+ 表)                      │
└─────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              MinIO (图片/文档/报告)                    │
└─────────────────────────────────────────────────────┘
```

---

## 4. 数据库 Schema（已有）

| 表 | 用途 | 当前状态 |
|----|------|---------|
| `users` | 用户账号（email, password, role） | ✅ 已定义 |
| `companies` | 公司信息（UEN, 地址） | ✅ 已定义 |
| `company_users` | 公司-用户关联 | ✅ 已定义 |
| `membership_plans` | 会员计划（3级） | ✅ 已定义 |
| `memberships` | 会员记录（状态、有效期） | ✅ 已定义 |
| `membership_applications` | 会员申请（审批流） | ✅ 已定义 |
| `directory_entries` | 目录条目（建筑/技术/服务/术语） | ✅ 已定义 |
| `content_items` | 内容（新闻/事件/补贴/出版物） | ✅ 已定义 |
| `content_versions` | 内容版本历史 | ✅ 已定义 |
| `content_workflow_events` | 内容工作流事件 | ✅ 已定义 |
| `media_assets` | 媒体文件 | ✅ 已定义 |
| `assessment_records` | 评估记录（THEEA/BEEA/SMEEA/Calculator） | ✅ 已定义 |
| `ai_suggestions` | AI 建议 | ✅ 已定义 |
| `audit_logs` | 审计日志 | ✅ 已定义 |

---

## 5. 会员等级

| 等级 | 价格 | 最大关联账户 | 权益 |
|------|------|------------|------|
| Basic (Free) | S$0/年 | 5 | My Buildings, BEEA, SMEEA 自评估, AI Calculator |
| Standard | S$299/年 | 5 | Basic + SMEEA 报告下载, My Services |
| Premium | S$499/年 | 20 | Standard + My Technologies |

会员状态流转：
```
application_in_review → approved_awaiting_payment → active
                                    ↓
                                  expired → (续费)
                                            ↓
                    upgrade_in_review → upgrade_approved_awaiting_payment → active
```

---

## 6. 页面路由规划

### 6.1 公开页面（已有）

| 路由 | 页面 | 状态 |
|------|------|------|
| `/` | 首页 | ✅ 完成 |
| `/news` | 新闻列表 | ✅ 有 |
| `/news/[slug]` | 新闻详情 | ✅ 有 |
| `/events` | 事件列表 | ✅ 有 |
| `/events/[slug]` | 事件详情 | ✅ 有 |
| `/grants-and-incentives` | 补贴列表 | ✅ 有 |
| `/grants-and-incentives/[slug]` | 补贴详情 | ✅ 有 |

### 6.2 公开页面（需要新增）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/buildings` | 建筑目录（搜索+筛选+列表） | P1 |
| `/buildings/[slug]` | 建筑详情 | P1 |
| `/technologies` | 技术目录（按类别筛选+卡片） | P1 |
| `/technologies/[slug]` | 技术详情 | P1 |
| `/services` | 服务目录 | P1 |
| `/services/[slug]` | 服务详情 | P1 |
| `/projects` | 项目列表+地图 | P2 |
| `/projects/[slug]` | 项目详情 | P2 |
| `/publications` | 出版物/文档下载 | P2 |
| `/terms` | 术语词典 A-Z | P2 |
| `/membership` | 会员等级对比+注册入口 | P0 |
| `/membership/register` | 会员注册申请表单 | P0 |
| `/green-finance` | 绿色金融入口 | P3 |
| `/green-finance/calculator` | 贷款计算器 | P3 |

### 6.3 会员页面（登录后）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/account` | 会员仪表板（6个功能卡片） | P0 |
| `/account/my-building` | My Building 入口 | P0 |
| `/account/my-building/[id]` | 建筑详情（6个Tab） | P0 |
| `/account/my-building/[id]/edit` | 建筑编辑 | P0 |
| `/account/my-technology` | 我的技术产品 | P1 |
| `/account/my-service` | 我的服务 | P1 |
| `/account/my-smeea` | SMEEA 评估 | P2 |
| `/account/my-beea` | BEEA 评估 | P2 |

### 6.4 工具页面（登录后）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/tools/theea` | 住宅能效评估 | P2 |
| `/tools/beea` | 建筑能效评估 | P2 |
| `/tools/smeea` | 中小企业能效评估 | P2 |
| `/tools/ai-calculator` | AI 计算器 | P2 |

### 6.5 管理后台（已有框架）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/admin/content` | 内容管理 | P3 |
| `/admin/directories` | 目录管理 | P3 |
| `/admin/memberships` | 会员管理+审批 | P3 |
| `/admin/tools` | 工具管理 | P3 |
| `/admin/media` | 媒体管理 | P3 |
| `/admin/roles` | 角色权限 | P3 |

---

## 7. 核心页面设计

### 7.1 My Building 仪表板（P0）

登录后访问 `/account/my-building/[id]`，包含 6 个 Tab：

**Tab 1: Operation Report**
- 月度能源消耗折线图（电力、天然气）
- 月度用水量柱状图
- 月度废物产生量
- 碳排放趋势
- 数据从 `assessment_records` 表的 `inputData` JSON 字段读取

**Tab 2: Performance Dashboard**
- EUI（能源使用强度）按系统分类：ACMV / 照明 / 电梯 / 其他
- 按月分布柱状图
- 按分类饼图

**Tab 3: WLCA Dashboard**
- 生命周期碳排放分解表
- 表格列：阶段 | 材料/系统 | 碳排放 (kgCO2e) | 占比%
- 阶段包括：建材、施工、运营、拆除

**Tab 4: Energy Dashboard**
- 能源账单导入（Excel）
- 月度能源成本
- 能效评级对比

**Tab 5: Smart Advisor**
- 原网站：写死的建议列表
- **我们改为**：AI 知识库推荐 — 根据建筑数据生成个性化建议
- 建议包括：节能措施、预期节省、投资回收期

**Tab 6: Upload Documents**
- 上传建筑文档（PDF、Excel、图片）
- 存储到 MinIO
- 记录到 `media_assets` 表

### 7.2 建筑编辑弹窗（P0）

弹出式表单，包含以下字段：

| 字段 | 类型 | 必填 |
|------|------|------|
| Building Name | text | ✅ |
| Address | text | ✅ |
| Green Mark Rating | select (Platinum/Gold/Silver/Bronze) | ✅ |
| Gross Floor Area (m²) | number | ✅ |
| EUI (kWh/m²/year) | number | ✅ |
| Building Type | select (Commercial/Residential/Institutional/Industrial) | ✅ |
| Year of Completion | number | |
| Photo | image upload | |
| Description | textarea | |

### 7.3 建筑数据导入（P0）

- 支持 Excel (.xlsx) 和 CSV 上传
- 解析后批量写入 `directory_entries` 表
- 类型设置为 `building`
- 数据校验：必填字段检查、格式校验
- 导入结果：成功 X 条，失败 Y 条（列出原因）

### 7.4 登录模态框（P0）

当前：独立页面 `/account/login`
改为：导航栏 "Log in" 点击弹出模态框

登录方式：
1. **邮箱 + 密码** — 当前方式
2. **LinkedIn OAuth** — 后续实现
3. **reCAPTCHA v2** — 防止机器注册

### 7.5 会员等级页面（P0）

`/membership` 页面：
- 三栏对比表（Basic / Standard / Premium）
- 每栏：价格、权益列表、"Apply Now" 按钮
- Basic: 免费，点击直接注册
- Standard/Premium: 点击跳转到注册页面，选择计划

### 7.6 会员注册申请表单（P0）

`/membership/register` 页面，包含：

**公司信息**
- Company Name (必填)
- UEN (必填, 格式校验)
- Company Type (下拉: Developer/Property Manager/Consultant/Equipment Supplier/其他)
- Country (默认 Singapore)
- Postal Code
- Address

**联系人信息**
- Primary Contact Name
- Email
- Phone Number

**会员计划选择**
- Basic / Standard / Premium 单选

**附件上传**
- 营业执照/UEN 证明（PDF）

**提交后流程**
- 状态设为 `application_in_review`
- 发送邮件通知
- 管理员在后台审批

### 7.7 支付集成（P0）

- 使用日历支付（非 Stripe）
- 费率：1.5%
- 仅对 Standard 和 Premium 计划需要支付
- Basic 计划免费，跳过支付步骤
- 支付完成后状态从 `approved_awaiting_payment` → `active`

---

## 8. API 设计

### 8.1 已有 API

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/auth/login` | POST | 登录 |
| `/api/auth/me` | GET | 获取当前用户 |
| `/api/auth/logout` | POST | 登出 |
| `/api/content/config` | GET | 内容配置 |
| `/api/content/items` | GET/POST | 内容列表/创建 |
| `/api/content/items/:id` | GET/PATCH/DELETE | 内容详情/更新/删除 |
| `/api/content/items/:id/:action` | POST | 工作流操作 (submit/publish/unpublish) |
| `/api/content/media` | GET/POST | 媒体列表/上传 |
| `/api/content/ai/suggestions` | POST | AI 建议 |
| `/api/membership/plan-config` | GET | 会员计划配置 |
| `/api/membership/register` | POST | 注册申请 |

### 8.2 需要新增的 API

| 端点 | 方法 | 用途 | 优先级 |
|------|------|------|--------|
| `/api/buildings` | GET | 建筑列表（搜索+筛选） | P1 |
| `/api/buildings/:id` | GET | 建筑详情 | P1 |
| `/api/buildings/:id` | PATCH | 编辑建筑 | P0 |
| `/api/buildings/import` | POST | 批量导入建筑数据 | P0 |
| `/api/technologies` | GET | 技术列表 | P1 |
| `/api/technologies/:id` | GET | 技术详情 | P1 |
| `/api/services` | GET | 服务列表 | P1 |
| `/api/services/:id` | GET | 服务详情 | P1 |
| `/api/assessments` | GET/POST | 评估记录 | P2 |
| `/api/assessments/:id` | GET/PATCH | 评估详情/更新 | P2 |
| `/api/assessments/:id/report` | GET | 生成评估报告 | P2 |
| `/api/calculator` | POST | AI 计算器 | P2 |
| `/api/admin/users` | GET/POST | 用户管理 | P3 |
| `/api/admin/users/:id` | GET/PATCH/DELETE | 用户详情/更新/删除 | P3 |
| `/api/admin/companies` | GET/POST | 公司管理 | P3 |
| `/api/admin/companies/:id` | GET/PATCH/DELETE | 公司详情/更新/删除 | P3 |
| `/api/admin/applications` | GET | 会员申请列表 | P3 |
| `/api/admin/applications/:id/:action` | POST | 审批操作 (approve/reject) | P3 |
| `/api/admin/logs` | GET | 审计日志 | P3 |
| `/api/payment/create` | POST | 创建支付订单 | P0 |
| `/api/payment/callback` | POST | 支付回调 | P0 |
| `/api/payment/status` | GET | 查询支付状态 | P0 |

---

## 9. 实现计划

### Phase 1: 核心功能（P0）— 7 个任务

| # | 任务 | 预估工时 |
|---|------|---------|
| 1 | 登录模态框（弹窗式） | 2h |
| 2 | 会员等级页面 + 注册表单 | 4h |
| 3 | 支付集成（日历支付） | 3h |
| 4 | My Membership 仪表板 | 3h |
| 5 | My Building 仪表板（6个Tab） | 8h |
| 6 | 建筑编辑弹窗 | 3h |
| 7 | 建筑数据导入 | 3h |

### Phase 2: 目录功能（P1）— 3 个任务

| # | 任务 | 预估工时 |
|---|------|---------|
| 8 | 技术目录（列表+筛选+卡片） | 4h |
| 9 | 服务目录 | 3h |
| 10 | Green Mark 建筑目录（搜索+地图） | 5h |

### Phase 3: 评估工具（P2）— 5 个任务

| # | 任务 | 预估工时 |
|---|------|---------|
| 11 | THEEA 住宅评估 | 5h |
| 12 | BEEA 建筑评估 | 5h |
| 13 | SMEEA 中小企业评估 | 5h |
| 14 | AI Calculator | 4h |
| 15 | Smart Advisor AI 推荐 | 4h |

### Phase 4: 管理后台（P3）— 8 个任务

| # | 任务 | 预估工时 |
|---|------|---------|
| 16 | Manage Users | 4h |
| 17 | Manage Buildings | 4h |
| 18 | Manage Companies | 3h |
| 19 | Manage Technology | 3h |
| 20 | Manage Content（完善已有功能） | 3h |
| 21 | Manage Roles | 3h |
| 22 | System Parameters | 3h |
| 23 | Logs | 3h |

### Phase 5: 杂项（P4）— 7 个任务

| # | 任务 | 预估工时 |
|---|------|---------|
| 24 | Project Map | 4h |
| 25 | Green Finance | 5h |
| 26 | 多语言切换 | 3h |
| 27 | 图片加载优化 | 2h |
| 28 | 每日数据同步 Cron Job | 3h |
| 29 | Publications | 2h |
| 30 | Terms Dictionary | 2h |

**总计预估：~120 小时**

---

## 10. 已知问题和注意事项

1. **认证系统** — 当前只支持硬编码 admin 账号，需要扩展为完整用户系统（注册、邮箱验证、密码重置）
2. **支付** — 原网站用 Stripe，我们改为日历支付（1.5%费率）
3. **Smart Advisor** — 原网站写死建议，我们改为 AI 推荐（需要知识库或 API 调用）
4. **地图** — 建筑目录需要 Google Maps 或 OpenStreetMap 集成
5. **数据量** — 原网站有 3,177 用户、3,297 建筑，需要支持大数据量查询
6. **性能** — 原网站图片加载慢，我们用 Next.js Image 优化 + CDN
7. **多语言** — 原网站支持中英文，我们后续加上
