# INF-1：Docker Compose 开发环境

| 字段 | 值 |
|------|------|
| 编号 | INF-1 |
| 优先级 | INF — 基础设施 |
| 预估工时 | 4h |

## 背景

当前没有 Docker Compose 配置，开发环境需要手动启动各服务。需要一次性编排所有依赖服务。

## 目标

编写 `docker-compose.yml`，一键启动所有开发环境服务。

## 需要编排的服务

| 服务 | 镜像/构建 | 端口 | 说明 |
|------|-----------|------|------|
| postgres | postgres:16-alpine + PostGIS | 5432 | 主数据库 |
| valkey | valkey/valkey:latest | 6379 | 缓存/队列 |
| minio | minio/minio | 9000, 9001 | 对象存储 |
| web | 构建 apps/web | 3000 | Next.js 开发服务器 |
| api | 构建 apps/api | 4000 | Fastify API |
| worker | 构建 apps/worker | 无 | 后台任务 |

## 涉及文件

1. **新建** `docker-compose.yml` — 服务编排
2. **新建** `apps/web/Dockerfile` — Next.js 构建
3. **新建** `apps/api/Dockerfile` — Fastify 构建
4. **已有** `apps/worker/Dockerfile` — 需检查是否完整
5. **新建** `.env.example` — 环境变量模板

## 实现要点

- PostgreSQL 初始化时安装 PostGIS 扩展
- MinIO 使用 `mc` 创建 bucket
- web/api/worker 共享 `.env` 文件（volume 挂载）
- 开发模式：hot reload，生产模式：预构建镜像
- 网络隔离：postgres/valkey/minio 只在内部网络暴露

## 验收标准

- [ ] `docker compose up` 能启动所有服务
- [ ] web 服务可在 `http://localhost:3000` 访问
- [ ] API 服务可在 `http://localhost:4000/health` 返回 ok
- [ ] Worker 能连接 Valkey 和 PostgreSQL
- [ ] MinIO 创建默认 bucket
