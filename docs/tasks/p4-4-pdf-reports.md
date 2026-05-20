# P4-4：PDF 报告生成

| 字段 | 值 |
|------|------|
| 编号 | P4-4 |
| 优先级 | P4 — 报告 |
| 预估工时 | 3h |

## 背景

评估工具（THEEA/BEEA/SMEEA）的结果需要可以导出为 PDF 报告。

## 目标

1. 评估结果 PDF 报告生成
2. 上传到 MinIO 存储
3. Standard/Premium 会员可以下载

## 涉及文件

1. **新建** `apps/api/src/modules/reports/routes.ts` — 报告 API
2. **新建** `apps/worker/src/reports.ts` — 报告生成处理器
3. **新建** `apps/worker/src/templates/` — HTML 报告模板

## 报告模板

使用 HTML → PDF 转换（Puppeteer 或 pdfmake）：

```
┌─────────────────────────────┐
│    SLEB Smart Hub           │
│    Energy Assessment Report │
├─────────────────────────────┤
│                             │
│  Building: ABC Tower        │
│  Date: 2025-03-15           │
│  Assessor: John Doe         │
│                             │
│  ── Results ──              │
│  Overall Score: 75/100      │
│  Efficiency Rating: B       │
│                             │
│  ── Breakdown ──            │
│  [柱状图]                   │
│                             │
│  ── Recommendations ──      │
│  1. Upgrade HVAC...         │
│  2. LED lighting...         │
│  3. Install EMS...          │
│                             │
└─────────────────────────────┘
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/reports/:assessmentId` | GET | 获取报告（生成或下载）|
| `/api/reports/:assessmentId/download` | GET | 下载报告（MinIO pre-signed URL）|

## 流程

```
用户点击"下载报告" → API 检查报告是否已生成 → 未生成则推入 reports 队列
→ Worker 生成 PDF → 上传到 MinIO → 返回下载链接
```

## 实现要点

- 使用 Puppeteer（headless Chrome）渲染 HTML → PDF
- HTML 模板包含图表（静态 SVG/Canvas）
- MinIO 存储路径：`reports/{assessmentId}.pdf`
- 缓存已生成的报告

## 验收标准

- [ ] PDF 报告生成正常
- [ ] 报告包含完整信息
- [ ] 图表正确渲染
- [ ] 下载功能正常
- [ ] 已生成报告缓存
