import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Readable } from 'node:stream';
import type { FastifyBaseLogger } from 'fastify';
import { Client as MinioClient } from 'minio';
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
  type ContentWorkflowEvent,
  type MediaAsset
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

type MediaUploadInput = {
  filename: string;
  mimeType: string;
  data: string;
  altText?: string;
  caption?: string;
  actorName: string;
};

type MediaFile = {
  asset: MediaAsset;
  stream: Readable;
};

type ContentRepository = {
  listItems(query: ContentListQuery): Promise<{
    items: ContentItem[];
    counts: Record<ContentStatus, number>;
  }>;
  getItem(id: string): Promise<ContentDetail | undefined>;
  createItem(
    input: ContentUpsertInput,
    actorName: string
  ): Promise<ContentDetail>;
  updateItem(
    id: string,
    input: Partial<ContentUpsertInput>,
    actorName: string
  ): Promise<ContentDetail | undefined>;
  changeStatus(
    id: string,
    status: ContentStatus,
    action: ContentWorkflowEvent['action'],
    note: string,
    actorName: string
  ): Promise<ContentDetail | undefined>;
  createSuggestion(input: {
    itemId?: string;
    kind: AiSuggestionKind;
    input: string;
    output: string;
    actorName: string;
  }): Promise<AiSuggestion>;
  listMediaAssets(): Promise<MediaAsset[]>;
  createMediaAsset(input: MediaUploadInput): Promise<MediaAsset>;
  getMediaFile(id: string): Promise<MediaFile | undefined>;
  deleteMediaAsset(id: string): Promise<boolean>;
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

type DbMediaAssetRow = {
  id: string;
  object_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  caption: string | null;
  metadata: Record<string, string> | null;
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
  media: {
    endPoint: string;
    port: number;
    accessKey: string;
    secretKey: string;
    bucket: string;
    useSSL: boolean;
  };
}): Promise<ContentRepository> {
  const pool = new Pool({
    connectionString: options.databaseUrl,
    max: 10
  });
  const minio = new MinioClient({
    endPoint: options.media.endPoint,
    port: options.media.port,
    useSSL: options.media.useSSL,
    accessKey: options.media.accessKey,
    secretKey: options.media.secretKey
  });

  await ensureContentSchema(pool);
  await ensureMediaBucket(minio, options.media.bucket, options.logger);
  await seedContent(pool, options.logger);

  return new PgContentRepository(pool, minio, options.media.bucket);
}

class PgContentRepository implements ContentRepository {
  constructor(
    private readonly pool: pg.Pool,
    private readonly minio: MinioClient,
    private readonly mediaBucket: string
  ) {}

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

