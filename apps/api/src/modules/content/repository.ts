import { randomUUID } from 'node:crypto';
import type { FastifyBaseLogger } from 'fastify';
import pg from 'pg';
import {
  seedContentItems,
  type AiSuggestion,
  type AiSuggestionKind,
  type ContentItem,
  type ContentStatus,
  type ContentType,
  type ContentUpsertInput,
  type ContentVersion,
  type ContentWorkflowEvent
} from '@sleb/shared/content';

const { Pool } = pg;

type ContentListQuery = {
  type?: ContentType;
  status?: ContentStatus;
  search?: string;
};

type ContentDetail = {
  item: ContentItem;
  versions: ContentVersion[];
  workflow: ContentWorkflowEvent[];
};

type ContentRepository = {
  listItems(query: ContentListQuery): Promise<{
    items: ContentItem[];
    counts: Record<ContentStatus, number>;
  }>;
  getItem(id: string): Promise<ContentDetail | undefined>;
  createItem(input: ContentUpsertInput): Promise<ContentDetail>;
  updateItem(
    id: string,
    input: Partial<ContentUpsertInput>
  ): Promise<ContentDetail | undefined>;
  changeStatus(
    id: string,
    status: ContentStatus,
    action: ContentWorkflowEvent['action'],
    note: string
  ): Promise<ContentDetail | undefined>;
  createSuggestion(input: {
    itemId?: string;
    kind: AiSuggestionKind;
    input: string;
    output: string;
  }): Promise<AiSuggestion>;
  close(): Promise<void>;
};

type DbContentRow = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  status: ContentStatus;
  hero_image_url: string | null;
  metadata: Record<string, string> | null;
  seo: { title?: string; description?: string } | null;
  author_name: string | null;
  reviewer_name: string | null;
  submitted_at: Date | string | null;
  published_at: Date | string | null;
  scheduled_for: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type DbVersionRow = {
  id: string;
  item_id: string;
  version_number: number;
  snapshot: ContentItem;
  created_by_name: string | null;
  created_at: Date | string;
};

type DbWorkflowRow = {
  id: string;
  item_id: string;
  action: ContentWorkflowEvent['action'];
  actor_name: string | null;
  note: string | null;
  created_at: Date | string;
};

type DbSuggestionRow = {
  id: string;
  content_item_id: string | null;
  kind: AiSuggestionKind;
  input: string;
  output: string;
  status: AiSuggestion['status'];
  created_by_name: string | null;
  created_at: Date | string;
};

const contentStatuses: ContentStatus[] = [
  'draft',
  'in_review',
  'published',
  'scheduled',
  'archived'
];

export async function createContentRepository(options: {
  databaseUrl: string;
  logger: FastifyBaseLogger;
}): Promise<ContentRepository> {
  const pool = new Pool({
    connectionString: options.databaseUrl,
    max: 10
  });

  await ensureContentSchema(pool);
  await seedContent(pool, options.logger);

  return new PgContentRepository(pool);
}

class PgContentRepository implements ContentRepository {
  constructor(private readonly pool: pg.Pool) {}

  async listItems(query: ContentListQuery) {
    const values: unknown[] = [];
    const where: string[] = [];

    if (query.type) {
      values.push(query.type);
      where.push(`type = $${values.length}`);
    }

    if (query.status) {
      values.push(query.status);
      where.push(`status = $${values.length}`);
    }

    if (query.search) {
      values.push(`%${query.search.toLowerCase()}%`);
      where.push(
        `(lower(title) like $${values.length} or lower(coalesce(summary, '')) like $${values.length} or lower(body) like $${values.length} or lower(slug) like $${values.length})`
      );
    }

    const whereSql = where.length > 0 ? `where ${where.join(' and ')}` : '';
    const result = await this.pool.query<DbContentRow>(
      `
        select *
        from content_items
        ${whereSql}
        order by coalesce(published_at, updated_at) desc, updated_at desc
      `,
      values
    );
    const items = result.rows.map(toContentItem);

    return {
      items,
      counts: countItems(items)
    };
  }

  async getItem(id: string) {
    const item = await this.getContentItem(id);

    if (!item) {
      return undefined;
    }

    return {
      item,
      versions: await this.getVersions(id),
      workflow: await this.getWorkflow(id)
    };
  }

