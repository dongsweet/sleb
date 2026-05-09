import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'company_admin', 'reviewer', 'super_admin']);

export const membershipStatusEnum = pgEnum('membership_status', [
  'active',
  'application_in_review',
  'approved_awaiting_payment',
  'expired',
  'upgrade_in_review',
  'upgrade_approved_awaiting_payment',
  'cancelled'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected',
  'withdrawn'
]);

export const directoryTypeEnum = pgEnum('directory_type', [
  'building',
  'technology',
  'service',
  'term',
  'project'
]);

export const assessmentTypeEnum = pgEnum('assessment_type', ['theea', 'beea', 'smeea', 'ai_calculator']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: text('password_hash'),
    firstName: varchar('first_name', { length: 120 }),
    lastName: varchar('last_name', { length: 120 }),
    role: userRoleEnum('role').default('user').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email)
  })
);

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 240 }).notNull(),
    uen: varchar('uen', { length: 64 }),
    companyType: varchar('company_type', { length: 120 }),
    country: varchar('country', { length: 120 }),
    postalCode: varchar('postal_code', { length: 32 }),
    address: text('address'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    uenIdx: uniqueIndex('companies_uen_idx').on(table.uen)
  })
);

export const companyUsers = pgTable(
  'company_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    role: userRoleEnum('role').default('user').notNull(),
    isPrimaryContact: boolean('is_primary_contact').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    companyUserIdx: uniqueIndex('company_users_company_user_idx').on(table.companyId, table.userId)
  })
);

export const membershipPlans = pgTable('membership_plans', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  annualPriceCents: integer('annual_price_cents').default(0).notNull(),
  maxConnectedAccounts: integer('max_connected_accounts').notNull(),
  entitlements: jsonb('entitlements').default([]).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),
    planId: integer('plan_id')
      .references(() => membershipPlans.id)
      .notNull(),
    status: membershipStatusEnum('status').default('application_in_review').notNull(),
    startsOn: date('starts_on'),
    endsOn: date('ends_on'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    companyIdx: index('memberships_company_idx').on(table.companyId),
    statusIdx: index('memberships_status_idx').on(table.status)
  })
);

export const membershipApplications = pgTable(
  'membership_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id').references(() => companies.id),
    requestedPlanId: integer('requested_plan_id').references(() => membershipPlans.id),
    submittedByUserId: uuid('submitted_by_user_id').references(() => users.id),
    status: applicationStatusEnum('status').default('draft').notNull(),
    reviewerUserId: uuid('reviewer_user_id').references(() => users.id),
    rejectionReason: text('rejection_reason'),
    formData: jsonb('form_data').default({}).notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    statusIdx: index('membership_applications_status_idx').on(table.status)
  })
);

export const directoryEntries = pgTable(
  'directory_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: directoryTypeEnum('type').notNull(),
    ownerCompanyId: uuid('owner_company_id').references(() => companies.id),
    title: varchar('title', { length: 280 }).notNull(),
    slug: varchar('slug', { length: 320 }).notNull(),
    summary: text('summary'),
    content: jsonb('content').default({}).notNull(),
    searchText: text('search_text'),
    isPublished: boolean('is_published').default(false).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    slugIdx: uniqueIndex('directory_entries_slug_idx').on(table.slug),
    typeIdx: index('directory_entries_type_idx').on(table.type),
    ownerCompanyIdx: index('directory_entries_owner_company_idx').on(table.ownerCompanyId)
  })
);

export const assessmentRecords = pgTable(
  'assessment_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: assessmentTypeEnum('type').notNull(),
    userId: uuid('user_id').references(() => users.id),
    companyId: uuid('company_id').references(() => companies.id),
    directoryEntryId: uuid('directory_entry_id').references(() => directoryEntries.id),
    status: varchar('status', { length: 80 }).default('draft').notNull(),
    inputData: jsonb('input_data').default({}).notNull(),
    resultData: jsonb('result_data').default({}).notNull(),
    reportObjectKey: text('report_object_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    typeIdx: index('assessment_records_type_idx').on(table.type),
    companyIdx: index('assessment_records_company_idx').on(table.companyId)
  })
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: uuid('actor_user_id').references(() => users.id),
    entityType: varchar('entity_type', { length: 120 }).notNull(),
    entityId: uuid('entity_id'),
    action: varchar('action', { length: 80 }).notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    entityIdx: index('audit_logs_entity_idx').on(table.entityType, table.entityId),
    actorIdx: index('audit_logs_actor_idx').on(table.actorUserId)
  })
);
