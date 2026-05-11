import {
  seedContentItems,
  type ContentItem,
  type ContentStatus,
  type ContentType
} from '@sleb/shared/content';

type ContentListResponse = {
  items: ContentItem[];
};

type ContentQuery = {
  type?: ContentType;
  status?: ContentStatus;
};

export const contentSectionPaths: Partial<Record<ContentType, string>> = {
  event: '/events',
  news: '/news',
  grant: '/grants-and-incentives',
  incentive: '/grants-and-incentives',
  publication: '/publications'
};

export async function getContentItems(query: ContentQuery = {}) {
  const apiItems = await fetchContentItems(query);

  if (apiItems) {
    return sortContentItems(apiItems);
  }

  return sortContentItems(
    seedContentItems
      .filter((item) => !query.type || item.type === query.type)
      .filter((item) => !query.status || item.status === query.status)
  );
}

export async function getPublishedContentItems(types?: ContentType[]) {
  const items = await getContentItems({ status: 'published' });

  if (!types) {
    return items;
  }

  return items.filter((item) => types.includes(item.type));
}

export async function getPublishedContentItem(type: ContentType, slug: string) {
  const items = await getContentItems({ type, status: 'published' });
  return items.find((item) => item.slug === slug);
}

export function getContentHref(item: ContentItem) {
  const basePath = contentSectionPaths[item.type] ?? '/news';
  return `${basePath}/${item.slug}`;
}

export function sortContentItems(items: ContentItem[]) {
  return [...items].sort((a, b) => {
    const aDate = a.publishedAt ?? a.updatedAt;
    const bDate = b.publishedAt ?? b.updatedAt;
    return bDate.localeCompare(aDate);
  });
}

async function fetchContentItems(query: ContentQuery) {
  const url = buildApiUrl('/content/items');

  if (!url) {
    return undefined;
  }

  if (query.type) {
    url.searchParams.set('type', query.type);
  }

  if (query.status) {
    url.searchParams.set('status', query.status);
  }

  try {
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as ContentListResponse;
    return data.items;
  } catch {
    return undefined;
  }
}

function buildApiUrl(path: string) {
  const baseUrl = process.env.INTERNAL_API_URL ?? process.env.PUBLIC_API_URL;

  if (!baseUrl) {
    return undefined;
  }

  return new URL(`${baseUrl.replace(/\/$/, '')}${path}`);
}
