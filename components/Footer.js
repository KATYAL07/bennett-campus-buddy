import Link from 'next/link';
import { APP_CONFIG } from '@/lib/config';

export default function Footer() {
  // Planted Flaw: Footer not stuck to bottom on short pages (no flex-grow container with mt-auto)
  return (
    <footer className="border-t border-stone-200 bg-white mt-16 py-8 text-sm text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">{APP_CONFIG.name}</span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-700">{APP_CONFIG.institution}</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Curated for Hacktoberfest by {APP_CONFIG.maintainer} ({APP_CONFIG.maintainerRole}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-600">
            <Link href="/privacy" className="hover:text-emerald-800 transition">
              Privacy Policy
            </Link>
            <Link href="/contacts" className="hover:text-emerald-800 transition">
              Useful Contacts
            </Link>
            <Link href="/feed" className="hover:text-emerald-800 transition">
              Study Resources
            </Link>
            <Link href="/chat" className="hover:text-emerald-800 transition">
              Campus Lounge
            </Link>
            <a
              href="https://github.com/KATYAL07/campus-buddy"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-800 font-semibold hover:underline"
            >
              GitHub Repository
            </a>
          </div>
        </div>

        <div className="border-t border-stone-100 mt-6 pt-4 text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Bennett University GDG On Campus. Open source under MIT License.</span>
          <span>Built for student collaboration and open source learning.</span>
        </div>
      </div>
    </footer>
  );
}
