# SLEB 登录后会员逻辑补充分析

> 记录日期：2026-05-09  
> 范围说明：本补充只基于已经抓取到本地的 `/Membership` 页面和少量只读接口响应做业务逻辑梳理，用于后续重构评估。本文不保存 cookie、邮箱、姓名、用户 ID、密码字段值等敏感信息。

## 1. 本次确认到的登录后状态

这次登录态可以访问 `/Membership`，页面标题为 `Account Details - SLEB`，说明账号登录有效。

但当前账号不是正式 corporate membership 账号。`/Membership/GetUserMembership` 返回的会员对象只有：

- `IsMembership`
- `Msg`

其中 `IsMembership = false`，提示含义是当前用户没有关联会员公司或会员记录。因此这次看到的是“已登录普通用户”的会员入口，而不是完整会员公司工作台。

这对重构很重要：SLEB 至少有两层身份概念：

- 普通登录账号：可以登录、维护个人资料、申请/加入会员。
- Corporate Membership：公司级会员，决定是否能使用 My Building、My Technology、My Service、BEEA、SMEEA、AI Calculator 等会员功能。

## 2. 技术实现观察

`/Membership` 是一个 ASP.NET MVC 页面，页面内嵌 Vue 2 逻辑，并通过 Axios 调用后端接口。

页面共享了整站导航、登录弹窗、页脚等布局，所以即使已经登录，HTML 里仍然能看到登录表单模板：

- 登录表单：`POST /Account/AjaxLogin`
- 忘记密码：`/Account/ForgotPassword`
- 新用户注册：`/Account/Register`
- 个人资料：`/User/UserProperty`
- 修改密码：`/Account/ChangePassword`

会员页核心数据由前端启动时加载：

- `POST /Membership/GetUserMembership`
- `POST /Membership/GetALLServiceList`
- `POST /Membership/GetMembershipService`

如果 `Membership.IsMembership = true`，页面会继续加载会员关联资源：

- `POST /Membership/GetMembershipProject?membershipid=...`
- `POST /Membership/GetMembershipBuilding?membershipid=...`
- `POST /Membership/GetMembershipTechnology?membershipid=...`

## 3. 会员状态机

前端通过 `membershipStatus` 计算会员状态：

- `-1`：没有会员，显示加入会员的计划选择页。
- `0`：正常/有效会员，显示会员状态、到期日和功能入口。
- `1 + RegisterStatus = 0`：申请待审核，页面提示需要 2-3 天处理。
- `1 + RegisterStatus = 2`：申请被拒绝，显示重新申请入口。
- `2`：会员申请已批准但未付款，显示 `MAKE PAYMENT`。
- `3`：会员已过期，显示 `RENEW`。
- `4`：现有会员升级申请待处理，仍显示有效会员视图，并额外提示 `Upgrade Request Pending`。
- `5`：升级已批准但待付款，显示 `MAKE PAYMENT`。

这说明重构时不应只做一个简单的 `is_member` 布尔值，而应保留会员生命周期状态。

建议数据模型至少包含：

- `membership.status`
- `membership.register_status`
- `membership.level_id`
- `membership.company_name`
- `membership.start_date`
- `membership.end_date`
- `membership.payment_status`
- `membership.renewal_or_upgrade_state`

## 4. 会员等级和功能权限

页面内定义了三个会员等级：

| Level ID | 等级 | 页面展示价格 | 功能说明 |
| --- | --- | --- | --- |
| 1 | Basic | S$0.00 / year，原价 S$99 | 最多 5 个关联账号；AI Calculator、BEEA、SMEEA 自评工具；My Buildings |
| 2 | Standard | S$299 / year，原价 S$499 | Basic 之外，SMEEA 可下载报告；My Services |
| 3 | Premium | S$499 / year，原价 S$999 | Standard 之外，最多 20 个关联成员；My Technology |

前端的功能 gating 逻辑：

- Basic：禁用 `My Technology` 和 `My Service`。
- Standard：禁用 `My Technology`。
- Premium：开放全部会员功能入口。
- 未付款、过期、申请中等状态：功能卡片显示为禁用。
- 非会员账号：显示加入会员/功能不可用提示。

注意：这些前端禁用只适合 UI 展示。重构时必须在服务端 API 层再做权限判断。

## 5. 登录后可见功能入口

会员页中暴露出的主要功能入口包括：

- `My Building` -> `/Building/Retrofit`
- `My Technology` -> `/Technologies/TechnologiesList?type=my`
- `My Service` -> `/ServiceDirectory?type=my`
- `My BEEA` -> `/BEEA` 或 `/beea`
- `My SMEEA` -> `/SMEEA` 或 `/smeea`
- `My AI Calculator` -> `/AICalculator`
- `Payment` -> `/Membership/Pay?membershipid=...`
- `Renew` -> `/Membership/Plans?membershipId=...&renew=true`
- `Start Membership` -> `/Membership/Register?MembershipLevel=...`
- `Re-apply` -> `/Membership/Register?MembershipLevel=1`
- `Admin Console` -> `/Membership/Admin`

