'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/methodology', label: 'Methodology' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const isDark = stored ? stored === 'dark' : true;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  }

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              StreamOracle
            </span>
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-purple-500"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            StreamOracle
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-gray-100"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-800 px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-gray-400 transition-colors hover:text-gray-100"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="mt-2 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100"
          >
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
}
