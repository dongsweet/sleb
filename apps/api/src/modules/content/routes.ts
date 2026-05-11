import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import {
  aiSuggestionInputSchema,
  contentItemInputSchema,
  contentStatusLabels,
  contentStatusSchema,
  contentTypeConfigs,
  contentTypeSchema,
  seedContentItems,
  type AiSuggestion,
  type ContentItem,
  type ContentStatus,
  type ContentType,
  type ContentUpsertInput,
  type ContentVersion,
  type ContentWorkflowEvent
} from '@sleb/shared/content';
import { z } from 'zod';

const listQuerySchema = z.object({
  type: contentTypeSchema.optional(),
  status: contentStatusSchema.optional(),
  search: z.string().trim().optional()
});

const idParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const patchContentItemSchema = contentItemInputSchema.partial();

const items = new Map<string, ContentItem>(
  seedContentItems.map((item) => [item.id, structuredClone(item)])
);
const versions = new Map<string, ContentVersion[]>();
const workflowEvents = new Map<string, ContentWorkflowEvent[]>();
const suggestions = new Map<string, AiSuggestion>();

for (const item of items.values()) {
  appendVersion(item, 'Initial import');
  appendWorkflowEvent(item.id, item.status === 'published' ? 'published' : 'created', 'Seed import');
}

export async function registerContentRoutes(app: FastifyInstance) {
  app.get('/content/config', async () => ({
    types: contentTypeConfigs,
    statuses: contentStatusLabels
  }));

  app.get('/content/items', async (request) => {
    const query = listQuerySchema.parse(request.query);
    const searchTerm = query.search?.toLowerCase();
    const records = [...items.values()]
      .filter((item) => !query.type || item.type === query.type)
      .filter((item) => !query.status || item.status === query.status)
      .filter((item) => {
        if (!searchTerm) {
          return true;
        }

        return [item.title, item.summary, item.body, item.slug]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm);
      })
      .sort(compareContentItems);

    return {
      items: records,
      counts: getStatusCounts(records)
    };
  });

  app.post('/content/items', async (request, reply) => {
    const input = contentItemInputSchema.parse(request.body);
    const item = createContentItem(input);
    items.set(item.id, item);
    appendVersion(item, 'Created');
    appendWorkflowEvent(item.id, 'created', 'Created from Content Desk');

    return reply.code(201).send({
      item,
      versions: versions.get(item.id) ?? [],
      workflow: workflowEvents.get(item.id) ?? []
    });
  });

  app.get('/content/items/:id', async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const item = items.get(id);

    if (!item) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return {
      item,
      versions: versions.get(id) ?? [],
      workflow: workflowEvents.get(id) ?? []
    };
  });

  app.patch('/content/items/:id', async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const existing = items.get(id);

    if (!existing) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    const input = patchContentItemSchema.parse(request.body);
    const item = updateContentItem(existing, input);
    items.set(id, item);
    appendVersion(item, 'Updated');
    appendWorkflowEvent(item.id, 'updated', 'Edited from Content Desk');

    return {
      item,
      versions: versions.get(item.id) ?? [],
      workflow: workflowEvents.get(item.id) ?? []
    };
  });

  app.post('/content/items/:id/submit', async (request, reply) => {
    const result = changeWorkflowStatus(request.params, 'in_review', 'submitted', 'Submitted for review');

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/publish', async (request, reply) => {
    const result = changeWorkflowStatus(request.params, 'published', 'published', 'Published');

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/unpublish', async (request, reply) => {
    const result = changeWorkflowStatus(request.params, 'draft', 'unpublished', 'Unpublished to draft');

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/ai/suggestions', async (request, reply) => {
    const input = aiSuggestionInputSchema.parse(request.body);
    const suggestion: AiSuggestion = {
      id: randomUUID(),
      itemId: input.itemId,
      kind: input.kind,
      input: input.input,
      output: buildAiPlaceholderOutput(input.kind, input.input),
      status: 'draft',
      createdByName: 'AI Assist',
      createdAt: new Date().toISOString()
    };

    suggestions.set(suggestion.id, suggestion);

    return reply.code(201).send({ suggestion });
  });
}

