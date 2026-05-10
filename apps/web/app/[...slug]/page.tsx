import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero, PageSummary, WorkbenchPreview } from '../components/PageBlocks';
import { SiteChrome } from '../components/SiteChrome';
import { getPublicPage, publicPages } from '../data/site';

type PublicRouteProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return publicPages.map((page) => ({
    slug: page.path.split('/')
  }));
}

export async function generateMetadata({ params }: PublicRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPublicPage(slug.join('/'));

  if (!page) {
    return {
      title: 'SLEB'
    };
  }

  return {
    title: `${page.title} | SLEB`,
    description: page.summary
  };
}

export default async function PublicRoutePage({ params }: PublicRouteProps) {
  const { slug } = await params;
  const page = getPublicPage(slug.join('/'));

  if (!page) {
    notFound();
  }

  return (
    <SiteChrome activeArea={page.group === 'Directories' ? 'Directories' : undefined}>
      <main>
        <Hero kicker={page.kicker} summary={page.summary} title={page.title} />
        <PageSummary page={page} />
        <WorkbenchPreview page={page} />
      </main>
    </SiteChrome>
  );
}
