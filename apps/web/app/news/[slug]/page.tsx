import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentArticlePage } from '../../components/ContentPages';
import { SiteChrome } from '../../components/SiteChrome';
import { getPublishedContentItem } from '../../data/content';

type NewsDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedContentItem('news', slug);

  if (!item) {
    return {
      title: 'News | SLEB'
    };
  }

  return {
    title: `${item.seo.title ?? item.title} | SLEB`,
    description: item.seo.description ?? item.summary
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const item = await getPublishedContentItem('news', slug);

  if (!item) {
    notFound();
  }

  return (
    <SiteChrome activeArea="Initiatives">
      <main>
        <ContentArticlePage
          backHref="/news"
          backLabel="Back to News"
          item={item}
        />
      </main>
    </SiteChrome>
  );
}
