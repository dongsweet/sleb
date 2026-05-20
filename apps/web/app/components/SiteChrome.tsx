import { ReactNode } from "react";
import { SiteChromeShell } from "./SiteChromeShell";

type SiteChromeProps = {
  children: ReactNode;
  activeArea?: string;
};

export function SiteChrome({ children, activeArea }: SiteChromeProps) {
  return (
    <SiteChromeShell activeArea={activeArea}>
      {children}
    </SiteChromeShell>
  );
}
