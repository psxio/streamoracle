'use client';

import { useState } from 'react';
import SearchBar from '@/components/search/SearchBar';
import PlatformFilter from '@/components/search/PlatformFilter';

const features = [
  {
    title: 'Track',
    description: 'Add any streamer from Twitch, YouTube, or Kick to begin collecting viewership data in real time.',
    icon: (
      <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
    title: 'Analyze',
    description: 'Seven independent detection signals examine viewer counts, chat patterns, growth anomalies, and statistical distributions.',
    icon: (
      <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Score',
    description: 'A weighted confidence score from 0-100 aggregates all signals into a single, transparent suspicion metric.',
    icon: (
      <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export default function HomeContent() {
  const [platform, setPlatform] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 pb-16 pt-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-1.5 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          Multi-platform viewership analysis
        </div>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            StreamOracle
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-400">
          Transparent, data-driven viewership analysis across Twitch, YouTube, and Kick.
          Score, don&apos;t accuse.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <SearchBar />
        </div>
        <div className="mt-4">
          <PlatformFilter selected={platform} onChange={setPlatform} />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full border-t border-gray-800 bg-gray-900/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-100">
            How it works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-800 bg-gray-950/50 p-6 transition-colors hover:border-gray-700"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent analyses placeholder */}
      <section className="w-full px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-100">
            Recent analyses
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-800 bg-gray-900/30 p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-800" />
                  </div>
                </div>
                <div className="h-3 w-full animate-pulse rounded bg-gray-800" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-800" />
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-gray-600">
            Track a channel to begin generating analyses.
          </p>
        </div>
      </section>
    </div>
  );
}
