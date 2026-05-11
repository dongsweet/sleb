import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentArticlePage } from '../../components/ContentPages';
import { SiteChrome } from '../../components/SiteChrome';
import { getPublishedContentItem } from '../../data/content';

type EventDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedContentItem('event', slug);

  if (!item) {
    return {
      title: 'Events | SLEB'
    };
  }

  return {
    title: `${item.seo.title ?? item.title} | SLEB`,
    description: item.seo.description ?? item.summary
  };
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params;
  const item = await getPublishedContentItem('event', slug);

  if (!item) {
    notFound();
  }

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentArticlePage
          backHref="/events"
          backLabel="Back to Events"
          item={item}
        />
      </main>
    </SiteChrome>
  );
}
