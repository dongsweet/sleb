import type { FastifyInstance } from 'fastify';
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

export async function registerContentRoutes(app: FastifyInstance) {
  const env = loadEnv();
  const repository = await createContentRepository({
    databaseUrl: env.DATABASE_URL,
    logger: app.log
  });

  app.addHook('onClose', async () => {
    await repository.close();
  });

  app.get('/content/config', async () => ({
    types: contentTypeConfigs,
    statuses: contentStatusLabels
  }));

  app.get('/content/items', async (request) => {
    const query = listQuerySchema.parse(request.query);
    return repository.listItems(query);
  });

  app.post('/content/items', async (request, reply) => {
    const input = contentItemInputSchema.parse(request.body);

    try {
      return reply.code(201).send(await repository.createItem(input));
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
    const { id } = idParamsSchema.parse(request.params);
    const detail = await repository.getItem(id);

    if (!detail) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return detail;
  });

  app.patch('/content/items/:id', async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = patchContentItemSchema.parse(request.body);

    try {
      const detail = await repository.updateItem(id, input);

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
    const result = await changeWorkflowStatus(
      request.params,
      'in_review',
      'submitted',
      'Submitted for review'
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/publish', async (request, reply) => {
    const result = await changeWorkflowStatus(
      request.params,
      'published',
      'published',
      'Published'
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/items/:id/unpublish', async (request, reply) => {
    const result = await changeWorkflowStatus(
      request.params,
      'draft',
      'unpublished',
      'Unpublished to draft'
    );

    if (!result) {
      return reply.code(404).send({ error: 'Content item not found' });
    }

    return result;
  });

  app.post('/content/ai/suggestions', async (request, reply) => {
    const input = aiSuggestionInputSchema.parse(request.body);
    const suggestion = await repository.createSuggestion({
      itemId: input.itemId,
      kind: input.kind,
      input: input.input,
      output: buildAiPlaceholderOutput(input.kind, input.input)
    });

    return reply.code(201).send({ suggestion });
  });

  function changeWorkflowStatus(
    params: unknown,
    status: ContentStatus,
    action: ContentWorkflowEvent['action'],
    note: string
  ) {
    const { id } = idParamsSchema.parse(params);
    return repository.changeStatus(id, status, action, note);
  }
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
