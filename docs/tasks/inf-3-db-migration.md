# INF-3：数据库迁移

| 字段 | 值 |
|------|------|
| 编号 | INF-3 |
| 优先级 | INF — 基础设施 |
| 预估工时 | 4h |

## 背景

Drizzle schema 已定义但数据库尚未初始化。需要创建迁移文件并执行。

## 目标

1. 配置 Drizzle Kit 迁移
2. 生成初始迁移文件
3. 执行迁移创建所有表
4. 插入种子数据（管理员账户、会员等级、内容分类）

## 涉及文件

1. **新建** `packages/db/drizzle.config.ts` — Drizzle Kit 配置
2. **新建** `packages/db/migrations/0000_initial.sql` — 初始迁移
3. **新建** `packages/db/src/seed.ts` — 种子数据
4. **已有** `packages/db/src/schema.ts` — 完整 schema 定义

## 数据库表清单（13 张表）

| 表 | 说明 |
|----|------|
| users | 用户 |
| companies | 公司 |
| company_users | 公司-用户关联 |
| membership_plans | 会员等级 |
| memberships | 会员资格 |
| membership_applications | 会员申请 |
| content_items | 内容（新闻/公告/出版物） |
| directory_entries | 目录（建筑/技术/服务） |
| assessments | 评估记录 |
| assessment_snapshots | 评估快照 |
| subscribers | 邮件订阅 |
| search_index | 搜索索引 |
| payments | 支付记录 |

## 实现要点

- 使用 `drizzle-kit generate` 生成迁移
- 使用 `drizzle-kit push` 本地开发同步
- 初始化 PostGIS 扩展
- 种子数据：
  - 管理员账户（admin@sleb.local）
  - 三个会员等级（Basic/Standard/Premium）
  - 内容分类
  - 建筑类型枚举

## 验收标准

- [ ] `npx drizzle-kit generate` 生成迁移文件
- [ ] `npx drizzle-kit push` 执行迁移
- [ ] 所有表创建成功
- [ ] PostGIS 扩展可用
- [ ] 种子数据插入成功
- [ ] 管理员账户可登录
