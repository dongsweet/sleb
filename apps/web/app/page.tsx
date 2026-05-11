import { membershipLevels } from '@sleb/shared';
import { SiteChrome } from './components/SiteChrome';

const services = [
  {
    title: 'Buildings',
    summary: 'Search Green Mark buildings, project references, and efficiency records.',
    href: '/buildings/green-mark-directory',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Technologies',
    summary: 'Explore products, systems, and solutions for super low energy outcomes.',
    href: '/technologies',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'Green Finance',
    summary: 'Find grants, incentives, and support pathways for adoption projects.',
    href: '/grants-and-incentives',
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80'
  },
  {
    title: 'AI Calculator',
    summary: 'Start a guided assessment for energy-saving measures and project options.',
    href: '/ai-calculator',
    image:
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=900&q=80'
  }
];

const updates = [
  {
    type: 'News',
    title: 'New retrofit guidance for commercial buildings',
    date: 'May 2026',
    href: '/news'
  },
  {
    type: 'Event',
    title: 'Super low energy design workshop',
    date: 'Jun 2026',
    href: '/events'
  },
  {
    type: 'Grant',
    title: 'Support schemes for energy performance upgrades',
    date: 'Open',
    href: '/grants-and-incentives'
  },
  {
    type: 'Technology',
    title: 'Featured control systems and monitoring solutions',
    date: 'Latest',
    href: '/technologies'
  }
];

const assessmentTools = [
  {
    title: 'Energy Benchmarking',
    summary: 'Compare performance across building type, intensity, and operating profile.',
    href: '/buildings/energy-benchmarking'
  },
  {
    title: 'BEEA',
    summary: 'Prepare building energy efficiency assessment records and evidence.',
    href: '/beea'
  },
  {
    title: 'SMEEA',
    summary: 'Run SME-focused self-assessments with report entitlement by plan.',
    href: '/smeea'
  }
];

export default function HomePage() {
  return (
    <SiteChrome activeArea="Home">
      <main>
        <section className="homeHero">
          <div className="homeHeroOverlay">
            <div className="homeHeroCopy">
              <p className="eyebrow">Singapore Super Low Energy Building</p>
              <h1>Super Low Energy Building Smart Hub</h1>
              <p className="lede">
                Discover buildings, technologies, services, funding pathways, and assessment tools
                that support the move toward high-performance, low-energy buildings.
              </p>
              <div className="heroActions">
                <a className="primaryButton" href="/buildings/green-mark-directory">
                  Explore Buildings
                </a>
                <a className="secondaryButton" href="/membership/register">
                  Become a Member
                </a>
              </div>
            </div>
            <div className="homeHeroPanel">
              <span>Smart Hub</span>
              <strong>One platform for green building data, member tools, and market resources.</strong>
            </div>
          </div>
        </section>

        <section className="quickStats" aria-label="SLEB data highlights">
          <div>
            <strong>4,600+</strong>
            <span>Green Mark building records</span>
          </div>
          <div>
            <strong>160+</strong>
            <span>Technology listings</span>
          </div>
          <div>
            <strong>500+</strong>
            <span>Dictionary terms</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Membership plans</span>
          </div>
        </section>

        <section className="band">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Our services</p>
              <h2>Find the right resource for your next low-energy project.</h2>
            </div>
            <p>
              Start with a building record, compare technologies, look for implementation partners,
              or review available support schemes.
            </p>
          </div>
          <div className="serviceGrid">
            {services.map((service) => (
              <a className="serviceTile" href={service.href} key={service.title}>
                <span style={{ backgroundImage: `url(${service.image})` }} />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="band bandAlt">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Tools and assessments</p>
              <h2>Support decisions with benchmarking and member assessments.</h2>
            </div>
            <p>
              Benchmarking and assessment workspaces help teams evaluate performance and prepare
              decision-ready records.
            </p>
          </div>
          <div className="toolStrip">
            {assessmentTools.map((tool) => (
              <a className="toolCard" href={tool.href} key={tool.title}>
                <h3>{tool.title}</h3>
                <p>{tool.summary}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="band homeSplit">
          <div className="aboutPanel">
            <p className="eyebrow">About us</p>
            <h2>Accelerating adoption of super low energy buildings.</h2>
            <p>
              SLEB brings together building data, technologies, services, tools, and knowledge so
              owners, professionals, solution providers, and agencies can work from a common hub.
            </p>
            <div className="missionGrid">
              <div>
                <strong>Vision</strong>
                <span>A built environment that uses less energy and performs better.</span>
              </div>
              <div>
                <strong>Mission</strong>
                <span>Make proven solutions, references, and assessments easier to access.</span>
              </div>
              <div>
                <strong>Objective</strong>
                <span>Connect projects, people, technologies, and incentives in one workflow.</span>
              </div>
            </div>
          </div>
          <aside className="membershipPanel">
            <p className="eyebrow">Membership</p>
            <h2>Member tools unlock by company plan.</h2>
            <div className="homePlanList">
              {membershipLevels.map((plan) => (
                <a href="/membership" key={plan.id}>
                  <span>{plan.name}</span>
                  <strong>{plan.displayPrice}</strong>
                </a>
              ))}
            </div>
          </aside>
        </section>

        <section className="band bandAlt">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">News and updates</p>
              <h2>Latest from the Smart Hub.</h2>
            </div>
            <p>Browse announcements, workshops, funding notes, and featured marketplace updates.</p>
          </div>
          <div className="updateGrid">
            {updates.map((item) => (
              <a className="updateCard" href={item.href} key={item.title}>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <small>{item.date}</small>
              </a>
            ))}
          </div>
        </section>

        <section className="subscribeBand">
          <div>
            <p className="eyebrow">Keep in touch</p>
            <h2>Receive news, events, and technology updates.</h2>
          </div>
          <form className="subscribeForm">
            <label htmlFor="home-email">Email address</label>
            <input id="home-email" name="email" placeholder="you@example.com" type="email" />
            <button type="submit">Subscribe</button>
          </form>
        </section>
      </main>
    </SiteChrome>
  );
}
