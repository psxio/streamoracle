'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/search/SearchBar';
import PlatformFilter from '@/components/search/PlatformFilter';
import { searchChannels } from '@/lib/api';
import type { Channel } from '@/lib/types';

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const platformBadge: Record<string, { bg: string; label: string }> = {
  twitch: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Twitch' },
  youtube: { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'YouTube' },
  kick: { bg: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Kick' },
};

const features = [
  {
    title: 'Track',
    description: 'Add any streamer from Twitch, YouTube, or Kick to begin collecting viewership data in real time.',
    borderColor: 'border-t-cyan-500',
    iconBg: 'bg-cyan-500/10',
    iconGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    icon: (
      <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
    title: 'Analyze',
    description: 'Seven independent detection signals examine viewer counts, chat patterns, growth anomalies, and statistical distributions.',
    borderColor: 'border-t-violet-500',
    iconBg: 'bg-violet-500/10',
    iconGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    icon: (
      <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Score',
    description: 'A weighted confidence score from 0-100 aggregates all signals into a single, transparent suspicion metric.',
    borderColor: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    icon: (
      <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export default function HomeContent() {
  const [platform, setPlatform] = useState<string | null>(null);
  const [trackedChannels, setTrackedChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchTracked() {
      try {
        const data = await searchChannels('a');
        if (!cancelled) setTrackedChannels(data.results);
      } catch {
        if (!cancelled) setTrackedChannels([]);
      } finally {
        if (!cancelled) setChannelsLoading(false);
      }
    }
    fetchTracked();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section
        className="relative flex w-full flex-col items-center overflow-hidden px-4 pb-20 pt-24 text-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      >
        {/* Floating orbs */}
        <div
          className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="pointer-events-none absolute right-1/4 top-1/3 h-96 w-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
            animation: 'float 12s ease-in-out infinite 2s',
          }}
        />

        <div className="animate-fade-in-up relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-gray-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Multi-platform viewership analysis
          </div>
          <h1 className="font-outfit max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              StreamOracle
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-400">
            Score, don&apos;t accuse.
          </p>
        </div>

        <div className="animate-fade-in-up relative z-10 mt-12 w-full max-w-2xl" style={{ animationDelay: '0.1s' }}>
          <SearchBar />
        </div>
        <div className="animate-fade-in-up relative z-10 mt-4" style={{ animationDelay: '0.15s' }}>
          <PlatformFilter selected={platform} onChange={setPlatform} />
        </div>
      </section>

      {/* How it works */}
      <section className="w-full px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-outfit mb-12 text-center text-2xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              How it works
            </span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`animate-fade-in-up rounded-xl border border-t-2 border-white/[0.06] ${f.borderColor} bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-white/[0.1] hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(6,182,212,0.06)]`}
                style={{ animationDelay: `${(i + 1) * 0.1}s` }}
              >
                <div className={`mb-4 inline-flex rounded-xl ${f.iconBg} ${f.iconGlow} p-3`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracked Channels */}
      <section className="w-full px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-outfit mb-8 text-center text-2xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Tracked Channels
            </span>
          </h2>

          {channelsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                      <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
                    </div>
                  </div>
                  <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ) : trackedChannels.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-sm text-gray-500">No channels tracked yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trackedChannels.map((channel, i) => {
                const badge = platformBadge[channel.platform] || {
                  bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                  label: channel.platform,
                };
                return (
                  <Link
                    key={`${channel.platform}-${channel.username}`}
                    href={`/channel/${channel.platform}/${channel.username}`}
                    className="animate-fade-in-up group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all hover:border-white/[0.1] hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(6,182,212,0.06)]"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-white/[0.06] ring-2 ring-transparent transition-all group-hover:ring-cyan-500/30">
                        {channel.avatar_url ? (
                          <img
                            src={channel.avatar_url}
                            alt={channel.display_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">
                            {channel.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-100">
                          {channel.display_name}
                        </p>
                        <p className="font-mono text-xs text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatFollowers(channel.follower_count)} followers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {channel.category && (
                        <span className="truncate pl-2 text-xs text-gray-500">
                          {channel.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-cyan-500 opacity-0 transition-opacity group-hover:opacity-100">
                      View Analysis
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Float animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}
