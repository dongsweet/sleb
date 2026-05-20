# API 接口规范

> 基于 Fastify 后端，TypeScript + Zod 校验
> 基础路径：`http://localhost:4000`（开发环境）

---

## 1. 健康检查

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/health` | GET | 无 | 服务健康检查 |
| `/ready` | GET | 无 | 就绪检查 |

**响应示例：**
```json
{ "ok": true, "service": "sleb-api", "timestamp": "2026-05-20T00:00:00Z" }
```

---

## 2. 认证（Auth）

### 2.1 登录

**`POST /auth/login`**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string (email) | ✅ | 邮箱地址 |
| password | string | ✅ | 密码 |

**响应：**
```json
{ "user": { "email": "xxx", "name": "xxx", "role": "xxx" } }
```
设置 `set-cookie` 头（session token）。

**错误：**
- `401`: `{ "error": "Invalid email or password" }`

> **当前实现**：硬编码 admin 账号（`ADMIN_EMAIL` / `ADMIN_PASSWORD` 环境变量）
> **待实现**：从 `users` 表查询，bcrypt 验证

### 2.2 获取当前用户

**`GET /auth/me`**（需认证）

**响应：**
```json
{ "user": { "email": "xxx", "name": "xxx", "role": "xxx" } }
```

**错误：**
- `401`: `{ "error": "Not authenticated" }`

### 2.3 登出

**`POST /auth/logout`**

清除 session cookie。

---

## 3. 内容管理（Content）

### 3.1 内容配置

**`GET /content/config`**（无需认证）

返回内容类型、状态标签和角色配置。

### 3.2 内容列表

**`GET /content/items`**

| 查询参数 | 类型 | 必填 | 说明 |
|----------|------|------|------|
| type | enum | ❌ | 内容类型过滤 |
| status | enum | ❌ | 状态过滤 |
| search | string | ❌ | 全文搜索 |

- 未认证用户只能查看 `published` 状态的内容
- 认证用户（content role）可查看所有状态

### 3.3 创建内容

**`POST /content/items`**（需 content role）

**请求体：** `contentItemInputSchema`（type, title, slug, summary, body, status...）

**响应：** `201` 创建成功

**错误：**
- `409`: slug 已存在
- `403`: 权限不足

### 3.4 内容详情

**`GET /content/items/:id`**（需 content role）

### 3.5 更新内容

**`PATCH /content/items/:id`**（需 content role）

部分更新，请求体为 `contentItemInputSchema.partial()`

### 3.6 工作流操作

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/content/items/:id/submit` | POST | content_author | 提交审核（→ in_review） |
| `/content/items/:id/publish` | POST | content_publisher | 发布（→ published） |
| `/content/items/:id/unpublish` | POST | content_publisher | 撤销发布（→ draft） |

### 3.7 AI 建议

**`POST /content/ai/suggestions`**（需 content role）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| itemId | string | ✅ | 关联内容 ID |
| kind | enum | ✅ | 建议类型：summarize / seo / alt_text / image_prompt / expand |
| input | string | ✅ | 输入文本 |

> **当前实现**：占位输出（placeholder），后续接入真实 AI 模型

### 3.8 媒体管理

| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/content/media` | GET | content role | 媒体列表 |
| `/content/media` | POST | content role | 上传媒体（≤ 8MB） |
| `/content/media/:id/file` | GET | 无 | 下载文件（带缓存头） |
| `/content/media/:id` | DELETE | platform_admin | 删除媒体 |

**上传请求体：**
```json
{
  "filename": "image.jpg",
  "mimeType": "image/jpeg",
  "data": "base64...",
  "altText": "...",
  "caption": "..."
}
```

支持的 mimeType：`image/gif`, `image/jpeg`, `image/png`, `image/svg+xml`, `image/webp`

---

## 4. 会员（Membership）

### 4.1 会员计划

**`GET /membership/plans`**（无需认证）

返回三个会员等级（Basic/Standard/Premium）及功能矩阵。

### 4.2 会员状态

**`GET /membership/statuses`**（无需认证）

返回会员状态描述列表。

---

## 5. 待实现的 API 端点

### 5.1 目录（P1）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/buildings` | GET | 建筑列表（搜索+筛选） |
| `/api/buildings/:id` | GET | 建筑详情 |
| `/api/buildings/:id` | PATCH | 编辑建筑 |
| `/api/buildings/import` | POST | 批量导入建筑数据 |
| `/api/technologies` | GET | 技术列表 |
| `/api/technologies/:id` | GET | 技术详情 |
| `/api/services` | GET | 服务列表 |
| `/api/services/:id` | GET | 服务详情 |

