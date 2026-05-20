# P1-6：出版物页面

| 字段 | 值 |
|------|------|
| 编号 | P1-6 |
| 优先级 | P1 — 公共页面 |
| 预估工时 | 2h |

## 背景

出版物包括白皮书、行业报告、案例研究等。用户可查看并下载 PDF。

## 目标

1. 出版物列表页（`/publications`）
2. 出版物详情页（`/publications/[slug]`）
3. PDF 下载功能（从 MinIO）

## 涉及文件

1. **新建** `apps/web/app/publications/page.tsx` — 出版物列表
2. **新建** `apps/web/app/publications/[slug]/page.tsx` — 出版物详情
3. **新建** `apps/api/src/modules/publications/routes.ts` — 出版物 API
4. **已有** `packages/db/src/schema.ts` — `contentItems` 表（type: publication）

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/publications` | GET | 列表（type 筛选 + 分页）|
| `/api/publications/:slug` | GET | 详情 |
| `/api/publications/:slug/download` | GET | 下载 PDF（MinIO pre-signed URL）|

## 页面布局

```
┌─────────────────────────────────────────────────┐
│  Publications                                    │
│                                                 │
│  类型: [全部][White Papers][Reports][Cases]     │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │ 📄 白皮书标题                       │        │
│  │ 摘要...                             │        │
│  │ 2025-03 | PDF: 2.3MB  [Download]   │        │
│  └─────────────────────────────────────┘        │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

## 实现要点

- PDF 存储在 MinIO，通过 pre-signed URL 下载
- 详情页包含：标题、摘要、作者、发布日期、文件大小
- 统计下载次数

## 验收标准

- [ ] 列表页展示出版物
- [ ] 分类筛选正常
- [ ] PDF 下载功能正常
- [ ] 下载次数统计
