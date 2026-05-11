import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentArticlePage } from '../../components/ContentPages';
import { SiteChrome } from '../../components/SiteChrome';
import { getPublishedContentItems } from '../../data/content';

type GrantDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

async function getGrantOrIncentive(slug: string) {
  const items = await getPublishedContentItems(['grant', 'incentive']);
  return items.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params
}: GrantDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getGrantOrIncentive(slug);

  if (!item) {
    return {
      title: 'Grants and Incentives | SLEB'
    };
  }

  return {
    title: `${item.seo.title ?? item.title} | SLEB`,
    description: item.seo.description ?? item.summary
  };
}

export default async function GrantDetailPage({ params }: GrantDetailProps) {
  const { slug } = await params;
  const item = await getGrantOrIncentive(slug);

  if (!item) {
    notFound();
  }

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentArticlePage
          backHref="/grants-and-incentives"
          backLabel="Back to Grants and Incentives"
          item={item}
        />
      </main>
    </SiteChrome>
  );
}
