import type { AdminSection, PublicPage, PublishingRole } from '../data/site';

type HeroProps = {
  kicker: string;
  title: string;
  summary: string;
  tone?: 'site' | 'admin';
};

export function Hero({ kicker, title, summary, tone = 'site' }: HeroProps) {
  return (
    <section className={`hero hero-${tone}`}>
      <div className="heroCopy">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p className="lede">{summary}</p>
      </div>
    </section>
  );
}

export function PageSummary({ page }: { page: PublicPage }) {
  return (
    <section className="band">
      <div className="sectionGrid">
        <div>
          <p className="eyebrow">Content model</p>
          <h2>{page.contentModel}</h2>
          <p>{page.summary}</p>
        </div>
        <div className="factList">
          <Fact label="Legacy route" value={page.legacyPath ?? 'New route'} />
          <Fact label="Owner" value={page.owner} />
          <Fact label="Access" value={page.status} />
          <Fact label="Publish roles" value={page.publishRoles.join(', ')} />
        </div>
      </div>
    </section>
  );
}

export function WorkbenchPreview({ page }: { page: PublicPage }) {
  return (
    <section className="band bandAlt">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Page skeleton</p>
          <h2>Primary workflow</h2>
        </div>
        <p>Each page carries an owner, content type, workflow entry point, and publishing boundary.</p>
      </div>
      <div className="triGrid">
        <article className="infoCard">
          <h3>Visitor actions</h3>
          <ul>
            {page.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
        <article className="infoCard">
          <h3>Records to model</h3>
          <ul>
            {page.records.map((record) => (
              <li key={record}>{record}</li>
            ))}
          </ul>
        </article>
        <article className="infoCard">
          <h3>Publishing flow</h3>
          <ol>
            <li>Draft or import source record.</li>
            <li>Review owner, fields, media, and legacy URL.</li>
            <li>Publish with audit trail and rollback state.</li>
          </ol>
        </article>
      </div>
    </section>
  );
}

export function AdminSectionView({ section }: { section: AdminSection }) {
  return (
    <>
      <section className="band">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">{section.queue}</p>
            <h2>{section.title}</h2>
          </div>
          <p>{section.summary}</p>
        </div>
        <div className="metricGrid">
          {section.metrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="band bandAlt">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Queue</p>
            <h2>Current work items</h2>
          </div>
          <p>Operational queues show the records waiting for review, approval, or publication.</p>
        </div>
        <div className="tableLike">
          {section.workItems.map((item) => (
            <div className="tableRow" key={item.title}>
              <span>{item.title}</span>
              <strong>{item.state}</strong>
              <em>{item.owner}</em>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function RoleMatrix({ roles }: { roles: PublishingRole[] }) {
  return (
    <section className="band">
      <div className="sectionHeader">
        <div>
          <p className="eyebrow">Role model</p>
          <h2>Publishing responsibilities</h2>
        </div>
        <p>
          Publishing permissions separate people who submit drafts from people who can publish or
          approve access-changing records.
        </p>
      </div>
      <div className="roleGrid">
        {roles.map((role) => (
          <article className="roleCard" key={role.id}>
            <div className="roleTopline">
              <span>{role.level}</span>
              <strong>{role.title}</strong>
            </div>
            <p>{role.mission}</p>
            <dl>
              <dt>Can draft</dt>
              <dd>{role.canDraft.join(', ')}</dd>
              <dt>Can publish</dt>
              <dd>{role.canPublish.join(', ')}</dd>
              <dt>Boundary</dt>
              <dd>{role.reviewBoundary}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