`Admin Console` 的前端显示条件是：

- 用户角色为 admin-like role
- 当前 membership 状态为有效状态

实际权限仍需以后用正式授权的后台账号或源码确认。

## 6. 接口和响应观察

本次只分析了已经返回到本地的响应，不继续扩大访问范围。

### `/Membership/GetUserMembership`

返回结构：

- `User`
- `Membership`

`User` 对象字段很多，包含个人资料、公司信息、账号状态、第三方登录 ID、邮箱验证字段等。观察到响应里也包含 `Password` 字段名，这对重构是一个需要特别注意的安全问题：新系统不应在普通资料接口里返回密码哈希或任何密码相关字段。

`Membership` 在当前账号下只返回非会员状态：

- `IsMembership = false`
- `Msg = membership or user is null`

### `/Membership/GetALLServiceList`

当前账号调用时返回 `500 Internal Server Error` 页面。

可能原因：

- 接口假设用户已有 membership，但页面在非会员状态下仍然无条件调用。
- 后端缺少空会员状态保护。
- 接口本身有老系统兼容问题。

重构时建议把这类“服务列表/权益列表”做成稳定的只读配置接口，不依赖当前用户是否已经成为会员。

### `/Membership/GetMembershipService`

当前账号返回失败对象：

- `Success = false`
- `ErrorCode = 10002`

结合前端逻辑，正式会员账号下它可能返回服务 key 数组，用来映射可用功能。

## 7. 建议重构的数据模型

基于这次登录后观察，会员模块建议拆成以下核心表/模型：

- `users`：登录账号、邮箱验证、账号状态、第三方登录绑定。
- `companies`：公司名称、UEN、公司类型、地址、联系人信息。
- `memberships`：公司级会员记录、等级、状态、开始/结束日期。
- `membership_applications`：申请、重新申请、拒绝原因、审核记录、附件。
- `membership_plans`：Basic / Standard / Premium 的价格、账号数量、权益。
- `membership_entitlements`：会员等级到功能权限的映射。
- `company_users`：公司和用户的关联关系、角色、是否管理员。
- `payments` 或 `invoices`：付款状态、续费、升级付款。
- `member_buildings`：会员公司维护的建筑数据。
- `member_technologies`：会员公司提交的技术/产品数据。
- `member_services`：会员公司提交的服务目录数据。
- `assessment_records`：BEEA、SMEEA、AI Calculator 等评估记录。

## 8. 建议重构的业务流程

可以按下面流程重建：

1. 用户注册普通账号。
2. 用户登录后访问 `/Membership`。
3. 如果没有 membership，显示会员计划和申请入口。
4. 用户选择计划，填写公司/申请资料并提交。
5. 后台审核申请。
6. 审核通过后进入待付款状态。
7. 付款完成后 membership 生效。
8. 会员按等级使用 My Building、My Service、My Technology、BEEA、SMEEA、AI Calculator。
9. 到期后进入续费流程。
10. 会员可发起升级申请，审核通过后补付款，完成等级升级。

## 9. 对工作量评估的影响

这次登录后分析没有推翻之前的总体判断，但让“第二期：会员和后台”的范围更清楚了。

如果只做基础会员：

- 普通账号注册/登录
- 公司会员申请
- Basic/Standard/Premium 计划
- 审核状态
- 付款状态
- 会员功能 gating

这部分可以作为 MVP 的一部分实现。

如果要做到和现站等价，还要继续确认：

- `/Membership/Register?MembershipLevel=...` 的完整表单和附件要求。
- `/Membership/Admin` 的后台审核流程。
- `/Membership/Pay` 的支付集成方式。
- My Building / My Technology / My Service 的提交、审核、发布逻辑。
- BEEA / SMEEA / AI Calculator 的计算规则和报告生成逻辑。

因此，之前“现代化 MVP 约 8-12 周，完整功能重建约 14-20 周以上”的判断仍然合理。会员系统如果要求包含后台审核、支付、公司成员管理、附件和邮件通知，建议单独预留 2-4 周工程量；如果还包括评估工具和报告生成，则需要进入高风险业务功能阶段单独估算。

## 10. 后续建议

为了继续做合法、低风险的逻辑重构，后续最好不要在聊天里传完整 cookie。更适合的方式是：

- 使用临时测试账号，不使用真实生产个人账号。
- 由浏览器手动截图/导出页面 HTML，再做离线分析。
- 如果客户授权，提供后台导出的接口文档、数据库结构或脱敏样例数据。
- 对支付、后台审批、修改资料、上传文件这类写入流程，只做页面和流程记录，不直接提交操作。