function createContentItem(input: ContentUpsertInput): ContentItem {
  const now = new Date().toISOString();
  const status = input.status ?? 'draft';

  return {
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
    createdAt: now,
    updatedAt: now,
    submittedAt: status === 'in_review' ? now : undefined,
    publishedAt: status === 'published' ? now : undefined,
    scheduledFor: input.scheduledFor
  };
}

function updateContentItem(existing: ContentItem, input: Partial<ContentUpsertInput>): ContentItem {
  const now = new Date().toISOString();
  const status = input.status ?? existing.status;

  return {
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
    submittedAt: status === 'in_review' ? (existing.submittedAt ?? now) : existing.submittedAt,
    publishedAt: status === 'published' ? (existing.publishedAt ?? now) : existing.publishedAt,
    scheduledFor: input.scheduledFor ?? existing.scheduledFor
  };
}

function changeWorkflowStatus(
  params: unknown,
  status: ContentStatus,
  action: ContentWorkflowEvent['action'],
  note: string
) {
  const { id } = idParamsSchema.parse(params);
  const existing = items.get(id);

  if (!existing) {
    return undefined;
  }

  const now = new Date().toISOString();
  const item: ContentItem = {
    ...existing,
    status,
    reviewerName: status === 'published' ? 'Content Publisher' : existing.reviewerName,
    updatedAt: now,
    submittedAt: status === 'in_review' ? now : existing.submittedAt,
    publishedAt: status === 'published' ? now : existing.publishedAt
  };

  items.set(id, item);
  appendVersion(item, note);
  appendWorkflowEvent(id, action, note);

  return {
    item,
    versions: versions.get(id) ?? [],
    workflow: workflowEvents.get(id) ?? []
  };
}

function appendVersion(item: ContentItem, note: string) {
  const itemVersions = versions.get(item.id) ?? [];
  itemVersions.push({
    id: randomUUID(),
    itemId: item.id,
    versionNumber: itemVersions.length + 1,
    snapshot: structuredClone(item),
    createdByName: note,
    createdAt: new Date().toISOString()
  });
  versions.set(item.id, itemVersions);
}

function appendWorkflowEvent(
  itemId: string,
  action: ContentWorkflowEvent['action'],
  note: string
) {
  const events = workflowEvents.get(itemId) ?? [];
  events.push({
    id: randomUUID(),
    itemId,
    action,
    actorName: action === 'published' ? 'Content Publisher' : 'Content Author',
    note,
    createdAt: new Date().toISOString()
  });
  workflowEvents.set(itemId, events);
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

function compareContentItems(a: ContentItem, b: ContentItem) {
  const aDate = a.publishedAt ?? a.updatedAt;
  const bDate = b.publishedAt ?? b.updatedAt;
  return bDate.localeCompare(aDate);
}

function getStatusCounts(records: ContentItem[]) {
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

function buildAiPlaceholderOutput(kind: AiSuggestion['kind'], input: string) {
  const cleanInput = input.trim();

  if (kind === 'summarize') {
    return `Suggested summary: ${cleanInput.slice(0, 220)}${cleanInput.length > 220 ? '...' : ''}`;
  }

  if (kind === 'seo') {
    return `SEO title: ${cleanInput.slice(0, 62)}\nMeta description: ${cleanInput.slice(0, 155)}`;
  }

  if (kind === 'alt_text') {
    return `Alt text draft: A clear image connected to ${cleanInput.slice(0, 120)}.`;
  }

  if (kind === 'image_prompt') {
    return `Image prompt draft: Singapore green building scene, natural daylight, practical built environment context, showing ${cleanInput.slice(
      0,
      180
    )}.`;
  }

  return `${cleanInput}\n\nExpansion draft: Add context, stakeholder impact, eligibility or next steps, and a concise closing paragraph for publication review.`;
}
