# P1-2：服务目录

| 字段 | 值 |
|------|------|
| 编号 | P1-2 |
| 优先级 | P1 — 目录功能 |
| 预估工时 | 3h |

## 背景

节能服务提供商目录，展示各服务提供商的信息和联系方式。导航中 "Directories → Service Directory" 链接到 `/services`。

## 目标

1. 服务列表页面：列表/卡片展示
2. 服务详情页面：公司信息、服务范围、联系方式

## 涉及文件

1. **新建** `apps/web/app/services/page.tsx` — 服务列表
2. **新建** `apps/web/app/services/[slug]/page.tsx` — 服务详情
3. **新建** `apps/api/src/modules/services/routes.ts` — 服务 API
4. **已有** `packages/db/src/schema.ts` — `directoryEntries` 表（type: service）

## 页面设计

与 P1-1 技术目录类似，但字段不同：

| 字段 | 说明 |
|------|------|
| 公司名称 | 服务提供方 |
| 服务类别 | 咨询/施工/运维/审计 |
| 服务范围 | 覆盖区域 |
| 联系方式 | 电话、邮箱、网站 |
| 认证资质 | Green Mark 认证等 |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/services` | GET | 列表（支持 search, category 筛选）|
| `/api/services/:slug` | GET | 详情 |

## 验收标准

- [ ] 列表页面展示服务卡片
- [ ] 分类筛选功能正常
- [ ] 详情页展示完整信息
- [ ] 联系方式可点击（mailto, tel）
