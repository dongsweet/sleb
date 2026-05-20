# SLEB Smart Hub — 复刻项目

> 目标：复刻 https://sleb.sg/（Singapore Low Energy Building Smart Hub）
> 项目根目录：`/home/dq/code/sleb`
> 代码统计：38 个源文件，~10,000 行

## 文档导航

| 文档 | 说明 |
|------|------|
| [README](README.md) | 项目概览、技术栈、本地开发 |
| [architecture.md](docs/architecture.md) | 系统架构、运行时拓扑、数据策略 |
| [design.md](docs/design.md) | 完整设计文档 — 页面路由、核心页面、API 设计、实现计划 |
| [video-meeting-notes.md](docs/video-meeting-notes.md) | 会议纪要 — 需求讨论、功能分析、决策记录 |
| [task-list.md](docs/task-list.md) | 任务清单 — 按优先级分组的全部开发任务 |
| [api-spec.md](docs/api-spec.md) | API 接口规范 — 已有端点 + 待实现端点 |
| [database-schema.md](docs/database-schema.md) | 数据库 Schema 文档 |
| [assessment-tools.md](docs/assessment-tools.md) | 评估工具详细说明（THEEA/BEEA/SMEEA/AI Calculator）|
| [SLEB_Cloudflare_Rebuild_Assessment.md](docs/cloudflare-rebuild-assessment.md) | 迁移 Cloudflare 与重建工作量评估 |
| [SLEB_Logged_In_Membership_Logic_Assessment.md](docs/logged-in-membership-logic-assessment.md) | 登录后会员逻辑分析 |

## 快速开始

```bash
npm install
npm run dev:api    # API: http://localhost:4000
npm run dev:web    # Web: http://localhost:3000
```

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 15 (App Router), React 19, TypeScript |
| 后端 API | Fastify + TypeScript |
| 数据库 | PostgreSQL + PostGIS (Drizzle ORM) |
| 对象存储 | MinIO (S3 兼容) |
| 缓存/队列 | Valkey |
| 共享类型 | @sleb/shared 包 |
| 认证 | Session Cookie + LinkedIn OAuth |
| 支付 | Airpay (1.5% 费率) |

## 项目结构

```
apps/
  web/        # Next.js 前端
  api/        # Fastify API
  worker/     # 异步任务（邮件、导入、报告生成）
packages/
  shared/     # 共享类型和验证
  db/         # 数据库 Schema
```

## 原始站点

SLEB 是一个新加坡绿色建筑服务平台，原站技术栈为 ASP.NET MVC + jQuery + Vue 2，运行在 Cloudflare 后面。我们使用现代技术栈完全重建。

## 数据来源

- 视频分析：`/home/dq/code/meeting-minutes/video-to-pages/work/c29b540ac8724266a7d77078c243b2da/result.json`
- 原始站点：https://sleb.sg/
