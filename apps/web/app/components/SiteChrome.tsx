import { primaryNav } from '../data/site';

type SiteChromeProps = {
  children: React.ReactNode;
  activeArea?: string;
};

export function SiteChrome({ children, activeArea }: SiteChromeProps) {
  return (
    <>
      <header className="siteHeader">
        <a className="brandMark" href="/">
          <span className="brandSymbol">S</span>
          <span>
            <strong>SLEB</strong>
            <small>Smart Hub</small>
          </span>
        </a>
        <nav aria-label="Primary navigation" className="topNav">
          {primaryNav.map((item) => (
            <a
              aria-current={activeArea === item.label ? 'page' : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="headerCta" href="/membership/register">
          Sign Up
        </a>
      </header>
      {children}
      <footer className="siteFooter">
        <span>SLEB Smart Hub</span>
        <a href="/about">About</a>
        <a href="/news">News</a>
        <a href="/events">Events</a>
        <a href="/sitemap">Sitemap</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms-and-conditions">Terms</a>
        <a href="/admin">Admin</a>
      </footer>
    </>
  );
}
