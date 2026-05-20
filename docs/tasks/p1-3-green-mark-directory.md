# P1-3：Green Mark 建筑目录

| 字段 | 值 |
|------|------|
| 编号 | P1-3 |
| 优先级 | P1 — 目录功能 |
| 预估工时 | 5h |

## 背景

Green Mark 认证建筑目录，包含 3,297+ 栋建筑。支持搜索、筛选和地图展示。导航中 "Buildings → Green Mark Directory" 链接到 `/buildings/green-mark-directory`。

## 目标

1. 建筑列表：搜索 + 多条件筛选
2. 地图展示：在地图上显示建筑位置
3. 建筑详情：基本信息、Green Mark 等级、能耗数据

## 涉及文件

1. **新建** `apps/web/app/buildings/green-mark-directory/page.tsx` — 目录页
2. **新建** `apps/web/app/buildings/[slug]/page.tsx` — 建筑详情
3. **新建** `apps/web/app/components/BuildingMap.tsx` — 地图组件
4. **新建** `apps/api/src/modules/buildings/routes.ts` — 建筑 API
5. **已有** `packages/db/src/schema.ts` — `directoryEntries` 表（type: building）
6. **已有** PostgreSQL PostGIS — 地理空间查询

## 筛选条件

| 条件 | 类型 | 说明 |
|------|------|------|
| 搜索 | 文本 | 名称/地址 |
| Green Mark 等级 | 下拉 | Platinum/Gold/Silver/Bronze |
| 建筑类型 | 多选 | 办公/商业/工业/住宅/学校/医院 |
| 年份范围 | 滑块 | 竣工年份 |
| 区域 | 下拉 | 新加坡各区域 |

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/buildings` | GET | 列表（支持多条件筛选 + 分页）|
| `/api/buildings/:slug` | GET | 详情 |
| `/api/buildings/bounds` | GET | 获取地图边界内的建筑（PostGIS 空间查询）|

## 地图实现

- 使用 Leaflet 或 Mapbox GL JS
- 缩放时调用 `/api/buildings/bounds` 获取当前视野内的建筑
- 点击标记显示建筑摘要
- 聚合标记（marker clustering）处理大量点

## 实现要点

- 使用 PostGIS 的空间查询：`ST_Intersects`, `ST_Within`
- 建筑位置存储为 `geometry(Point, 4326)`
- 分页：每页 20 个，总计显示总数
- 地图和数据列表同步（点击列表项在地图上定位）

## 验收标准

- [ ] 搜索和筛选功能正常
- [ ] 地图正确显示建筑标记
- [ ] 缩放/拖拽地图时动态加载
- [ ] 建筑详情页展示完整信息
- [ ] 列表和地图联动
