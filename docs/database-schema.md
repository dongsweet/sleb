# 数据库 Schema 文档

> Drizzle ORM + PostgreSQL + PostGIS
> Schema 定义：`packages/db/src/schema.ts`

---

## 1. Enum 类型

### userRoleEnum
`admin | member | viewer`

### userStatusEnum
`active | suspended | pending_verification`

### companyTypeEnum
`developer | property_manager | consultant | equipment_supplier | service_provider | other`

### membershipStatusEnum
`application_in_review | approved_awaiting_payment | active | expired | upgrade_in_review | upgrade_approved_awaiting_payment`

### applicationStatusEnum
`draft | submitted | approved | rejected`

### directoryTypeEnum
`building | technology | service | term`

### contentTypeEnum
`news | event | grant | publication`

### contentStatusEnum
`draft | in_review | published | archived`

### aiSuggestionKindEnum
`summarize | seo | alt_text | image_prompt | expand`

### assessmentTypeEnum
`theea | beea | smeea | ai_calculator`

---

## 2. 数据表

### users

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default random | 用户 ID |
| email | varchar(320) | UNIQUE, NOT NULL | 邮箱 |
| passwordHash | varchar(600) | NOT NULL | bcrypt 密码哈希 |
| name | varchar(240) | NOT NULL | 姓名 |
| phone | varchar(60) | | 电话 |
| role | userRoleEnum | default 'viewer' | 角色 |
| status | userStatusEnum | default 'pending_verification' | 状态 |
| linkedinId | varchar(240) | | LinkedIn OAuth ID |
| emailVerified | boolean | default false | 邮箱是否已验证 |
| metadata | jsonb | default {} | 扩展字段 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `users_email_idx`

---

### companies

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 公司 ID |
| name | varchar(280) | NOT NULL | 公司名称 |
| uen | varchar(20) | UNIQUE | 商业注册号 |
| type | companyTypeEnum | NOT NULL | 公司类型 |
| country | varchar(80) | default 'Singapore' | 国家 |
| postalCode | varchar(20) | | 邮编 |
| address | text | | 地址 |
| contactName | varchar(240) | | 联系人 |
| contactEmail | varchar(320) | | 联系邮箱 |
| contactPhone | varchar(60) | | 联系电话 |
| metadata | jsonb | default {} | 扩展字段 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `companies_uen_idx`, `companies_type_idx`

---

### companyUsers

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 关联 ID |
| companyId | uuid | FK → companies, NOT NULL | 公司 |
| userId | uuid | FK → users, NOT NULL | 用户 |
| role | varchar(80) | default 'member' | 在公司中的角色 |
| isCompanyAdmin | boolean | default false | 是否公司管理员 |
| createdAt | timestamptz | NOT NULL | 创建时间 |

**索引：** `company_users_company_idx`, `company_users_user_idx`
**唯一：** `company_users_company_user_idx` (companyId, userId)

---

### membershipPlans

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | serial | PK | 计划 ID |
| name | varchar(80) | NOT NULL | 名称（Basic/Standard/Premium）|
| priceCents | integer | default 0 | 价格（分）|
| maxAssociatedAccounts | integer | default 5 | 最大关联账号数 |
| description | text | | 描述 |
| features | jsonb | default [] | 功能列表 |
| active | boolean | default true | 是否可用 |
| createdAt | timestamptz | NOT NULL | 创建时间 |

---

### memberships

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 会员记录 ID |
| companyId | uuid | FK → companies | 关联公司 |
| planId | integer | FK → membershipPlans | 会员等级 |
| status | membershipStatusEnum | NOT NULL | 状态 |
| startsOn | date | | 开始日期 |
| endsOn | date | | 到期日期 |
| metadata | jsonb | default {} | 扩展字段 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `memberships_company_idx`, `memberships_status_idx`

---

### membershipApplications

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 申请 ID |
| companyId | uuid | FK → companies | 申请公司 |
| requestedPlanId | integer | FK → membershipPlans | 申请等级 |
| submittedByUserId | uuid | FK → users | 提交人 |
| status | applicationStatusEnum | default 'draft' | 状态 |
| reviewerUserId | uuid | FK → users | 审核人 |
| rejectionReason | text | | 拒绝原因 |
| formData | jsonb | default {} | 申请表数据 |
| submittedAt | timestamptz | | 提交时间 |
| reviewedAt | timestamptz | | 审核时间 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `membership_applications_status_idx`

---

### directoryEntries

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 目录条目 ID |
| type | directoryTypeEnum | NOT NULL | 类型（building/technology/service/term）|
| ownerCompanyId | uuid | FK → companies | 所属公司 |
| title | varchar(280) | NOT NULL | 标题 |
| slug | varchar(320) | UNIQUE, NOT NULL | URL slug |
| summary | text | | 摘要 |
| content | jsonb | default {} | 结构化内容 |
| searchText | text | | 全文搜索字段 |
| isPublished | boolean | default false | 是否已发布 |
| publishedAt | timestamptz | | 发布时间 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `directory_entries_slug_idx` (unique), `directory_entries_type_idx`, `directory_entries_owner_company_idx`

---

