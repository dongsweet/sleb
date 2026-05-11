import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentDeskClient } from '../components/ContentDeskClient';
import { AdminSectionView, Hero, RoleMatrix } from '../../components/PageBlocks';
import { SiteChrome } from '../../components/SiteChrome';
import { adminSections, getAdminSection, publishingRoles } from '../../data/site';

type AdminRouteProps = {
  params: Promise<{
    section?: string[];
  }>;
};

export const metadata: Metadata = {
  title: 'Admin | SLEB',
  description: 'SLEB publishing and membership administration scaffold'
};

export function generateStaticParams() {
  return [
    {},
    ...adminSections.map((section) => ({
      section: [section.path]
    }))
  ];
}

export default async function AdminRoutePage({ params }: AdminRouteProps) {
  const { section } = await params;
  const sectionSlug = section?.join('/');

  if (sectionSlug && !getAdminSection(sectionSlug)) {
    notFound();
  }

  const currentSection = getAdminSection(sectionSlug);

  return (
    <SiteChrome activeArea="Admin">
      <main>
        <Hero
          kicker="Publishing backend"
          summary="A role-aware administration shell for editorial content, directories, memberships, assessments, media, and permission design."
          title={currentSection?.title ?? 'Admin Console'}
          tone="admin"
        />

        {currentSection?.path === 'content' ? (
          <ContentDeskClient />
        ) : currentSection ? (
          <AdminSectionView section={currentSection} />
        ) : (
          <section className="band">
            <div className="sectionHeader">
            <div>
              <p className="eyebrow">Control room</p>
              <h2>Choose an admin section</h2>
            </div>
            <p>
                The backend is grouped by the team and approval boundary that owns each publishing
                workflow.
            </p>
            </div>
            <div className="adminGrid">
              {adminSections.map((adminSection) => (
                <a className="adminLink" href={`/admin/${adminSection.path}`} key={adminSection.path}>
                  <span>{adminSection.queue}</span>
                  <strong>{adminSection.title}</strong>
                  <small>{adminSection.summary}</small>
                </a>
              ))}
            </div>
          </section>
        )}

        <RoleMatrix roles={publishingRoles} />
      </main>
    </SiteChrome>
  );
}
