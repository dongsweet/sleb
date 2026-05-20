# P5-6：部署配置

| 字段 | 值 |
|------|------|
| 编号 | P5-6 |
| 优先级 | P5 — 部署 |
| 预估工时 | 4h |

## 目标

配置生产环境的部署方案。

## 涉及文件

1. **新建** `deploy/` — 部署配置目录
2. **新建** `deploy/docker-compose.prod.yml` — 生产环境编排
3. **新建** `deploy/nginx.conf` — Nginx 反向代理配置
4. **新建** `.env.example` — 生产环境变量模板

## 部署架构

```
                    ┌──────────┐
  用户请求 ────────→ │  Nginx   │  (负载均衡、SSL、静态文件)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ↓          ↓          ↓
          ┌────────┐ ┌────────┐ ┌────────┐
          │  Web   │ │  API   │ │ MinIO  │
          │ :3000  │ │ :4000  │ │ :9000  │
          └────────┘ └────────┘ └────────┘
              │          │
              ↓          ↓
          ┌────────────────────────┐
          │   Valkey :6379         │
          │   PostgreSQL :5432     │
          └────────────────────────┘
```

## Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name sleb.bca.gov.sg;

    location / { proxy_pass http://web:3000; }
    location /api { proxy_pass http://api:4000; }
    location /minio { proxy_pass http://minio:9000; }
}
```

## 环境变量清单

```
DATABASE_URL=postgresql://...
VALKEY_URL=valkey://...
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
AIRPAY_MERCHANT_ID=...
AIRPAY_SECRET_KEY=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
JWT_SECRET=...
```

## 验收标准

- [ ] Docker Compose 生产配置可用
- [ ] Nginx 反向代理正常
- [ ] SSL 证书配置（Let's Encrypt）
- [ ] 环境变量完整
