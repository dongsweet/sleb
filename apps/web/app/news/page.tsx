import type { Metadata } from 'next';
import { ContentCollectionPage } from '../components/ContentPages';
import { SiteChrome } from '../components/SiteChrome';
import { getPublishedContentItems } from '../data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'News | SLEB',
  description: 'Published SLEB announcements and platform news.'
};

export default async function NewsPage() {
  const items = await getPublishedContentItems(['news']);

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentCollectionPage
          eyebrow="News"
          items={items}
          summary="Published announcements, industry updates, partner stories, and platform news."
          title="News"
        />
      </main>
    </SiteChrome>
  );
}
