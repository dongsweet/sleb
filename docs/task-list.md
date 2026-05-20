# SLEB 任务清单

> 基于视频分析 + 代码库分析 + 会议纪要 + 会员逻辑分析生成
> 最后更新：2026-05-20
>
> 每个任务有对应的详细文档：`docs/tasks/` 目录

---

## INF — 基础设施（5 个任务，18h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| INF-1 | Docker Compose 开发环境 | 一键启动所有服务 | 4h | [inf-1-docker-compose.md](tasks/inf-1-docker-compose.md) |
| INF-2 | API 路由完善 | 补全所有模块的路由 | 6h | [inf-2-api-routes.md](tasks/inf-2-api-routes.md) |
| INF-3 | 数据库迁移 | Drizzle Kit 迁移 + 种子数据 | 4h | [inf-3-db-migration.md](tasks/inf-3-db-migration.md) |
| INF-4 | Worker 队列实现 | 4 个队列消费者 | 6h | [inf-4-worker.md](tasks/inf-4-worker.md) |
| INF-5 | MinIO 对象存储集成 | 文件上传/下载 | 2h | [inf-5-minio.md](tasks/inf-5-minio.md) |

---

## P0 — 核心功能（10 个任务，40h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P0-1 | 登录模态框（弹窗式） | 导航栏 "Log in" 点击弹出 | 2h | [p0-1-login-modal.md](tasks/p0-1-login-modal.md) |
| P0-2 | 会员等级页面 + 注册表单 | `/membership` 三栏对比 + 申请表单 | 4h | [p0-2-membership-page.md](tasks/p0-2-membership-page.md) |
| P0-3 | 支付集成（Airpay） | Standard/Premium 会员付费 + 回调 | 3h | [p0-3-payment.md](tasks/p0-3-payment.md) |
| P0-4 | My Membership 仪表板 | 会员状态/功能/到期提醒 | 3h | [p0-4-my-membership.md](tasks/p0-4-my-membership.md) |
| P0-5 | My Building 仪表板（6 Tab） | 建筑数据管理的核心界面 | 8h | [p0-5-my-building.md](tasks/p0-5-my-building.md) |
| P0-6 | 建筑编辑弹窗 | 弹窗式建筑信息编辑 | 3h | [p0-6-building-edit.md](tasks/p0-6-building-edit.md) |
| P0-7 | 建筑数据导入 | 批量导入 Excel/CSV | 3h | [p0-7-building-import.md](tasks/p0-7-building-import.md) |
| P0-8 | 用户注册页面 | 注册表单 + 邮箱验证 | 3h | [p0-8-register.md](tasks/p0-8-register.md) |
| P0-9 | 密码重置/修改 | Forgot Password + ChangePassword | 3h | [p0-9-password-reset.md](tasks/p0-9-password-reset.md) |
| P0-10 | 个人资料管理 | 用户信息编辑 + 公司资料 | 3h | [p0-10-user-profile.md](tasks/p0-10-user-profile.md) |

---

## P1 — 公共页面（12 个任务，31h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P1-1 | 技术目录 | 列表 + 筛选 + 星级卡片 | 4h | [p1-1-technology-directory.md](tasks/p1-1-technology-directory.md) |
| P1-2 | 服务目录 | 服务提供商列表 + 详情 | 3h | [p1-2-service-directory.md](tasks/p1-2-service-directory.md) |
| P1-3 | Green Mark 建筑目录 | 搜索 + 地图展示 | 5h | [p1-3-green-mark-directory.md](tasks/p1-3-green-mark-directory.md) |
| P1-4 | 新闻页面 | 列表 + 详情 + 标签筛选 | 3h | [p1-4-news-page.md](tasks/p1-4-news-page.md) |
| P1-5 | 活动和公告页面 | 两类内容的列表 + 详情 | 2h | [p1-5-events-announcements.md](tasks/p1-5-events-announcements.md) |
| P1-6 | 出版物页面 | 列表 + PDF 下载 | 2h | [p1-6-publications.md](tasks/p1-6-publications.md) |
| P1-7 | 术语词典页面 | A-Z 索引 + 搜索 | 2h | [p1-7-terms-dictionary.md](tasks/p1-7-terms-dictionary.md) |
| P1-8 | 项目页面 | 项目列表 + 详情 + 调查问卷 | 3h | [p1-8-projects.md](tasks/p1-8-projects.md) |
| P1-9 | 联系页面 | 表单 + 邮件发送 | 2h | [p1-9-contact.md](tasks/p1-9-contact.md) |
| P1-10 | 订阅页面 | 邮件列表订阅 + 确认/退订 | 2h | [p1-10-subscribe.md](tasks/p1-10-subscribe.md) |
| P1-11 | 关于页面 | 纯静态内容页 | 1h | [p1-11-about.md](tasks/p1-11-about.md) |
| P1-12 | 绿色金融页面 | 银行贷款入口 + 贷款计算器 | 5h | [p1-12-green-finance.md](tasks/p1-12-green-finance.md) |