  async createItem(input: ContentUpsertInput, actorName: string) {
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
      authorName: actorName,
      reviewerName: status === 'published' ? actorName : undefined,
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
      await appendVersion(client, item, actorName);
      await appendWorkflowEvent(
        client,
        item.id,
        'created',
        'Created from Content Desk',
        actorName
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

  async updateItem(
    id: string,
    input: Partial<ContentUpsertInput>,
    actorName: string
  ) {
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
      reviewerName: status === 'published' ? actorName : existing.reviewerName,
      scheduledFor: input.scheduledFor ?? existing.scheduledFor
    };

    const client = await this.pool.connect();

    try {
      await client.query('begin');
      await updateContentItem(client, item);
      await appendVersion(client, item, actorName);
      await appendWorkflowEvent(
        client,
        item.id,
        'updated',
        'Edited from Content Desk',
        actorName
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
    note: string,
    actorName: string
  ) {
    const existing = await this.getContentItem(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();
    const item: ContentItem = {
      ...existing,
      status,
      reviewerName: status === 'published' ? actorName : existing.reviewerName,
      updatedAt: now,
      submittedAt: status === 'in_review' ? now : existing.submittedAt,
      publishedAt: status === 'published' ? now : existing.publishedAt
    };

    const client = await this.pool.connect();

    try {
      await client.query('begin');
      await updateContentItem(client, item);
      await appendVersion(client, item, actorName);
      await appendWorkflowEvent(client, id, action, note, actorName);
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
    actorName: string;
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
        values ($1, $2, $3, $4, $5, 'draft', $6, now())
        returning *
      `,
      [
        randomUUID(),
        input.itemId ?? null,
        input.kind,
        input.input,
        input.output,
        input.actorName
      ]
    );

    return toAiSuggestion(result.rows[0]);
  }

  async listMediaAssets() {
    const result = await this.pool.query<DbMediaAssetRow>(
      `
        select *
        from media_assets
        order by created_at desc
      `
    );
    return result.rows.map(toMediaAsset);
  }

  async createMediaAsset(input: MediaUploadInput) {
    const buffer = decodeMediaData(input.data, input.mimeType);
    const id = randomUUID();
    const objectKey = `content/${new Date().getUTCFullYear()}/${id}${getSafeExtension(
      input.filename,
      input.mimeType
    )}`;

    await this.minio.putObject(
      this.mediaBucket,
      objectKey,
      buffer,
      buffer.length,
      {
        'Content-Type': input.mimeType
      }
    );

    const result = await this.pool.query<DbMediaAssetRow>(
      `
        insert into media_assets (
          id,
          object_key,
          filename,
          mime_type,
          size_bytes,
          alt_text,
          caption,
          metadata,
          created_by_name,
          created_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, '{}'::jsonb, $8, now())
        returning *
      `,
      [
        id,
        objectKey,
        input.filename,
        input.mimeType,
        buffer.length,
        input.altText ?? null,
        input.caption ?? null,
        input.actorName
      ]
    );

    return toMediaAsset(result.rows[0]);
  }

  async getMediaFile(id: string) {
    const result = await this.pool.query<DbMediaAssetRow>(
      'select * from media_assets where id = $1',
      [id]
    );
    const row = result.rows[0];

    if (!row) {
      return undefined;
    }

    return {
      asset: toMediaAsset(row),
      stream: await this.minio.getObject(this.mediaBucket, row.object_key)
    };
  }

  async deleteMediaAsset(id: string) {
    const client = await this.pool.connect();

    try {
      await client.query('begin');
      const result = await client.query<DbMediaAssetRow>(
        'delete from media_assets where id = $1 returning *',
        [id]
      );
      const row = result.rows[0];

      if (!row) {
        await client.query('rollback');
        return false;
      }

      await this.minio.removeObject(this.mediaBucket, row.object_key);
      await client.query('commit');
      return true;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
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

    create table if not exists media_assets (
      id text primary key,
      object_key text not null,
      filename varchar(320) not null,
      mime_type varchar(160) not null,
      size_bytes integer not null default 0,
      alt_text text,
      caption text,
      metadata jsonb not null default '{}',
      created_by_name varchar(240) not null default 'Content Author',
      created_at timestamptz not null default now()
    );

    alter table media_assets add column if not exists created_by_name varchar(240) not null default 'Content Author';
    create unique index if not exists media_assets_object_key_idx on media_assets (object_key);
    create index if not exists media_assets_mime_type_idx on media_assets (mime_type);

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
        'Seed import',
        item.status === 'published'
          ? (item.reviewerName ?? 'Content Publisher')
          : item.authorName
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
  actorName: string
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
    [randomUUID(), item.id, versionNumber, JSON.stringify(item), actorName]
  );
}

async function appendWorkflowEvent(
  client: pg.PoolClient,
  itemId: string,
  action: ContentWorkflowEvent['action'],
  note: string,
  actorName: string
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
    [randomUUID(), itemId, action, actorName, note]
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

function toMediaAsset(row: DbMediaAssetRow): MediaAsset {
  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    url: `/api/content/media/${row.id}/file`,
    altText: row.alt_text ?? undefined,
    caption: row.caption ?? undefined,
    createdByName: row.created_by_name ?? 'Content Author',
    createdAt: toIsoString(row.created_at)
  };
}

async function ensureMediaBucket(
  minio: MinioClient,
  bucket: string,
  logger: FastifyBaseLogger
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const exists = await minio.bucketExists(bucket);

      if (!exists) {
        await minio.makeBucket(bucket);
        logger.info({ bucket }, 'Created media bucket');
      }

      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }

  throw lastError;
}

function decodeMediaData(data: string, mimeType: string) {
  const dataUrlPrefix = `data:${mimeType};base64,`;
  const base64 = data.startsWith(dataUrlPrefix)
    ? data.slice(dataUrlPrefix.length)
    : data;
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.byteLength === 0) {
    throw new Error('Uploaded media is empty');
  }

  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error('Uploaded media exceeds 5 MB');
  }

  return buffer;
}

function getSafeExtension(filename: string, mimeType: string) {
  const fromName = extname(filename).toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(fromName)) {
    return fromName;
  }

  const byMime: Record<string, string> = {
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg+xml': '.svg',
    'image/webp': '.webp'
  };

  return byMime[mimeType] ?? '';
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
