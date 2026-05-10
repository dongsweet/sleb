import { membershipLevels } from '@sleb/shared';
import { Hero, RoleMatrix } from './components/PageBlocks';
import { SiteChrome } from './components/SiteChrome';
import {
  adminSections,
  getPagesByGroup,
  memberFeatureRows,
  pageGroups,
  publicPages,
  publishingRoles
} from './data/site';

export default function HomePage() {
  const priorityGroups = pageGroups.filter((group) => group !== 'Policies');

  return (
    <SiteChrome>
      <main>
        <Hero
          kicker="SLEB rebuild map"
          summary="Public pages, member-facing flows, and the publishing admin now share one route map across content, directories, memberships, and assessment tools."
          title="One route map for the public site and the publishing backend."
        />

        <section className="band">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Route inventory</p>
              <h2>{publicPages.length} public and member-facing pages</h2>
            </div>
            <p>
              Every page has a route, content owner, publishing boundary, and legacy mapping target
              for the migration work ahead.
            </p>
          </div>
          <div className="routeBoard">
            {priorityGroups.map((group) => (
              <article className="routeColumn" key={group}>
                <h3>{group}</h3>
                {getPagesByGroup(group).map((page) => (
                  <a href={`/${page.path}`} key={page.path}>
                    <span>{page.title}</span>
                    <small>{page.owner}</small>
                  </a>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="band bandAlt">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Member model</p>
              <h2>Membership controls feature access</h2>
            </div>
            <p>
              The rebuild keeps SLEB's two-level identity model: individual user accounts and
              company-level memberships.
            </p>
          </div>
          <div className="planGrid">
            {membershipLevels.map((plan) => (
              <article className="plan" key={plan.id}>
                <span>Level {plan.id}</span>
                <h3>{plan.name}</h3>
                <p className="price">{plan.displayPrice}</p>
                <p>{plan.summary}</p>
                <small>{plan.maxConnectedAccounts} connected accounts</small>
              </article>
            ))}
          </div>
          <div className="matrix">
            {memberFeatureRows.map((row) => (
              <div className="matrixRow" key={row.feature}>
                <span>{row.feature}</span>
                <strong>{row.minimumLevel}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="band">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Admin workspace</p>
              <h2>Publishing backend sections</h2>
            </div>
            <p>
              These admin areas separate editorial publishing, directory moderation, membership
              approvals, tool governance, media operations, and platform permissions.
            </p>
          </div>
          <div className="adminGrid">
            {adminSections.map((section) => (
              <a className="adminLink" href={`/admin/${section.path}`} key={section.path}>
                <span>{section.queue}</span>
                <strong>{section.title}</strong>
                <small>{section.summary}</small>
              </a>
            ))}
          </div>
        </section>

        <RoleMatrix roles={publishingRoles} />
      </main>
    </SiteChrome>
  );
}
