# P0-6：建筑编辑弹窗

| 字段 | 值 |
|------|------|
| 编号 | P0-6 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 3h |

## 背景

会员需要在 My Building 仪表板中编辑建筑信息。原站使用弹出式表单（非页面跳转）。

## 目标

实现建筑信息编辑弹窗，支持新增和编辑。

## 涉及文件

1. **新建** `apps/web/app/components/BuildingEditModal.tsx` — 弹窗组件
2. **已有** `packages/db/src/schema.ts` — `directoryEntries` 表
3. **待新建** API 端点：`PATCH /api/buildings/:id`

## 表单字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 建筑名称 | text | ✅ | 显示名称 |
| 地址 | text | ✅ | 完整地址 |
| 邮编 | text | ✅ | 6 位新加坡邮编 |
| Green Mark 等级 | select | ❌ | Platinum/Gold/Silver/Bronze |
| 建筑面积 | number | ✅ | 平方米 |
| 竣工年份 | number | ✅ | 年份 |
| 建筑类型 | select | ✅ | 办公/商业/工业/住宅等 |
| 当前 EUI | number | ❌ | kWh/m²/year |
| 楼层数 | number | ❌ | 层数 |

## 实现要点

- 复用 `LoginModal` 的弹窗模式（遮罩层 + 居中面板）
- 表单校验使用 Zod schema
- 提交后调用 API 保存数据
- 支持从 My Building 仪表板任意 Tab 触发编辑

## 验收标准

- [ ] 点击"Edit Building"弹出表单
- [ ] 表单字段完整，校验正常
- [ ] 提交后数据保存到数据库
- [ ] 编辑成功后仪表板数据更新
- [ ] 点击遮罩层或 ESC 关闭弹窗
