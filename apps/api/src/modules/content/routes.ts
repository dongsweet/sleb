import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  aiSuggestionInputSchema,
  contentItemInputSchema,
  contentStatusLabels,
  contentStatusSchema,
  contentTypeConfigs,
  contentTypeSchema,
  type AiSuggestion,
  type ContentStatus,
  type ContentWorkflowEvent
} from '@sleb/shared/content';
import { z } from 'zod';
import { loadEnv } from '../../config/env.js';
import {
  canPublish,
  canSetStatus,
  canWriteContentType,
  contentRoles,
  getContentActor,
  requireContentRole,
  type ContentActor
} from './auth.js';
import { createContentRepository } from './repository.js';

const listQuerySchema = z.object({
  type: contentTypeSchema.optional(),
  status: contentStatusSchema.optional(),
  search: z.string().trim().optional()
});

const idParamsSchema = z.object({
  id: z.string().trim().min(1)
});

const patchContentItemSchema = contentItemInputSchema.partial();
const mediaUploadSchema = z.object({
  filename: z.string().trim().min(1).max(320),
  mimeType: z.enum([
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp'
  ]),
  data: z.string().min(8),
  altText: z.string().trim().max(500).optional(),
  caption: z.string().trim().max(1000).optional()
});

export async function registerContentRoutes(app: FastifyInstance) {
  const env = loadEnv();
  const repository = await createContentRepository({
    databaseUrl: env.DATABASE_URL,
    logger: app.log,
    media: {
      endPoint: env.MINIO_ENDPOINT,
      port: env.MINIO_PORT,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
      bucket: env.MINIO_BUCKET,
      useSSL: env.MINIO_USE_SSL
    }
  });

  app.addHook('onClose', async () => {
    await repository.close();
  });

  app.get('/content/config', async () => ({
    types: contentTypeConfigs,
    statuses: contentStatusLabels,
    roles: contentRoles
  }));

  app.get('/content/items', async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const actor = getContentActor(request);

    if (!actor && query.status !== 'published') {
      return reply.code(401).send({
        error: 'Content role is required to read unpublished content'
      });
    }

    return repository.listItems(query);
  });

  app.post('/content/items', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    const input = contentItemInputSchema.parse(request.body);
    const guard = guardContentWrite(reply, actor, input.type, input.status);

    if (!guard) {
      return;
    }

    try {
      return reply
        .code(201)
        .send(await repository.createItem(input, actor.name));
    } catch (error) {
      if (isUniqueViolation(error)) {
        return reply.code(409).send({
          error: 'A content item with this type and slug already exists'
        });
      }

      throw error;
    }
  });

  app.get('/content/items/:id', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    const { id } = idParamsSchema.parse(request.params);
    const detail = await repository.getItem(id);

    if (!detail) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return detail;
  });

  app.patch('/content/items/:id', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    const { id } = idParamsSchema.parse(request.params);
    const input = patchContentItemSchema.parse(request.body);
    const existing = await repository.getItem(id);

    if (!existing) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    const guard = guardContentWrite(
      reply,
      actor,
      input.type ?? existing.item.type,
      input.status ?? existing.item.status
    );

    if (!guard) {
      return;
    }

    try {
      const detail = await repository.updateItem(id, input, actor.name);

      if (!detail) {
        return reply.code(404).send({ error: 'Content item not found' });
      }

      return detail;
    } catch (error) {
      if (isUniqueViolation(error)) {
        return reply.code(409).send({
          error: 'A content item with this type and slug already exists'
        });
      }

      throw error;
    }
  });

  app.post('/content/items/:id/submit', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    const access = await guardWorkflowAccess(
      reply,
      actor,
      idParamsSchema.parse(request.params).id
    );

    if (!access) {
      return;
    }

    const result = await changeWorkflowStatus(
      request.params,
      'in_review',
      'submitted',
      'Submitted for review',
      actor.name
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/publish', async (request, reply) => {
    const actor = requireContentRole(request, reply, 'content_publisher');

    if (!actor) {
      return;
    }

    const access = await guardWorkflowAccess(
      reply,
      actor,
      idParamsSchema.parse(request.params).id
    );

    if (!access) {
      return;
    }

    const result = await changeWorkflowStatus(
      request.params,
      'published',
      'published',
      'Published',
      actor.name
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/unpublish', async (request, reply) => {
    const actor = requireContentRole(request, reply, 'content_publisher');

    if (!actor) {
      return;
    }

    const access = await guardWorkflowAccess(
      reply,
      actor,
      idParamsSchema.parse(request.params).id
    );

    if (!access) {
      return;
    }

    const result = await changeWorkflowStatus(
      request.params,
      'draft',
      'unpublished',
      'Unpublished to draft',
      actor.name
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/ai/suggestions', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    const input = aiSuggestionInputSchema.parse(request.body);
    const suggestion = await repository.createSuggestion({
      itemId: input.itemId,
      kind: input.kind,
      input: input.input,
      output: buildAiPlaceholderOutput(input.kind, input.input),
      actorName: actor.name
    });

    return reply.code(201).send({ suggestion });
  });

  app.get('/content/media', async (request, reply) => {
    const actor = requireContentRole(request, reply);

    if (!actor) {
      return;
    }

    return {
      assets: await repository.listMediaAssets()
    };
  });

  app.post(
    '/content/media',
    {
      bodyLimit: 8 * 1024 * 1024
    },
    async (request, reply) => {
      const actor = requireContentRole(request, reply);

      if (!actor) {
        return;
      }

      const input = mediaUploadSchema.parse(request.body);

      try {
        const asset = await repository.createMediaAsset({
          ...input,
          actorName: actor.name
        });

        return reply.code(201).send({ asset });
      } catch (error) {
        return reply.code(400).send({
          error: error instanceof Error ? error.message : 'Media upload failed'
        });
      }
    }
  );

  app.get('/content/media/:id/file', async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const file = await repository.getMediaFile(id);

    if (!file) {
      return reply.code(404).send({ error: 'Media asset not found' });
    }

    return reply
      .type(file.asset.mimeType)
      .header('cache-control', 'public, max-age=31536000, immutable')
      .send(file.stream);
  });

  app.delete('/content/media/:id', async (request, reply) => {
    const actor = requireContentRole(request, reply, 'platform_admin');

    if (!actor) {
      return;
    }

    const { id } = idParamsSchema.parse(request.params);
    const deleted = await repository.deleteMediaAsset(id);

    if (!deleted) {
      return reply.code(404).send({ error: 'Media asset not found' });
    }

    return { ok: true };
  });

  function changeWorkflowStatus(
    params: unknown,
    status: ContentStatus,
    action: ContentWorkflowEvent['action'],
    note: string,
    actorName: string
  ) {
    const { id } = idParamsSchema.parse(params);
    return repository.changeStatus(id, status, action, note, actorName);
  }

  async function guardWorkflowAccess(
    reply: FastifyReply,
    actor: ContentActor,
    id: string
  ) {
    const detail = await repository.getItem(id);

    if (!detail) {
      reply.code(404).send({ error: 'Content item not found' });
      return false;
    }

    if (!canWriteContentType(actor, detail.item.type)) {
      reply.code(403).send({
        error: 'Platform Admin permission is required for policy content'
      });
      return false;
    }

    return true;
  }
}

function guardContentWrite(
  reply: FastifyReply,
  actor: ContentActor,
  type: string,
  status: string | undefined
) {
  if (!canWriteContentType(actor, type)) {
    reply.code(403).send({
      error: 'Platform Admin permission is required for policy content'
    });
    return false;
  }

  if (!canSetStatus(actor, status)) {
    reply.code(403).send({
      error: 'Content Publisher permission is required to publish content'
    });
    return false;
  }

  if (status === 'archived' && !canPublish(actor)) {
    reply.code(403).send({
      error: 'Content Publisher permission is required to archive content'
    });
    return false;
  }

  return true;
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

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'
  );
}
