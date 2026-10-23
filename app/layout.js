import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { isDemoMode } from '@/lib/db';
import { APP_CONFIG } from '@/lib/config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Planted flaw: Missing Open Graph metadata (og:title, og:description, og:image, og:url)
export const metadata = {
  title: `${APP_CONFIG.name} | Bennett University Student Collaboration Hub`,
  description: 'Academic notes, previous year question papers (PYQs), club events, peer help board, and global campus lounge for Bennett University students.',
};

export default async function RootLayout({ children }) {
  const currentUser = await getCurrentUser();
  const demoActive = isDemoMode();

  return (
    <html lang="en">
      <head>
        {/* Planted flaw: placeholder generic SVG favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </head>
      <body className="bg-stone-50 text-stone-900 min-h-screen flex flex-col">
        <Navbar currentUser={currentUser} isDemo={demoActive} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
