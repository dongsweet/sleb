# P5-5：地图组件

| 字段 | 值 |
|------|------|
| 编号 | P5-5 |
| 优先级 | P5 — 前端增强 |
| 预估工时 | 3h |

## 背景

Green Mark 建筑目录需要在地图上展示建筑位置。

## 目标

1. 地图组件（Leaflet 或 Mapbox）
2. 标记聚合（大量建筑点）
3. 地图和数据列表联动

## 涉及文件

1. **新建** `apps/web/app/components/BuildingMap.tsx` — 地图组件
2. **新建** `apps/web/app/components/MapMarker.tsx` — 标记组件
3. **新建** `apps/web/app/components/MapCluster.tsx` — 聚合组件

## 技术选型

- **React-Leaflet** — 开源、轻量
- **Leaflet.markercluster** — 标记聚合

## 功能需求

- 缩放时动态加载（bounds query）
- 点击标记显示建筑摘要
- 地图和数据列表联动（点击列表项在地图上定位）
- 聚合标记显示数量

## 实现要点

- 使用 PostGIS 空间查询获取 bounds 内的建筑
- 聚合：超过阈值时显示数字气泡
- 标记颜色按 Green Mark 等级区分
- 移动端全屏地图

## 验收标准

- [ ] 地图加载正常
- [ ] 标记正确显示
- [ ] 聚合功能正常
- [ ] 地图和列表联动