---

## P2 — 评估工具（5 个任务，26h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P2-1 | THEEA 住宅能效评估 | 多步骤表单 + 计算 + 报告 | 5h | [p2-1-theea.md](tasks/p2-1-theea.md) |
| P2-2 | BEEA 建筑能效评估 | 建筑级评估（7 步骤）| 6h | [p2-2-beea.md](tasks/p2-2-beea.md) |
| P2-3 | SMEEA 企业综合评估 | 企业级可持续性评估 | 6h | [p2-3-smeea.md](tasks/p2-3-smeea.md) |
| P2-4 | 评估工具算法配置（后台） | 参数管理 + 版本控制 + 回滚 | 4h | [p2-4-assessment-config.md](tasks/p2-4-assessment-config.md) |
| P2-5 | AI Calculator | 建筑能耗 ROI 计算器 | 5h | [p2-5-ai-calculator.md](tasks/p2-5-ai-calculator.md) |

---

## P3 — 认证增强 + 管理后台（8 个任务，38h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P3-1 | LinkedIn OAuth 登录 | 第三方快捷登录 | 3h | [p3-1-linkedin-oauth.md](tasks/p3-1-linkedin-oauth.md) |
| P3-2 | reCAPTCHA 集成 | 防机器人注册 | 2h | [p3-2-recaptcha.md](tasks/p3-2-recaptcha.md) |
| P3-3 | 管理后台 — Content Desk | 内容起草/编辑/发布工作流 | 5h | [p3-3-content-desk.md](tasks/p3-3-content-desk.md) |
| P3-4 | 管理后台 — Directory Console | 目录审核（建筑/技术/服务/术语）| 5h | [p3-4-directory-console.md](tasks/p3-4-directory-console.md) |
| P3-5 | 管理后台 — Membership Review | 会员审批 + 续费 + 升级 | 5h | [p3-5-membership-review.md](tasks/p3-5-membership-review.md) |
| P3-6 | 管理后台 — Media Library | 媒体文件管理 | 3h | [p3-6-media-library.md](tasks/p3-6-media-library.md) |
| P3-7 | 管理后台 — Roles & Permissions | 角色权限管理 + 用户管理 | 5h | [p3-7-roles-permissions.md](tasks/p3-7-roles-permissions.md) |
| P3-8 | 管理后台 — 系统参数 + 审计日志 | 参数管理 + 日志查看 | 5h | [p3-8-system-params.md](tasks/p3-8-system-params.md) |

---

## P4 — AI 功能（7 个任务，32h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P4-1 | AI Chatbot 首页 | 首页改为 AI 对话框为主（类似 HuggingChat）| 8h | [p4-1-ai-chatbot.md](tasks/p4-1-ai-chatbot.md) |
| P4-2 | AI 知识库管理 | 知识库 + 员工手册 prompt + 自动更新 | 6h | [p4-2-ai-knowledge-base.md](tasks/p4-2-ai-knowledge-base.md) |
| P4-3 | AI 文档解析 | brochure 自动提取信息 | 4h | [p4-3-ai-doc-parse.md](tasks/p4-3-ai-doc-parse.md) |
| P4-4 | 智能建议引擎 | My Building 中个性化节能建议 | 5h | [p4-4-smart-advisor.md](tasks/p4-4-smart-advisor.md) |
| P4-5 | 搜索功能 | 全局搜索 + 建议 | 3h | [p4-5-search.md](tasks/p4-5-search.md) |
| P4-6 | PDF 报告生成 | 评估结果导出 | 3h | [p4-6-pdf-reports.md](tasks/p4-6-pdf-reports.md) |
| P4-7 | 邮件模板 | 8 种邮件场景 | 3h | [p4-7-email-templates.md](tasks/p4-7-email-templates.md) |

---