  async createItem(input: ContentUpsertInput) {
    const now = new Date();
    const status = input.status ?? 'draft';
    const item: ContentItem = {
      id: randomUUID(),
      type: input.type,
      title: input.title,
      slug: normalizeSlug(input.slug || input.title),
      summary: input.summary ?? '',
      body: input.body ?? '',
      status,
      heroImage: input.heroImage,
      metadata: input.metadata ?? {},
      seo: input.seo ?? {},
      authorName: 'Content Author',
      reviewerName: status === 'published' ? 'Content Publisher' : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      submittedAt: status === 'in_review' ? now.toISOString() : undefined,
      publishedAt: status === 'published' ? now.toISOString() : undefined,
      scheduledFor: input.scheduledFor
    };

    const client = await this.pool.connect();

    try {
      await client.query('begin');
      await insertContentItem(client, item);
      await appendVersion(client, item, 'Created');
      await appendWorkflowEvent(
        client,
        item.id,
        'created',
        'Created from Content Desk'
      );
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return this.requireDetail(item.id);
  }

  async updateItem(id: string, input: Partial<ContentUpsertInput>) {
    const existing = await this.getContentItem(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const status = input.status ?? existing.status;
    const item: ContentItem = {
      ...existing,
      type: input.type ?? existing.type,
      title: input.title ?? existing.title,
      slug: input.slug ? normalizeSlug(input.slug) : existing.slug,
      summary: input.summary ?? existing.summary,
      body: input.body ?? existing.body,
      status,
      heroImage: input.heroImage ?? existing.heroImage,
      metadata: input.metadata ?? existing.metadata,
      seo: input.seo ?? existing.seo,
      updatedAt: now,
      submittedAt:
        status === 'in_review'
          ? (existing.submittedAt ?? now)
          : existing.submittedAt,
      publishedAt:
        status === 'published'
          ? (existing.publishedAt ?? now)
          : existing.publishedAt,
      scheduledFor: input.scheduledFor ?? existing.scheduledFor
    };

    const client = await this.pool.connect();

    try {
      await client.query('begin');
      await updateContentItem(client, item);
      await appendVersion(client, item, 'Updated');
      await appendWorkflowEvent(
        client,
        item.id,
        'updated',
        'Edited from Content Desk'
      );
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return this.requireDetail(id);
  }

  async changeStatus(
    id: string,
    status: ContentStatus,
    action: ContentWorkflowEvent['action'],
    note: string
  ) {
    const existing = await this.getContentItem(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const item: ContentItem = {
      ...existing,
      status,
      reviewerName:
        status === 'published' ? 'Content Publisher' : existing.reviewerName,
      updatedAt: now,
      submittedAt: status === 'in_review' ? now : existing.submittedAt,
      publishedAt: status === 'published' ? now : existing.publishedAt
    };

    const client = await this.pool.connect();

    try {
      await client.query('begin');
      await updateContentItem(client, item);
      await appendVersion(client, item, note);
      await appendWorkflowEvent(client, id, action, note);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }

    return this.requireDetail(id);
  }

  async createSuggestion(input: {
    itemId?: string;
    kind: AiSuggestionKind;
    input: string;
    output: string;
  }) {
    const result = await this.pool.query<DbSuggestionRow>(
      `
        insert into ai_suggestions (
          id,
          content_item_id,
          kind,
          input,
          output,
          status,
          created_by_name,
          created_at
        )
        values ($1, $2, $3, $4, $5, 'draft', 'AI Assist', now())
        returning *
      `,
      [
        randomUUID(),
        input.itemId ?? null,
        input.kind,
        input.input,
        input.output
      ]
    );

    return toAiSuggestion(result.rows[0]);
  }

  async close() {
    await this.pool.end();
  }

  private async getContentItem(id: string) {
    const result = await this.pool.query<DbContentRow>(
      'select * from content_items where id = $1',
      [id]
    );
    return result.rows[0] ? toContentItem(result.rows[0]) : undefined;
  }

  private async getVersions(itemId: string) {
    const result = await this.pool.query<DbVersionRow>(
      `
        select *
        from content_versions
        where item_id = $1
        order by version_number desc
      `,
      [itemId]
    );
    return result.rows.map(toContentVersion);
  }

  private async getWorkflow(itemId: string) {
    const result = await this.pool.query<DbWorkflowRow>(
      `
        select *
        from content_workflow_events
        where item_id = $1
        order by created_at desc
      `,
      [itemId]
    );
    return result.rows.map(toWorkflowEvent);
  }

  private async requireDetail(id: string) {
    const detail = await this.getItem(id);

    if (!detail) {
      throw new Error(`Content item ${id} disappeared after write`);
    }

    return detail;
  }
}

async function ensureContentSchema(pool: pg.Pool) {
  await pool.query(`
    do $$
    begin
      create type content_type as enum (
        'news',
        'event',
        'grant',
        'incentive',
        'publication',
        'static_page',
        'policy'
      );
    exception
      when duplicate_object then null;
    end $$;

    do $$
    begin
      create type content_status as enum (
        'draft',
        'in_review',
        'published',
        'scheduled',
        'archived'
      );
    exception
      when duplicate_object then null;
    end $$;

    do $$
    begin
      create type ai_suggestion_kind as enum (
        'expand',
        'summarize',
        'seo',
        'alt_text',
        'image_prompt'
      );
    exception
      when duplicate_object then null;
    end $$;

    create table if not exists content_items (
      id text primary key,
      type content_type not null,
      title varchar(280) not null,
      slug varchar(320) not null,
      summary text not null default '',
      body text not null default '',
      status content_status not null default 'draft',
      hero_image_url text,
      metadata jsonb not null default '{}',
      seo jsonb not null default '{}',
      author_name varchar(240) not null default 'Content Author',
      reviewer_name varchar(240),
      submitted_at timestamptz,
      published_at timestamptz,
      scheduled_for timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table content_items add column if not exists hero_image_url text;
    alter table content_items add column if not exists author_name varchar(240) not null default 'Content Author';
    alter table content_items add column if not exists reviewer_name varchar(240);

    create unique index if not exists content_items_type_slug_idx on content_items (type, slug);
    create index if not exists content_items_type_status_idx on content_items (type, status);
    create index if not exists content_items_published_at_idx on content_items (published_at);

    create table if not exists content_versions (
      id text primary key,
      item_id text not null references content_items(id) on delete cascade,
      version_number integer not null,
      snapshot jsonb not null,
      created_by_name varchar(240) not null default 'Content Author',
      created_at timestamptz not null default now()
    );

    alter table content_versions add column if not exists created_by_name varchar(240) not null default 'Content Author';
    create unique index if not exists content_versions_item_version_idx on content_versions (item_id, version_number);

    create table if not exists content_workflow_events (
      id text primary key,
      item_id text not null references content_items(id) on delete cascade,
      action varchar(80) not null,
      actor_name varchar(240) not null default 'Content Author',
      note text,
      created_at timestamptz not null default now()
    );

    alter table content_workflow_events add column if not exists actor_name varchar(240) not null default 'Content Author';
    create index if not exists content_workflow_events_item_created_idx on content_workflow_events (item_id, created_at);

    create table if not exists ai_suggestions (
      id text primary key,
      content_item_id text references content_items(id) on delete set null,
      kind ai_suggestion_kind not null,
      input text not null,
      output text not null,
      status varchar(80) not null default 'draft',
      created_by_name varchar(240) not null default 'AI Assist',
      created_at timestamptz not null default now()
    );

    alter table ai_suggestions add column if not exists created_by_name varchar(240) not null default 'AI Assist';
    create index if not exists ai_suggestions_content_item_idx on ai_suggestions (content_item_id);
  `);
}

async function seedContent(pool: pg.Pool, logger: FastifyBaseLogger) {
  const result = await pool.query<{ count: string }>(
    'select count(*) from content_items'
  );

  if (Number(result.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    for (const item of seedContentItems) {
      await insertContentItem(client, item);
      await appendVersion(client, item, 'Initial import');
      await appendWorkflowEvent(
        client,
        item.id,
        item.status === 'published' ? 'published' : 'created',
        'Seed import'
      );
    }

    await client.query('commit');
    logger.info({ count: seedContentItems.length }, 'Seeded content_items');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

async function insertContentItem(client: pg.PoolClient, item: ContentItem) {
  await client.query(
    `
      insert into content_items (
        id,
        type,
        title,
        slug,
        summary,
        body,
        status,
        hero_image_url,
        metadata,
        seo,
        author_name,
        reviewer_name,
        submitted_at,
        published_at,
        scheduled_for,
        created_at,
        updated_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15, $16, $17
      )
    `,
    [
      item.id,
      item.type,
      item.title,
      item.slug,
      item.summary,
      item.body,
      item.status,
      item.heroImage ?? null,
      JSON.stringify(item.metadata ?? {}),
      JSON.stringify(item.seo ?? {}),
      item.authorName,
      item.reviewerName ?? null,
      item.submittedAt ?? null,
      item.publishedAt ?? null,
      item.scheduledFor ?? null,
      item.createdAt,
      item.updatedAt
    ]
  );
}

async function updateContentItem(client: pg.PoolClient, item: ContentItem) {
  await client.query(
    `
      update content_items
      set
        type = $2,
        title = $3,
        slug = $4,
        summary = $5,
        body = $6,
        status = $7,
        hero_image_url = $8,
        metadata = $9::jsonb,
        seo = $10::jsonb,
        author_name = $11,
        reviewer_name = $12,
        submitted_at = $13,
        published_at = $14,
        scheduled_for = $15,
        updated_at = $16
      where id = $1
    `,
    [
      item.id,
      item.type,
      item.title,
      item.slug,
      item.summary,
      item.body,
      item.status,
      item.heroImage ?? null,
      JSON.stringify(item.metadata ?? {}),
      JSON.stringify(item.seo ?? {}),
      item.authorName,
      item.reviewerName ?? null,
      item.submittedAt ?? null,
      item.publishedAt ?? null,
      item.scheduledFor ?? null,
      item.updatedAt
    ]
  );
}

async function appendVersion(
  client: pg.PoolClient,
  item: ContentItem,
  note: string
) {
  const result = await client.query<{ version_number: number }>(
    `
      select coalesce(max(version_number), 0) + 1 as version_number
      from content_versions
      where item_id = $1
    `,
    [item.id]
  );
  const versionNumber = result.rows[0]?.version_number ?? 1;

  await client.query(
    `
      insert into content_versions (
        id,
        item_id,
        version_number,
        snapshot,
        created_by_name,
        created_at
      )
      values ($1, $2, $3, $4::jsonb, $5, now())
    `,
    [randomUUID(), item.id, versionNumber, JSON.stringify(item), note]
  );
}

async function appendWorkflowEvent(
  client: pg.PoolClient,
  itemId: string,
  action: ContentWorkflowEvent['action'],
  note: string
) {
  await client.query(
    `
      insert into content_workflow_events (
        id,
        item_id,
        action,
        actor_name,
        note,
        created_at
      )
      values ($1, $2, $3, $4, $5, now())
    `,
    [
      randomUUID(),
      itemId,
      action,
      action === 'published' ? 'Content Publisher' : 'Content Author',
      note
    ]
  );
}

function toContentItem(row: DbContentRow): ContentItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? '',
    body: row.body ?? '',
    status: row.status,
    heroImage: row.hero_image_url ?? undefined,
    metadata: row.metadata ?? {},
    seo: row.seo ?? {},
    authorName: row.author_name ?? 'Content Author',
    reviewerName: row.reviewer_name ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    submittedAt: toOptionalIsoString(row.submitted_at),
    publishedAt: toOptionalIsoString(row.published_at),
    scheduledFor: toOptionalIsoString(row.scheduled_for)
  };
}

function toContentVersion(row: DbVersionRow): ContentVersion {
  return {
    id: row.id,
    itemId: row.item_id,
    versionNumber: row.version_number,
    snapshot: row.snapshot,
    createdByName: row.created_by_name ?? 'Content Author',
    createdAt: toIsoString(row.created_at)
  };
}

function toWorkflowEvent(row: DbWorkflowRow): ContentWorkflowEvent {
  return {
    id: row.id,
    itemId: row.item_id,
    action: row.action,
    actorName: row.actor_name ?? 'Content Author',
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at)
  };
}

function toAiSuggestion(row: DbSuggestionRow): AiSuggestion {
  return {
    id: row.id,
    itemId: row.content_item_id ?? undefined,
    kind: row.kind,
    input: row.input,
    output: row.output,
    status: row.status,
    createdByName: row.created_by_name ?? 'AI Assist',
    createdAt: toIsoString(row.created_at)
  };
}

function toIsoString(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function toOptionalIsoString(value: Date | string | null) {
  return value ? toIsoString(value) : undefined;
}

function countItems(records: ContentItem[]) {
  return records.reduce(
    (counts, item) => {
      counts[item.status] += 1;
      return counts;
    },
    {
      draft: 0,
      in_review: 0,
      published: 0,
      scheduled: 0,
      archived: 0
    } satisfies Record<ContentStatus, number>
  );
}

function normalizeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 300);

  return slug || `content-${Date.now()}`;
}
