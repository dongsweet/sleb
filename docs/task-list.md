# SLEB 任务清单

> 基于视频分析 + 代码库分析 + 会议纪要生成
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

## P0 — 核心功能（8 个任务，32h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P0-1 | 登录模态框（弹窗式） | 导航栏 "Log in" 点击弹出 | 2h | [p0-1-login-modal.md](tasks/p0-1-login-modal.md) |
| P0-2 | 会员等级页面 + 注册表单 | `/membership` 三栏对比 + 申请表单 | 4h | [p0-2-membership-page.md](tasks/p0-2-membership-page.md) |
| P0-3 | 支付集成（Airpay） | Standard/Premium 会员付费 | 3h | [p0-3-payment.md](tasks/p0-3-payment.md) |
| P0-4 | My Membership 仪表板 | 会员状态/功能/到期提醒 | 3h | [p0-4-my-membership.md](tasks/p0-4-my-membership.md) |
| P0-5 | My Building 仪表板（6 Tab） | 建筑数据管理的核心界面 | 8h | [p0-5-my-building.md](tasks/p0-5-my-building.md) |
| P0-6 | 建筑编辑弹窗 | 弹窗式建筑信息编辑 | 3h | [p0-6-building-edit.md](tasks/p0-6-building-edit.md) |
| P0-7 | 建筑数据导入 | 批量导入 Excel/CSV | 3h | [p0-7-building-import.md](tasks/p0-7-building-import.md) |
| P0-8 | 用户注册页面 | 注册表单 + 邮箱验证 + reCAPTCHA | 3h | [p0-8-register.md](tasks/p0-8-register.md) |

---

## P1 — 公共页面（11 个任务，26h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P1-1 | 技术目录 | 列表 + 筛选 + 星级卡片 | 4h | [p1-1-technology-directory.md](tasks/p1-1-technology-directory.md) |
| P1-2 | 服务目录 | 服务提供商列表 + 详情 | 3h | [p1-2-service-directory.md](tasks/p1-2-service-directory.md) |
| P1-3 | Green Mark 建筑目录 | 搜索 + 地图展示 | 5h | [p1-3-green-mark-directory.md](tasks/p1-3-green-mark-directory.md) |
| P1-4 | 新闻页面 | 列表 + 详情 + 标签筛选 | 3h | [p1-4-news-page.md](tasks/p1-4-news-page.md) |
| P1-5 | 活动和公告页面 | 两类内容的列表 + 详情 | 2h | [p1-5-events-announcements.md](tasks/p1-5-events-announcements.md) |
| P1-6 | 出版物页面 | 列表 + PDF 下载 | 2h | [p1-6-publications.md](tasks/p1-6-publications.md) |
| P1-7 | 术语词典页面 | A-Z 索引 + 搜索 | 2h | [p1-7-terms-dictionary.md](tasks/p1-7-terms-dictionary.md) |
| P1-8 | 项目页面 | 4 个项目的列表 + 详情 | 2h | [p1-8-projects.md](tasks/p1-8-projects.md) |
| P1-9 | 联系页面 | 表单 + 邮件发送 | 2h | [p1-9-contact.md](tasks/p1-9-contact.md) |
| P1-10 | 订阅页面 | 邮件列表订阅 + 确认/退订 | 2h | [p1-10-subscribe.md](tasks/p1-10-subscribe.md) |
| P1-11 | 关于页面 | 纯静态内容页 | 1h | [p1-11-about.md](tasks/p1-11-about.md) |
| P5-7 | 联系表单管理（待确认） | 联系请求的管理后台处理方式待调研原站 | 待确认 | [p5-7-contact-inbox.md](tasks/p5-7-contact-inbox.md) |

---

## P2 — 评估工具（3 个任务，17h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P2-1 | THEEA 住宅能效评估 | 多步骤表单 + 计算 + 报告 | 5h | [p2-1-theea.md](tasks/p2-1-theea.md) |
| P2-2 | BEEA 建筑能效评估 | 建筑级评估（7 步骤）| 6h | [p2-2-beea.md](tasks/p2-2-beea.md) |
| P2-3 | SMEEA 企业综合评估 | 企业级可持续性评估 | 6h | [p2-3-smeea.md](tasks/p2-3-smeea.md) |

---

## P3 — 认证增强 + 管理后台（3 个任务，15h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P3-1 | LinkedIn OAuth 登录 | 第三方快捷登录 | 3h | [p3-1-linkedin-oauth.md](tasks/p3-1-linkedin-oauth.md) |
| P3-2 | reCAPTCHA 集成 | 防机器人注册 | 2h | [p3-2-recaptcha.md](tasks/p3-2-recaptcha.md) |
| P3-3 | 管理后台 | 内容管理 + 会员审批 | 10h | [p3-3-admin-panel.md](tasks/p3-3-admin-panel.md) |

---

## P4 — AI 功能 + 报告（5 个任务，18h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P4-1 | AI Calculator | 建筑能耗计算器 | 4h | [p4-1-ai-calculator.md](tasks/p4-1-ai-calculator.md) |
| P4-2 | 智能建议引擎 | 个性化节能建议 | 5h | [p4-2-smart-advisor.md](tasks/p4-2-smart-advisor.md) |
| P4-3 | 搜索功能 | 全局搜索 + 建议 | 3h | [p4-3-search.md](tasks/p4-3-search.md) |
| P4-4 | PDF 报告生成 | 评估结果导出 | 3h | [p4-4-pdf-reports.md](tasks/p4-4-pdf-reports.md) |
| P4-5 | 邮件模板 | 8 种邮件场景 | 3h | [p4-5-email-templates.md](tasks/p4-5-email-templates.md) |

---

## P5 — 数据迁移 + 增强 + 部署（6 个任务，21h）

| # | 任务 | 说明 | 预估 | 文档 |
|---|------|------|------|------|
| P5-1 | 数据迁移 | 从原站抓取并导入 | 4h | [p5-1-data-import.md](tasks/p5-1-data-import.md) |
| P5-2 | 响应式设计 | 移动端适配 | 3h | [p5-2-responsive.md](tasks/p5-2-responsive.md) |
| P5-3 | 表单验证 | 统一验证规则 | 3h | [p5-3-validation.md](tasks/p5-3-validation.md) |
| P5-4 | 图表组件 | 5 种图表类型 | 4h | [p5-4-charts.md](tasks/p5-4-charts.md) |
| P5-5 | 地图组件 | Leaflet + 聚合标记 | 3h | [p5-5-map.md](tasks/p5-5-map.md) |
| P5-6 | 部署配置 | 生产环境配置 | 4h | [p5-6-deployment.md](tasks/p5-6-deployment.md) |

---

## 汇总

| 类别 | 任务数 | 预估工时 |
|------|--------|---------|
| INF 基础设施 | 5 | 18h |
| P0 核心功能 | 8 | 32h |
| P1 公共页面 | 11 | 26h |
| P2 评估工具 | 3 | 17h |
| P3 认证+管理 | 3 | 15h |
| P4 AI+报告 | 5 | 18h |
| P5 数据+部署+待确认 | 7 | 21h+ |
| **总计** | **42** | **~147h+** |