## P5 — 会员增强 + 数据 + 部署（12 个任务，37h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P5-1 | 数据迁移 | 从原站抓取并导入 | 4h | [p5-1-data-import.md](tasks/p5-1-data-import.md) |
| P5-2 | 响应式设计 | 移动端适配 | 3h | [p5-2-responsive.md](tasks/p5-2-responsive.md) |
| P5-3 | 表单验证 | 统一验证规则 | 3h | [p5-3-validation.md](tasks/p5-3-validation.md) |
| P5-4 | 图表组件 | 5 种图表类型 | 4h | [p5-4-charts.md](tasks/p5-4-charts.md) |
| P5-5 | 地图组件 | Leaflet + 聚合标记 | 3h | [p5-5-map.md](tasks/p5-5-map.md) |
| P5-6 | 部署配置 | 生产环境配置 + 域名切换 | 4h | [p5-6-deployment.md](tasks/p5-6-deployment.md) |
| P5-7 | 联系表单管理（待确认） | 联系请求的管理后台处理方式待调研原站 | 待确认 | [p5-7-contact-inbox.md](tasks/p5-7-contact-inbox.md) |
| P5-8 | 会员续费流程 | 到期提醒 + 续费页面 | 2h | [p5-8-renewal.md](tasks/p5-8-renewal.md) |
| P5-9 | 会员升级流程 | 升级申请 + 补付款 | 2h | [p5-9-upgrade.md](tasks/p5-9-upgrade.md) |
| P5-10 | My Technology 页面 | 会员管理自己的技术产品 | 2h | [p5-10-my-technology.md](tasks/p5-10-my-technology.md) |
| P5-11 | My Service 页面 | 会员管理自己的服务 | 2h | [p5-11-my-service.md](tasks/p5-11-my-service.md) |
| P5-12 | 多语言切换 | 中英文切换（i18n）| 3h | [p5-12-i18n.md](tasks/p5-12-i18n.md) |

---

## P6 — 性能优化 + 运维（3 个任务，9h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P6-1 | 图片加载优化 | Next.js Image 优化 + CDN | 2h | [p6-1-image-optimization.md](tasks/p6-1-image-optimization.md) |
| P6-2 | 每日数据同步 Cron Job | 定时拉取水电数据 + 增量同步 | 3h | [p6-2-daily-sync.md](tasks/p6-2-daily-sync.md) |
| P6-3 | 调查问卷功能 | R&D 项目的在线调查问卷 | 4h | [p6-3-surveys.md](tasks/p6-3-surveys.md) |

---

## 汇总

| 类别 | 任务数 | 预估工时 |
|------|--------|---------|
| INF 基础设施 | 5 | 18h |
| P0 核心功能 | 10 | 40h |
| P1 公共页面 | 12 | 31h |
| P2 评估工具 | 5 | 26h |
| P3 认证+管理后台 | 8 | 38h |
| P4 AI 功能 | 7 | 32h |
| P5 会员增强+数据+部署 | 12 | 37h |
| P6 性能优化+运维 | 3 | 9h |
| **总计** | **62** | **~231h** |

---

## 变更说明（2026-05-20）

**合并 design.md 和会议纪要，补齐以下遗漏：**

- **P0-9 密码重置/修改** — 原站有 ForgotPassword + ChangePassword 接口
- **P0-10 个人资料管理** — 原站有 UserProperty 页面
- **P1-12 绿色金融页面** — OCBC 银行合作 + 贷款计算器
- **P2-4 评估工具算法配置** — 后台可更换算法/调整参数/版本管理（会议纪要确认）
- **P2-5 AI Calculator** — 从 P4 移到 P2（属于评估工具范畴）
- **P3-3 ~ P3-8** — 管理后台拆为 6 个子任务，对应 site.ts 的 6 个 adminSections + 系统参数 + 审计日志
- **P4-1 AI Chatbot 首页** — 首页改为 AI 对话框（会议纪要核心需求）
- **P4-2 AI 知识库管理** — 知识库 + 员工手册 prompt 配置
- **P4-3 AI 文档解析** — brochure 自动提取信息
- **P4-7 邮件模板** — 原 P4-5
- **P5-8 会员续费流程** — Renew 页面 + 续费流程
- **P5-9 会员升级流程** — 升级申请 + 补付款
- **P5-10 My Technology** — 会员管理自己的技术产品
- **P5-11 My Service** — 会员管理自己的服务
- **P5-12 多语言切换** — 中英文 i18n
- **P6-1 图片加载优化** — Next.js Image + CDN
- **P6-2 每日数据同步** — 定时拉取水电数据
- **P6-3 调查问卷功能** — R&D 项目调查
