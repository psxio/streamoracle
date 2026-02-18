import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreamOracle',
  description: 'Multi-platform viewership analysis oracle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
