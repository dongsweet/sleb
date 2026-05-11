import {
  seedTechnologyListings,
  type ContentItem,
  type ContentType
} from '@sleb/shared/content';
import { SiteChrome } from './components/SiteChrome';
import { getContentHref, getPublishedContentItems } from './data/content';

export const dynamic = 'force-dynamic';

const services = [
  {
    key: 'buildings',
    title: 'Buildings',
    summary:
      'Green Mark projects directory and statistical building energy performance dashboard.',
    icon: '/sleb-assets/service-building.png',
    links: [
      {
        label: 'Green Mark projects directory',
        href: '/buildings/green-mark-directory'
      },
      {
        label: 'Statistical building energy performance dashboard',
        href: '/buildings/energy-benchmarking'
      }
    ]
  },
  {
    key: 'technologies',
    title: 'Technologies',
    summary: 'Technologies and products directory.',
    icon: '/sleb-assets/service-technologies.png',
    links: [
      {
        label: 'Find latest green technologies and products',
        href: '/technologies'
      },
      { label: 'Register my technology', href: '/technologies?type=my' }
    ]
  },
  {
    key: 'finance',
    title: 'Green Finance',
    summary:
      'Predict the energy efficient level of your home or building before move-in.',
    icon: '/sleb-assets/service-projects.png',
    links: [
      { label: 'Tropical Home Energy Efficiency Assessment', href: '/theea' },
      {
        label: 'Tropical Building Energy Efficiency Assessment',
        href: '/beea'
      }
    ]
  },
  {
    key: 'calculator',
    title: 'AI Calculator',
    summary:
      "Assess or verify your project's energy efficiency level under Green Mark frameworks.",
    icon: '/sleb-assets/icon-verify.svg',
    href: '/ai-calculator'
  }
];

function buildContentPanel(
  title: string,
  type: ContentType,
  href: string,
  wide: boolean,
  contentItems: ContentItem[]
) {
  return {
    title,
    href,
    wide,
    items: contentItems
      .filter((item) => item.type === type)
      .slice(0, 3)
      .map((item) => ({
        label: item.title,
        href: getContentHref(item)
      }))
  };
}

const aboutPoints = [
  'The Super Low Energy Building (SLEB) Smart Hub aims to be a national digital platform for energy efficiency of built environment. It consists of a variety of databases and software applications in support of the Singapore Green Building Masterplan (SGBMP) target of achieving 80% energy efficiency by 2030.',
  'SLEB Smart Hub collects data from various sources and links different databases. It provides unique data analytics functions to enable data-driven decision-making to facilitate energy-efficient built environment in Singapore.',
  'We aim to use SLEB Smart Hub platform to foster closer collaborations among building owners and developers, contractors and consultants, green technology companies and green financiers to work together to build a more sustainable built environment for Singapore.'
];

const aboutGoals = [
  {
    title: 'Vision',
    body: 'To be an industry-leading, central resource centre for energy-efficient built environment.'
  },
  {
    title: 'Mission',
    body: 'Capture the value of energy performance data of buildings and technologies, and support decision-making in adopting energy-efficient technologies.'
  },
  {
    title: 'Objective',
    body: 'Support Singapore Green Building Masterplan (SGBMP) targets and BCA Green Mark certification scheme for a more sustainable Singapore.'
  }
];

export default async function HomePage() {
  const contentItems = await getPublishedContentItems([
    'event',
    'news',
    'grant'
  ]);
  const updatePanels = [
    buildContentPanel('Events', 'event', '/events', false, contentItems),
    buildContentPanel('News', 'news', '/news', true, contentItems),
    buildContentPanel(
      'Grants',
      'grant',
      '/grants-and-incentives',
      false,
      contentItems
    ),
    {
      title: 'Latest Technologies',
      href: '/technologies',
      wide: true,
      items: seedTechnologyListings.map((item) => ({
        label: item.title,
        href: item.href
      }))
    }
  ];

  return (
    <SiteChrome activeArea="Home">
      <main className="slebHome">
        <section className="slebHero">
          <div className="slebHeroOverlay">
            <div className="slebHeroContent">
              <h1>Empowering the present for a sustainable future</h1>
              <p>
                SLEB Smart Hub offers smart services and resources to transform
                your buildings. We leverage cutting-edge data, knowledge, and
                artificial intelligence to help your buildings achieve Super Low
                Energy target.
              </p>
              <form action="/search" className="slebSearch" method="get">
                <input
                  aria-label="Search resources, database and news"
                  name="q"
                  placeholder="Search Resources, Database & News"
                />
                <button aria-label="Search" type="submit" />
              </form>
            </div>
          </div>
        </section>

        <div className="slebMain">
          <section className="slebServices" aria-labelledby="services-title">
            <h2 className="slebTitle" id="services-title">
              Our Services
            </h2>
            <div className="slebServiceGrid">
              {services.map((service) => (
                <article
                  className={`slebServiceCard ${service.key}`}
                  key={service.title}
                >
                  {service.href ? (
                    <a
                      className="slebServiceFace slebServiceLink"
                      href={service.href}
                    >
                      <img alt="" src={service.icon} />
                      <h3>{service.title}</h3>
                      <p>{service.summary}</p>
                    </a>
                  ) : (
                    <>
                      <div className="slebServiceFace">
                        <img alt="" src={service.icon} />
                        <h3>{service.title}</h3>
                        <p>{service.summary}</p>
                      </div>
                      <div className="slebServiceLinks">
                        {service.links?.map((link) => (
                          <a href={link.href} key={link.label}>
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="slebUpdates" aria-labelledby="updates-title">
            <h2 className="slebTitle" id="updates-title">
              News & Updates
            </h2>
            <div className="slebUpdateGrid">
              {updatePanels.map((panel) => (
                <article
                  className={
                    panel.wide ? 'slebUpdatePanel wide' : 'slebUpdatePanel'
                  }
                  key={panel.title}
                >
                  <div className="slebPanelTitle">
                    <h3>{panel.title}</h3>
                    <a href={panel.href}>All</a>
                  </div>
                  <div className="slebLinkList">
                    {panel.items.map((item) => (
                      <a href={item.href} key={item.label}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="slebAbout" aria-labelledby="about-title">
            <h2 className="slebTitle" id="about-title">
              About Us
            </h2>
            <div className="slebAboutTimeline">
              <ul className="slebAboutCopy">
                {aboutPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="slebAboutGoals">
                {aboutGoals.map((goal) => (
                  <article key={goal.title}>
                    <h3>{goal.title}</h3>
                    <p>{goal.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="slebVideo" aria-label="SLEB Smart Hub video">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              src="https://www.youtube.com/embed/VRqFnYVJMCU"
              title="SLEB Smart Hub video"
            />
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}
