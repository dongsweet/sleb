# INF-4：Worker 队列实现

| 字段 | 值 |
|------|------|
| 编号 | INF-4 |
| 优先级 | INF — 基础设施 |
| 预估工时 | 6h |

## 背景

Worker 目前只定义了队列名称，没有实际处理逻辑。需要实现四个队列的消费者。

## 目标

实现 4 个队列的消费者：

| 队列 | 功能 |
|------|------|
| email | 发送邮件（验证、通知、报告）|
| imports | 建筑数据批量导入 |
| reports | 生成 PDF 报告 |
| search-indexing | 维护搜索索引 |

## 涉及文件

1. **修改** `apps/worker/src/main.ts` — 队列配置和启动
2. **新建** `apps/worker/src/email.ts` — 邮件处理器
3. **新建** `apps/worker/src/imports.ts` — 导入处理器
4. **新建** `apps/worker/src/reports.ts` — 报告处理器
5. **新建** `apps/worker/src/search.ts` — 搜索索引处理器

## 技术选型

- 队列：BullMQ（Valkey 后端）
- 邮件：nodemailer 或直接 SMTP
- PDF：Puppeteer 或 pdfmake
- 搜索：PostgreSQL 全文搜索

## 实现要点

### Email 队列

```typescript
queue.process('email', async (job) => {
  const { to, subject, html, from } = job.data;
  await transporter.sendMail({ to, subject, html, from });
});
```

### Imports 队列

- 解析 Excel/CSV
- 逐行校验
- 事务批量插入
- 返回导入报告

### Reports 队列

- 获取评估数据
- 渲染 HTML 模板
- 转换为 PDF
- 上传到 MinIO

### Search Indexing 队列

- 监听内容变更
- 更新 `search_index` 表
- 使用 PostgreSQL `to_tsvector`

## 验收标准

- [ ] 4 个队列消费者正常启动
- [ ] Email 队列能发送邮件
- [ ] Imports 队列能处理批量导入
- [ ] Reports 队列能生成 PDF
- [ ] Search indexing 队列能维护索引
- [ ] 错误处理和重试机制
