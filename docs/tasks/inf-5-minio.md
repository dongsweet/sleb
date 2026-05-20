# INF-5：MinIO 对象存储集成

| 字段 | 值 |
|------|------|
| 编号 | INF-5 |
| 优先级 | INF — 基础设施 |
| 预估工时 | 2h |

## 背景

图片、PDF 报告等文件需要存储。MinIO 作为 S3 兼容的对象存储方案。

## 目标

1. API 能上传/下载文件到 MinIO
2. 管理后台支持文件上传
3. 报告生成后自动上传

## 涉及文件

1. **新建** `apps/api/src/lib/minio.ts` — MinIO 客户端封装
2. **新建** `apps/api/src/modules/admin/routes.ts` — 上传端点（部分）
3. **新建** `apps/worker/src/reports.ts` — 报告上传（部分）

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/upload` | POST | 上传文件（管理员）|
| `/api/files/:key/download` | GET | 下载文件（pre-signed URL）|

## 实现要点

- 使用 `minio` npm 包
- bucket 设计：
  - `sleb-images` — 图片（新闻配图、建筑照片等）
  - `sleb-reports` — PDF 报告
  - `sleb-publications` — 出版物 PDF
- pre-signed URL 有效期：1 小时
- 文件上传限制：10MB

## 环境变量

```
MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=xxx
MINIO_SECRET_KEY=xxx
MINIO_BUCKET=xxx
```

## 验收标准

- [ ] MinIO 客户端连接正常
- [ ] 文件上传功能可用
- [ ] Pre-signed URL 下载正常
- [ ] 文件限制生效
