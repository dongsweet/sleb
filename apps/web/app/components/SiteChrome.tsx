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
            <small>Modernization</small>
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
      </header>
      {children}
      <footer className="siteFooter">
        <span>SLEB platform workspace</span>
        <a href="/sitemap">Sitemap</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/terms-and-conditions">Terms</a>
      </footer>
    </>
  );
}
