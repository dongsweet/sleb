"use client";

import { ReactNode, useState } from "react";
import { LoginModal } from "./LoginModal";

const navGroups = [
  { label: 'Home', href: '/', children: [] },
  {
    label: 'Initiatives',
    href: '#',
    children: [
      { label: 'About', href: '/about' },
      { label: 'News', href: '/news' },
      { label: 'Grants', href: '/grants-and-incentives' },
      { label: 'Incentives', href: '/grants-and-incentives' },
      { label: 'Events', href: '/events' },
      { label: 'Publications', href: '/publications' },
      { label: 'Dictionary', href: '/terms-dictionary' }
    ]
  },
  {
    label: 'Projects',
    href: '/projects',
    children: [
      { label: 'Research and Innovation', href: '/projects' },
      { label: 'ZEB Plus', href: '/projects/zeb-plus' },
      { label: 'Racks Central Data Center', href: '/projects/racks-central-data-center' },
      { label: 'SMU Connexion', href: '/projects/smu-connexion' }
    ]
  },
  {
    label: 'Buildings',
    href: '#',
    children: [
      { label: 'Green Mark Directory', href: '/buildings/green-mark-directory' },
      { label: 'Energy Benchmarking', href: '/buildings/energy-benchmarking' }
    ]
  },
  {
    label: 'Directories',
    href: '#',
    children: [
      { label: 'Technology Directory', href: '/technologies' },
      { label: 'Service Directory', href: '/services' }
    ]
  },
  {
    label: 'Assessment',
    href: '#',
    children: [
      { label: 'Home Owner', href: '/theea' },
      { label: 'Building Owner', href: '/beea' },
      { label: 'Business Owner', href: '/smeea' }
    ]
  },
  { label: 'Calculator', href: '/ai-calculator', children: [] }
] as const;

export function SiteChromeShell({
  children,
  activeArea,
}: {
  children: ReactNode;
  activeArea?: string;
}) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="siteHeader">
        <div className="siteHeaderInner">
          <a className="brandMark" href="/">
            <img alt="SLEB Smart Hub" src="/sleb-assets/gbic-logo.png" />
          </a>
          <nav aria-label="Primary navigation" className="topNav">
            {navGroups.map((item) => (
              <div className="navItem" key={item.label}>
                <a
                  aria-current={activeArea === item.label ? 'page' : undefined}
                  href={item.href}
                >
                  {item.label}
                </a>
                {item.children.length > 0 ? (
                  <div className="navDropdown">
                    {item.children.map((child) => (
                      <a href={child.href} key={child.label}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
          <div className="headerActions">
            <a className="headerCta" href="/membership">
              MEMBERSHIP
            </a>
            <a className="headerLink" href="/account/register">
              Sign Up
            </a>
            <button
              className="headerLink"
              type="button"
              onClick={() => setLoginOpen(true)}
            >
              Log in
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer className="siteFooter">
        <div className="siteFooterInner">
          <section className="footerMail">
            <h2>Join our Mailing List</h2>
            <p>
              Keep up-to-date with the latest news, and we will keep you posted with the latest
              technology information and events.
            </p>
            <div className="footerButtons">
              <a aria-label="Feedback" href="/contact">
                @
              </a>
              <a aria-label="Subscribe" href="/subscribe">
                RSS
              </a>
            </div>
            <div className="footerLogos">
              <div>
                <span>Funded by:</span>
                <a href="https://www.nrf.gov.sg/">
                  <img alt="NRF logo" src="/sleb-assets/nrf-logo.png" />
                </a>
              </div>
              <div>
                <span>Brought to you by:</span>
                <a href="https://www1.bca.gov.sg/">
                  <img alt="BCA logo" src="/sleb-assets/bca-logo.png" />
                </a>
              </div>
            </div>
          </section>

          <section className="footerHub">
            <h2>SLEB Smart Hub</h2>
            <p>
              Funded by the National Research Foundation, SLEB Smart Hub aims to empower developers
              with innovative green technologies to create a more sustainable Singapore.
            </p>
            <a href="/publications">Recent Newsletters</a>
          </section>

          <section className="footerContact">
            <a className="footerLogo" href="/">
              <img alt="SLEB Smart Hub" src="/sleb-assets/gbic-logo.png" />
            </a>
            <p>200 Braddell Road Singapore 579700</p>
            <p>Building and Construction Authority</p>
            <a href="mailto:sleb@bca.gov.sg">sleb@bca.gov.sg</a>
            <a className="footerAdmin" href="/admin">
              Admin
            </a>
          </section>
        </div>
        <p className="footerCopyright">&copy; 2025 Building and Construction Authority of Singapore.</p>
      </footer>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
