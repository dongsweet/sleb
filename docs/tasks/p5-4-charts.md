# P5-4：图表组件

| 字段 | 值 |
|------|------|
| 编号 | P5-4 |
| 优先级 | P5 — 前端增强 |
| 预估工时 | 4h |

## 背景

评估结果、建筑仪表板需要多种图表展示数据。

## 目标

1. 统一图表组件库
2. 常用图表类型：柱状图、饼图、环形图、折线图、雷达图

## 涉及文件

1. **新建** `apps/web/app/components/charts/` — 图表组件目录
2. **新建** `apps/web/app/components/charts/BarChart.tsx` — 柱状图
3. **新建** `apps/web/app/components/charts/PieChart.tsx` — 饼图
4. **新建** `apps/web/app/components/charts/DonutChart.tsx` — 环形图
5. **新建** `apps/web/app/components/charts/LineChart.tsx` — 折线图
6. **新建** `apps/web/app/components/charts/RadarChart.tsx` — 雷达图

## 技术选型

- **Recharts** — React 图表库，与 Next.js 兼容
- 或 **Chart.js** + **react-chartjs-2**

## 使用场景

| 图表 | 用途 |
|------|------|
| 柱状图 | 分项能耗对比、EUI 对比 |
| 饼图 | 系统能耗占比 |
| 环形图 | 能效评分展示 |
| 折线图 | 月度能耗趋势 |
| 雷达图 | SMEEA 四维度评分 |

## 实现要点

- 统一颜色方案（SLEB 品牌色）
- 响应式（支持移动端）
- 交互：hover 显示详情
- 暗色/亮色主题适配

## 验收标准

- [ ] 5 种图表组件可用
- [ ] 数据绑定正常
- [ ] 响应式适配
- [ ] 交互效果正常
