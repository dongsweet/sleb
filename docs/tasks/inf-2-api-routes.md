# INF-2：API 路由完善

| 字段 | 值 |
|------|------|
| 编号 | INF-2 |
| 优先级 | INF — 基础设施 |
| 预估工时 | 6h |

## 背景

当前 API 只有 4 个模块（auth, content, membership, health），缺少建筑、目录、评估、支付、管理员等模块。

## 目标

补全所有 API 路由模块，按照任务列表中的 API 端点设计实现。

## 需要实现的模块

| 模块 | 文件 | 端点 |
|------|------|------|
| auth | `modules/auth/routes.ts` | `/login`, `/register`, `/logout`, `/profile`, `/password-reset` |
| content | `modules/content/routes.ts` | `/api/content` CRUD |
| membership | `modules/membership/routes.ts` | `/plans`, `/statuses`, `/applications`, `/user/membership` |
| buildings | `modules/buildings/routes.ts` | 列表、详情、CRUD、导入、地图查询 |
| technologies | `modules/technology/routes.ts` | 列表（筛选）、详情 |
| services | `modules/services/routes.ts` | 列表（筛选）、详情 |
| assessments | `modules/assessments/routes.ts` | 创建、获取结果 |
| payment | `modules/payment/routes.ts` | 创建订单、回调、状态查询 |
| admin | `modules/admin/routes.ts` | 管理端 CRUD、审批、上传 |
| contact | `modules/contact/routes.ts` | 提交联系表单 |
| subscribe | `modules/subscribe/routes.ts` | 订阅、确认、退订 |

## 涉及文件

1. **新建** `apps/api/src/modules/buildings/routes.ts`
2. **新建** `apps/api/src/modules/technology/routes.ts`
3. **新建** `apps/api/src/modules/services/routes.ts`
4. **新建** `apps/api/src/modules/assessments/routes.ts`
5. **新建** `apps/api/src/modules/payment/routes.ts`
6. **新建** `apps/api/src/modules/admin/routes.ts`
7. **新建** `apps/api/src/modules/contact/routes.ts`
8. **新建** `apps/api/src/modules/subscribe/routes.ts`
9. **修改** `apps/api/src/modules/auth/routes.ts` — 添加注册、登出、重置密码
10. **修改** `apps/api/src/modules/membership/routes.ts` — 添加申请和用户查询
11. **修改** `apps/api/src/server.ts` — 注册所有新模块

## 实现要点

- 每个模块独立的 routes.ts 文件
- 统一使用 Drizzle ORM 查询
- 统一错误处理（Fastify hook）
- 认证中间件（JWT cookie 验证）
- 速率限制（Valkey 计数器）

## 验收标准

- [ ] 所有模块正确注册到 Fastify
- [ ] 每个端点有请求/响应校验（Zod）
- [ ] 认证中间件正常拦截未授权请求
- [ ] 错误响应格式统一
- [ ] API 文档生成（Swagger/Redoc）