### mediaAssets

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | text | PK | 媒体 ID |
| objectKey | text | UNIQUE, NOT NULL | MinIO 对象键 |
| filename | varchar(320) | NOT NULL | 文件名 |
| mimeType | varchar(160) | NOT NULL | MIME 类型 |
| sizeBytes | integer | default 0 | 文件大小 |
| altText | text | | 替代文本 |
| caption | text | | 说明文字 |
| metadata | jsonb | default {} | 扩展字段 |
| createdByName | varchar(240) | NOT NULL | 创建者名 |
| createdByUserId | uuid | FK → users | 创建者 ID |
| createdAt | timestamptz | NOT NULL | 创建时间 |

**索引：** `media_assets_object_key_idx` (unique), `media_assets_mime_type_idx`

---

### contentItems

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | text | PK | 内容 ID |
| type | contentTypeEnum | NOT NULL | 内容类型 |
| title | varchar(280) | NOT NULL | 标题 |
| slug | varchar(320) | NOT NULL | URL slug |
| summary | text | default '' | 摘要 |
| body | text | default '' | 正文 |
| status | contentStatusEnum | default 'draft' | 状态 |
| heroImageUrl | text | | 封面图 URL |
| metadata | jsonb | default {} | 扩展字段 |
| seo | jsonb | default {} | SEO 数据 |
| authorName | varchar(240) | NOT NULL | 作者名 |
| reviewerName | varchar(240) | | 审核人名 |
| authorUserId | uuid | FK → users | 作者 ID |
| reviewerUserId | uuid | FK → users | 审核人 ID |
| submittedAt | timestamptz | | 提交时间 |
| publishedAt | timestamptz | | 发布时间 |
| scheduledFor | timestamptz | | 定时发布 |
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `content_items_type_slug_idx` (unique), `content_items_type_status_idx`, `content_items_published_at_idx`

---

### contentVersions

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | text | PK | 版本 ID |
| itemId | text | FK → contentItems | 关联内容 |
| versionNumber | integer | NOT NULL | 版本号 |
| snapshot | jsonb | NOT NULL | 内容快照 |
| createdByName | varchar(240) | NOT NULL | 创建者名 |
| createdByUserId | uuid | FK → users | 创建者 ID |
| createdAt | timestamptz | NOT NULL | 创建时间 |

**唯一：** `content_versions_item_version_idx` (itemId, versionNumber)

---

### contentWorkflowEvents

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | text | PK | 事件 ID |
| itemId | text | FK → contentItems | 关联内容 |
| actorUserId | uuid | FK → users | 操作人 |
| action | varchar(80) | NOT NULL | 操作（created/updated/submitted/published/unpublished）|
| actorName | varchar(240) | NOT NULL | 操作人名 |
| note | text | | 备注 |
| createdAt | timestamptz | NOT NULL | 时间 |

**索引：** `content_workflow_events_item_created_idx`

---

### aiSuggestions

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | text | PK | 建议 ID |
| contentItemId | text | FK → contentItems | 关联内容 |
| kind | aiSuggestionKindEnum | NOT NULL | 类型 |
| input | text | NOT NULL | 输入 |
| output | text | NOT NULL | 输出 |
| status | varchar(80) | default 'draft' | 状态 |
| createdByName | varchar(240) | NOT NULL | 创建者 |
| createdByUserId | uuid | FK → users | 创建者 ID |
| createdAt | timestamptz | NOT NULL | 时间 |

---

### assessmentRecords

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 评估 ID |
| type | assessmentTypeEnum | NOT NULL | 评估类型 |
| userId | uuid | FK → users | 用户 |
| companyId | uuid | FK → companies | 公司 |
| directoryEntryId | uuid | FK → directoryEntries | 关联目录条目 |
| status | varchar(80) | default 'draft' | 状态 |
| inputData | jsonb | default {} | 输入数据 |
| resultData | jsonb | default {} | 结果数据 |
| reportObjectKey | text | | 报告文件（MinIO）|
| createdAt | timestamptz | NOT NULL | 创建时间 |
| updatedAt | timestamptz | NOT NULL | 更新时间 |

**索引：** `assessment_records_type_idx`, `assessment_records_company_idx`

---

### auditLogs

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | 日志 ID |
| actorUserId | uuid | FK → users | 操作人 |
| entityType | varchar(120) | NOT NULL | 实体类型 |
| entityId | uuid | 实体 ID |
| action | varchar(80) | NOT NULL | 操作 |
| before | jsonb | 变更前 |
| after | jsonb | 变更后 |
| createdAt | timestamptz | NOT NULL | 时间 |

**索引：** `audit_logs_entity_idx`, `audit_logs_actor_idx`

---

## 3. 关系图

```
users ───────────────┐
                     ├── companyUsers ─── companies ── memberships
                     │                           └── membershipApplications
                     │                               └── directoryEntries
                     │                                       └── assessmentRecords
                     ├── contentItems ─── contentVersions
                     │               └── contentWorkflowEvents
                     │               └── aiSuggestions
                     └── mediaAssets
                     
auditLogs ── users (actor)
```

---

## 4. 待添加的表

| 表名 | 用途 | 优先级 |
|------|------|--------|
| `payments` | 支付记录（Airpay）| P0 |
| `membership_entitlements` | 会员等级到功能权限的映射 | P0 |
| `member_buildings` | 会员关联的建筑数据 | P0 |
| `member_technologies` | 会员提交的技术/产品 | P1 |
| `member_services` | 会员提交的服务 | P1 |
| `green_finance_loans` | 绿色贷款申请 | P5 |
| `projects` | R&D 项目 | P5 |
| `surveys` | 调查问卷 | P5 |
