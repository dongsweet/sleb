# SLEB 网站迁移 Cloudflare 与重建工作量评估

## 1. 现有网站初步判断

我检查了 https://www.sleb.sg/ 的公开可访问部分，包括：

- 首页
- Building / Green Mark Buildings Directory
- Technologies Directory
- Service Directory
- Terms Dictionary
- Project Maps
- AI Calculator
- Energy Benchmarking
- Membership / Register

目前这个网站看起来已经放在 Cloudflare 后面，但 Cloudflare 主要只是作为 CDN / 反向代理层使用。真正的应用源站仍然是一个较旧的 ASP.NET MVC 系统。

换句话说，如果现在源码不可见，就不能简单理解为“把旧代码搬到 Cloudflare”。更现实的做法是重新建设一个现代版网站，然后把域名和流量切到新的 Cloudflare 架构上。

## 2. 当前技术栈推断

根据公开页面、HTTP 响应头和前端资源判断，现站大致技术栈如下：

- 后端：ASP.NET MVC 5.3 / ASP.NET 4.x
- 前端：jQuery 1.11、Vue 2、Bootstrap / Material Design、Axios
- 第三方服务：Google Maps、Google reCAPTCHA、LinkedIn 登录、Typeform、Google Tag Manager
- Cloudflare：目前主要作为边缘代理和缓存层，不是主应用平台
- 数据：不少公开接口仍可访问，但原始源码、后台逻辑和完整数据库不可见

## 3. 公开数据规模

从公开接口和页面可以看到的大致数据规模如下：

- Green Mark 建筑目录：约 4,676 条记录
- 技术目录：约 161 条记录
- 术语字典：约 522 条记录
- R&D 项目：约 34 条记录
- 服务目录：规模较小，可能是几十条记录
- 会员、评估工具、仪表盘等功能：多数需要登录后才能完整评估

这些数据说明，网站不是一个纯展示站，而是带有目录、搜索、筛选、地图、会员和评估工具的应用型网站。

## 4. 工作量估算

### 方案 A：只复刻公开网站

范围包括：

- 公开页面
- 新闻 / 内容页
- 目录列表
- 搜索和筛选
- 详情页
- 地图展示
- 移动端适配

预计周期：

- 约 4-6 周

说明：

- 这个方案适合目标只是“先做一个看起来像原站的公开网站”。
- 不包含完整后台管理、会员流程和复杂评估工具。
- 虽然公开接口能看到不少数据，但不建议在没有授权的情况下把抓取数据当作正式迁移方案。

### 方案 B：现代化 MVP + 可维护后台

范围包括：

- 新前端
- 新数据库模型
- 内容管理后台
- 目录数据管理
- 会员注册和登录
- 基础角色权限
- 数据导入
- SEO
- Cloudflare 部署

预计周期：

- 约 10-14 周

这是我比较推荐的现实版本。它不是简单镜像旧网站，而是重建一个后续可维护、可扩展的现代网站。

### 方案 C：完整功能等价重建

在方案 B 基础上，还包括：

- THEEA
- BEEA
- SMEEA
- AI Calculator
- Energy Benchmarking
- Green Mark Verification
- 会员工作流
- 后台审批
- 文件上传
- 报表和仪表盘

预计周期：

- 没有原数据库 / 源码：约 16-24 周以上
- 如果能拿到数据库备份、媒体文件、后台权限或接口文档：约 12-16 周

这个方案最大的不确定性不在 UI，而在业务规则和算法。比如评估工具、能耗计算、AI Calculator、验证流程等，都需要确认原来的计算逻辑和审核流程。

## 5. 推荐新技术栈

如果目标是迁移到 Cloudflare，并且让网站变成现代可维护架构，我建议采用 Cloudflare-native 方案：

- 前端：Next.js + TypeScript + Tailwind CSS
- UI 系统：shadcn/ui 或轻量自建 design system
- 后端 API：Cloudflare Workers + Hono
- 数据库：Postgres + Cloudflare Hyperdrive
- 小规模替代方案：Cloudflare D1
- 文件存储：Cloudflare R2
- 缓存 / 轻量状态：Cloudflare KV
- 登录认证：Better Auth 或 Auth.js
- 防机器人验证：Cloudflare Turnstile，替代 Google reCAPTCHA
- 搜索：MVP 可用 Postgres full-text search；高级搜索可用 Typesense 或 Meilisearch
- 地图：继续使用 Google Maps，或换成 Mapbox
- 分析统计：Cloudflare Web Analytics + GA / GTM
- 后台管理：Next.js Admin

