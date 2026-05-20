# P0-3：支付集成（Airpay）

| 字段 | 值 |
|------|------|
| 编号 | P0-3 |
| 优先级 | P0 — 核心功能 |
| 预估工时 | 3h |

## 背景

Standard/Premium 会员需要付费，使用 Airpay 作为支付网关（月费率 1.5%，低于 Stripe 的 3%）。Basic 免费跳过支付。

## 目标

1. 会员申请通过后，Standard/Premium 触发支付流程
2. 支付成功后激活会员资格
3. Basic 跳过支付直接激活

## 涉及文件

1. **新建** `apps/api/src/modules/payment/routes.ts` — 支付 API
2. **新建** `apps/api/src/modules/payment/airpay.ts` — Airpay SDK
3. **新建** `apps/web/app/membership/pay/page.tsx` — 支付页面
4. **已有** `packages/db/src/schema.ts` — `memberships` 表
5. **待新建** `payments` 表

## API 端点设计

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/payment/create` | POST | 创建支付订单 |
| `/api/payment/callback` | POST | Airpay 回调 |
| `/api/payment/status` | GET | 查询支付状态 |

## 流程

```
会员申请通过 → 创建支付订单 → 跳转 Airpay 支付页 → 支付完成 → 回调确认 → 激活会员
```

## 实现要点

- Airpay 创建订单时传入金额、会员 planId、applicationId
- 回调需要验证签名防止伪造
- 支付完成后更新 `memberships` 状态为 `active`
- 失败场景：超时、用户取消、支付失败
- 幂等性：回调可能重复，需要去重

## 验收标准

- [ ] Standard/Premium 申请通过后创建支付订单
- [ ] 跳转 Airpay 支付页面
- [ ] 支付成功后回调处理
- [ ] 会员资格正确激活
- [ ] Basic 跳过支付直接激活
- [ ] 支付失败有明确提示
