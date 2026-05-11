import type { Metadata } from 'next';
import { ContentCollectionPage } from '../components/ContentPages';
import { SiteChrome } from '../components/SiteChrome';
import { getPublishedContentItems } from '../data/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Grants and Incentives | SLEB',
  description:
    'Published SLEB grants, incentives, funding schemes, and support notices.'
};

export default async function GrantsAndIncentivesPage() {
  const items = await getPublishedContentItems(['grant', 'incentive']);

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentCollectionPage
          eyebrow="Grants and Incentives"
          items={items}
          summary="Published funding schemes, calls for proposals, tax incentives, and adoption pathways."
          title="Grants and Incentives"
        />
      </main>
    </SiteChrome>
  );
}