### 5.2 评估工具（P2）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/assessments` | GET/POST | 评估记录列表/创建 |
| `/api/assessments/:id` | GET/PATCH | 评估详情/更新 |
| `/api/assessments/:id/report` | GET | 生成评估报告 |
| `/api/calculator` | POST | AI 计算器 |

### 5.3 管理后台（P3）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/users` | GET/POST | 用户管理 |
| `/api/admin/users/:id` | GET/PATCH/DELETE | 用户操作 |
| `/api/admin/companies` | GET/POST | 公司管理 |
| `/api/admin/companies/:id` | GET/PATCH/DELETE | 公司操作 |
| `/api/admin/applications` | GET | 会员申请列表 |
| `/api/admin/applications/:id/approve` | POST | 审批通过 |
| `/api/admin/applications/:id/reject` | POST | 审批拒绝 |
| `/api/admin/logs` | GET | 审计日志 |
| `/api/admin/parameters` | GET/PATCH | 系统参数 |

### 5.4 支付（P0）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/payment/create` | POST | 创建支付订单（Airpay） |
| `/api/payment/callback` | POST | 支付回调 |
| `/api/payment/status` | GET | 查询支付状态 |

### 5.5 AI 功能（P4）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/ai/chat` | POST | AI Chatbot 对话 |
| `/api/ai/knowledge` | GET/POST | 知识库管理 |
| `/api/ai/parse-document` | POST | 文档解析（brochure → 结构化） |
| `/api/ai/recommend` | POST | Smart Advisor AI 推荐 |

---

## 6. 认证与权限

### 6.1 当前认证方式

- Session Cookie（JWS token）
- 硬编码 admin 账号（环境变量）

### 6.2 内容角色（Content Roles）

| 角色 | 权限 |
|------|------|
| `content_author` | 创建/编辑草稿、提交审核 |
| `content_publisher` | 发布/撤销发布内容 |
| `platform_admin` | 所有内容操作 + 删除媒体 |

### 6.3 内容类型权限

- `policy` 类型内容需要 `platform_admin` 才能编辑
- 其他类型 `content_author` 即可编辑

### 6.4 待实现的权限

- 用户角色（admin, member, viewer 等）
- 基于 membership 等级的功能 gating
- 公司级数据隔离（只能查看/编辑自己公司的数据）

---

## 7. 环境变量

| 变量 | 说明 |
|------|------|
| `ADMIN_EMAIL` | admin 账号邮箱 |
| `ADMIN_PASSWORD` | admin 账号密码 |
| `ADMIN_NAME` | admin 显示名 |
| `ADMIN_CONTENT_ROLE` | admin 内容角色 |
| `AUTH_SESSION_SECRET` | session token 密钥 |
| `AUTH_SESSION_TTL_SECONDS` | session 过期时间 |
| `AUTH_COOKIE_SECURE` | cookie secure 标志 |
| `DATABASE_URL` | PostgreSQL 连接串 |
| `MINIO_ENDPOINT` | MinIO 端点 |
| `MINIO_PORT` | MinIO 端口 |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 |
| `MINIO_SECRET_KEY` | MinIO 密钥 |
| `MINIO_BUCKET` | MinIO bucket 名 |
| `MINIO_USE_SSL` | MinIO SSL 标志 |
