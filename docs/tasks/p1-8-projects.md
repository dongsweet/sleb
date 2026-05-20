# P1-8：项目页面

| 字段 | 值 |
|------|------|
| 编号 | P1-8 |
| 优先级 | P1 — 公共页面 |
| 预估工时 | 2h |

## 背景

展示 SLEB 的相关项目，包括 Research and Innovation、ZEB Plus、Racks Central Data Center、SMU Connexion 等。

## 目标

1. 项目列表页（`/projects`）
2. 项目详情页（`/projects/[slug]`）

## 涉及文件

1. **新建** `apps/web/app/projects/page.tsx` — 项目列表
2. **新建** `apps/web/app/projects/[slug]/page.tsx` — 项目详情
3. **新建** `packages/shared/src/content.ts` — 项目数据（静态）

## 项目列表

| 项目 | 路由 | 说明 |
|------|------|------|
| Research and Innovation | `/projects` | 主项目页 |
| ZEB Plus | `/projects/zeb-plus` | 零能耗建筑项目 |
| Racks Central Data Center | `/projects/racks-central-data-center` | 数据中心 |
| SMU Connexion | `/projects/smu-connexion` | 校园项目 |

## 实现要点

- 项目数据较少，可以放在 shared 包作为静态数据
- 每页包含：标题、封面图、描述、相关链接
- 可以复用 `[...slug]` 动态路由或直接建独立页面

## 验收标准

- [ ] 项目列表页展示所有项目
- [ ] 项目详情页内容完整
- [ ] 相关链接可点击
