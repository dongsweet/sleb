import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Hero, PageSummary, WorkbenchPreview } from '../components/PageBlocks';
import { SiteChrome } from '../components/SiteChrome';
import { getPublicPage, publicPages } from '../data/site';

const contentOwnedPaths = new Set(['events', 'grants-and-incentives', 'news']);

type PublicRouteProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return publicPages
    .filter((page) => !contentOwnedPaths.has(page.path))
    .map((page) => ({
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

  let activeArea: string | undefined;

  if (page.path.startsWith('buildings')) {
    activeArea = 'Buildings';
  } else if (page.path.startsWith('technologies')) {
    activeArea = 'Technologies';
  } else if (page.path.startsWith('services')) {
    activeArea = 'Services';
  } else if (page.path.startsWith('ai-calculator')) {
    activeArea = 'AI Calculator';
  } else if (page.path.startsWith('membership')) {
    activeArea = 'Membership';
  } else if (page.path.startsWith('account')) {
    activeArea = 'Login';
  } else if (page.path === 'about') {
    activeArea = 'About';
  }

  return (
    <SiteChrome activeArea={activeArea}>
      <main>
        <Hero kicker={page.kicker} summary={page.summary} title={page.title} />
        <PageSummary page={page} />
        <WorkbenchPreview page={page} />
      </main>
    </SiteChrome>
  );
}
