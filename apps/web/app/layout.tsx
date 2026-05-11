import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SLEB Smart Hub',
  description: 'Super low energy building directories, resources, tools, and membership services'
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
