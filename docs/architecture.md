# SLEB 技术架构

> 基于视频分析 + 代码库分析 + 会议纪要
> 最后更新：2026-05-20

---

## 1. 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| **前端** | Next.js (React) | SSR/SSG 网站，TailwindCSS 样式 |
| **后端 API** | Fastify (Node.js) | REST API，Zod 校验，session cookie 认证 |
| **Worker** | Python 脚本 | 后台任务：数据同步、报告生成、搜索索引 |
| **数据库** | PostgreSQL + PostGIS | 主数据库，含地理空间数据（建筑位置等）|
| **缓存** | Valkey (Redis) | 会话缓存、速率限制、短生命周期热查询缓存 |
| **对象存储** | MinIO | 图片、文档、报告文件存储 |
| **认证** | Email/Password + LinkedIn OAuth + reCAPTCHA | 双认证方式 |
| **支付** | Airpay | 月费率 1.5%（替代 Stripe 的 3%）|
| **AI** | Chatbot（知识库驱动）| 首页主交互，AI 推荐/建议 |
| **CI/CD** | GitHub Actions | 构建、测试、部署 |

---

## 2. 项目结构（Monorepo）

```
sleb/
├── apps/
│   ├── web/              # Next.js 前端
│   │   ├── app/          # App Router 页面
│   │   ├── components/   # UI 组件
│   │   └── data/         # 站点数据（site.ts, content.ts）
│   ├── api/              # Fastify 后端 API
│   │   └── src/
│   │       ├── modules/  # auth, content, membership, health
│   │       └── server.ts # 入口
│   └── worker/           # Python 后台任务
├── packages/
│   ├── shared/           # 共享类型和 schema（Zod）
│   └── db/               # Drizzle ORM schema
│       └── src/schema.ts # 所有数据表定义
├── docs/                 # 项目文档
└── docker-compose.yml    # 开发环境编排
```

**代码统计：** 38 个源文件，~10,000 行代码

---

## 3. 运行时拓扑

```
Cloudflare / Load Balancer
         │
       Web (Next.js)
         │
       API (Fastify) ─── Worker (Python)
         │        │
   PostgreSQL ─── Valkey
         │
   MinIO (S3-compatible)
```

---

## 4. 数据策略

### PostgreSQL（系统记录）

| 数据 | 存储方式 |
|------|----------|
| 用户账户和公司记录 | `users`, `companies`, `company_users` 表 |
| 会员申请和生命周期 | `memberships`, `membership_applications`, `membership_plans` |
| 公共目录 | `directory_entries`（building/technology/service/term）|
| 评估记录 | `assessment_records` |
| 内容管理 | `content_items`, `content_versions`, `content_workflow_events` |
| AI 建议 | `ai_suggestions` |
| 媒体资产 | `media_assets`（元数据）|
| 审计日志 | `audit_logs` |
| 扩展字段 | JSONB 列（metadata, content, inputData, resultData）|
| 地理空间 | PostGIS geometry（建筑位置、项目地图）|

### Valkey（非持久化）

- 速率限制
- 会话缓存（如果不使用无状态 session）
- 任务队列
- 短生命周期热查询缓存

### MinIO（对象存储）

- 图片（图片库、封面图）
- 文档（PDF、Excel 导入）
- 评估报告
- 会员上传的 brochure

---

## 5. 搜索策略

**第一阶段：** PostgreSQL 全文搜索（已足够）

- `search_text` 列存储可搜索文本
- GIN 索引 + `to_tsvector` 实现全文搜索

**第二阶段（可选）：** 仅在搜索质量、数据量或分析需求超出 PostgreSQL 能力时引入 OpenSearch。

---

## 6. 部署路径

| 阶段 | 方式 | 说明 |
|------|------|------|
| 1. 单机器演示 | Node.js 进程 + 本地服务 | 开发调试 |
| 2. Compose 环境 | web, api, worker, postgres/postgis, valkey, minio | Docker Compose 编排 |
| 3. 生产集群 | 无状态 web/api/worker 副本 + 负载均衡器 + 托管 PostgreSQL + S3 兼容对象存储 | 正式部署 |

---

## 7. 认证与权限

### 当前实现

- 硬编码 admin 账号（环境变量 `ADMIN_EMAIL`/`ADMIN_PASSWORD`）
- JWS session token，cookie 传递
- Timing-safe password comparison

### 待实现

- `users` 表查询 + bcrypt 密码验证
- LinkedIn OAuth 集成
- reCAPTCHA 人机验证
- 基于 membership 等级的功能权限控制
- 公司级数据隔离（只能查看/编辑自己公司的数据）

### 内容角色

| 角色 | 权限 |
|------|------|
| `content_author` | 创建/编辑草稿、提交审核 |
| `content_publisher` | 发布/撤销发布 |
| `platform_admin` | 所有内容操作 + 删除媒体 + 编辑 policy 内容 |

---

## 8. 前端路由

| 路由 | 说明 | 状态 |
|------|------|------|
| `/` | 首页（Hero + Services + News + Video）| ✅ 已实现 |
| `/news` | 新闻列表 | ✅ 已实现 |
| `/events` | 活动列表 | ✅ 已实现 |
| `/grants-and-incentives` | 补助和激励 | ✅ 已实现 |
| `/[...slug]` | 动态公共页面（catch-all）| ✅ 框架已实现，静态数据 |
| `/account/login` | 登录页 | ✅ 已实现 |
| `/admin` | 管理后台入口 | ✅ 框架已实现 |
| `/admin/[[...section]]` | 管理后台各子页面 | ✅ 框架已实现 |
| `/membership` | 会员等级页面 | ❌ 待实现 |
| `/membership/register` | 会员申请 | ❌ 待实现 |
| `/directory/*` | 目录页面 | ❌ 待实现 |
| `/tools/*` | 评估工具 | ❌ 待实现 |
| `/my-account/*` | 会员仪表板 | ❌ 待实现 |
| `/green-finance` | 绿色金融 | ❌ 待实现 |
| `/project-map` | 项目地图 | ❌ 待实现 |
| `/publications` | 出版物 | ❌ 待实现 |
| `/terms-dictionary` | 术语词典 | ❌ 待实现 |

---

## 9. CSS 与设计

- **主样式文件：** `apps/web/app/styles.css`（41KB）
- **设计系统：** 基于 HCL 风格的绿色主题
- **字体：** Inter + Plus Jakarta Sans
- **设计 Token 定义：** `apps/web/app/design-tokens.css`

---

## 10. 已知技术债务

| 问题 | 说明 | 优先级 |
|------|------|--------|
| 硬编码 admin 认证 | 需要从 `users` 表查询，支持多用户 | P0 |
| 缺少支付 API | Airpay 集成尚未实现 | P0 |
| 评估工具占位 | API 有 schema 但无实现逻辑 | P2 |
| AI 建议占位 | `buildAiPlaceholderOutput` 返回硬编码文本 | P4 |
| 缺少 Docker Compose | 开发环境需要手动启动各服务 | INF |
| 搜索仅 PostgreSQL | 当前仅 `searchText` 列，未建 GIN 索引 | P1 |
