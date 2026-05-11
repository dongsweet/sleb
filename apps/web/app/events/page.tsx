import type { Metadata } from 'next';
import { ContentCollectionPage } from '../components/ContentPages';
import { SiteChrome } from '../components/SiteChrome';
import { getPublishedContentItems } from '../data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events | SLEB',
  description:
    'Published SLEB events, webinars, workshops, and programme notices.'
};

export default async function EventsPage() {
  const items = await getPublishedContentItems(['event']);

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentCollectionPage
          eyebrow="Events"
          items={items}
          summary="Published webinars, workshops, forums, and programme calendar entries."
          title="Events"
        />
      </main>
    </SiteChrome>
  );
}
