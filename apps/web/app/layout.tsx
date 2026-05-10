import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SLEB Platform',
  description: 'Modern SLEB public site, membership portal, and publishing admin scaffold'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