## 6. 建议模块分期

### 第一期：公开网站

- 首页
- About
- News
- Events
- Publications
- Grants / Incentives
- Building Directory
- Technology Directory
- Service Directory
- Terms Dictionary
- R&D Project List / Map
- Contact
- Feedback
- Subscribe
- Privacy Policy
- Terms and Conditions
- Sitemap

### 第二期：会员和后台

- 会员注册
- 登录
- 公司资料
- 用户角色
- 内容管理
- 目录管理
- 技术 / 服务提交
- 审核流程
- 文件上传
- 媒体库
- 邮件通知
- 订阅管理

### 第三期：高风险业务功能

- AI Calculator
- THEEA
- BEEA
- SMEEA
- Energy Benchmarking
- Green Mark Verification
- Building / Technology Dashboard

这些功能建议等拿到普通会员账号后再做更细评估。后台权限第一阶段不是必须，但如果要完整重建和迁移数据，最终还是需要数据库导出、后台账号、接口文档或旧系统供应商配合。

## 7. 推荐项目推进方式

不建议做单纯的旧站镜像。更好的做法是重建一个现代化版本，同时保留：

- 重要 URL 结构
- 内容层级
- 核心目录数据
- 必要的会员流程
- SEO 和旧链接重定向

推荐流程：

1. 先基于公开数据做功能清单和数据模型。
2. 获取一个普通会员账号，检查会员区和隐藏流程。
3. 让网站主确认哪些模块必须 1:1 保留，哪些可以简化或现代化。
4. 建设 Cloudflare 架构下的 MVP。
5. 通过授权导出、数据库备份或后台导出迁移数据和媒体文件。
6. 配置旧 URL 重定向和域名切换。
7. 上线后监控访问、错误和性能。

整体来看，如果客户想要一个可靠、可维护、现代化的 SLEB 替代站，建议按 3-5 个月规划。如果只是先上线公开网站和目录，第一版大约 1-1.5 个月可以完成。

## 8. 团队与 AI 参与后的工作量

如果按“公开网站 + 目录 + 基础会员 + 基础后台”的 MVP 范围来做，在没有深度 AI 辅助的情况下，比较现实的周期是 10-14 周。

推荐团队配置：

- 1 个全栈负责人 / Tech Lead
- 1 个前端工程师
- 1 个后端工程师
- 0.5 个 UI/UX 设计师
- 0.5 个 QA / 测试
- 0.2-0.5 个客户方协调人，负责内容确认、账号协助、业务规则确认和验收

也就是大约：

- 3 个核心全职成员
- 设计和测试兼职支持
- 客户方需要持续配合

如果 AI 深度参与，可以明显减少以下部分的人工投入：

- 页面重建
- 代码生成
- 数据模型初稿
- API 实现
- 迁移脚本
- 测试脚本
- 文档整理
- 重构和前端细节调整

但 AI 不能完全替代：

- 客户确认
- 账号和权限协调
- 业务规则还原
- 数据和图片授权确认
- 最终验收
- 生产环境责任

## 9. 人力对比

| 范围 | 传统人力 / 周期 | AI 辅助后的人力 / 周期 |
| --- | --- | --- |
| 公开站复刻 | 2-3 人，4-6 周 | 1-2 人 + AI，3-5 周 |
| 现代化 MVP | 4-5 人，10-14 周 | 2-3 人 + AI，8-12 周 |
| 完整功能重建 | 5-7 人，16-24 周以上 | 3-5 人 + AI，14-20 周以上 |

## 10. 实际推荐团队

最舒服、风险也比较可控的组合是：

- 你或客户方 PM：负责客户沟通、范围确认、验收
- 1 个强全栈工程师：和 AI 配合做主开发
- 1 个前端 / UI 工程师：负责界面质量、响应式和交互细节
- 1 个兼职 QA / 部署支持人员

在这个配置下，如果隐藏功能不太复杂、客户反馈及时，MVP 大概可以在 8-12 周完成。

如果只有 1 个工程师 + AI + 客户方配合，也可以做，但周期更可能是 12-16 周，尤其是会员工具、后台和业务规则需要重新梳理时。
