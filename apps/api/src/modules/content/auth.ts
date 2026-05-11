import type { FastifyReply, FastifyRequest } from 'fastify';

export const contentRoles = [
  'content_author',
  'content_publisher',
  'platform_admin'
] as const;

export type ContentRole = (typeof contentRoles)[number];

export type ContentActor = {
  role: ContentRole;
  name: string;
};

const roleLabels: Record<ContentRole, string> = {
  content_author: 'Content Author',
  content_publisher: 'Content Publisher',
  platform_admin: 'Platform Admin'
};

const roleRank: Record<ContentRole, number> = {
  content_author: 1,
  content_publisher: 2,
  platform_admin: 3
};

export function getContentActor(
  request: FastifyRequest
): ContentActor | undefined {
  const role = normalizeHeader(request.headers['x-sleb-role']);

  if (!isContentRole(role)) {
    return undefined;
  }

  return {
    role,
    name:
      normalizeHeader(request.headers['x-sleb-actor-name']) || roleLabels[role]
  };
}

export function requireContentRole(
  request: FastifyRequest,
  reply: FastifyReply,
  minimumRole: ContentRole = 'content_author'
) {
  const actor = getContentActor(request);

  if (!actor) {
    reply.code(401).send({
      error: 'Content role is required'
    });
    return undefined;
  }

  if (roleRank[actor.role] < roleRank[minimumRole]) {
    reply.code(403).send({
      error: `${roleLabels[minimumRole]} permission is required`
    });
    return undefined;
  }

  return actor;
}

export function canWriteContentType(actor: ContentActor, type: string) {
  return type !== 'policy' || actor.role === 'platform_admin';
}

export function canPublish(actor: ContentActor) {
  return actor.role === 'content_publisher' || actor.role === 'platform_admin';
}

export function canSetStatus(actor: ContentActor, status: string | undefined) {
  if (!status || status === 'draft' || status === 'in_review') {
    return true;
  }

  return canPublish(actor);
}

function normalizeHeader(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim();
  }

  return value?.trim();
}

function isContentRole(value: string | undefined): value is ContentRole {
  return contentRoles.includes(value as ContentRole);
}
