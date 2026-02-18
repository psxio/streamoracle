'use client';

import { useParams } from 'next/navigation';
import { useChannel } from '@/hooks/useChannel';
import { trackChannel } from '@/lib/api';
import ScoreGauge from '@/components/channel/ScoreGauge';
import SignalBreakdown from '@/components/channel/SignalBreakdown';
import ViewerChart from '@/components/channel/ViewerChart';
import { useState } from 'react';

const platformColors: Record<string, string> = {
  twitch: 'ring-purple-500',
  youtube: 'ring-red-500',
  kick: 'ring-green-500',
};

const platformBadgeColors: Record<string, string> = {
  twitch: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  youtube: 'bg-red-500/20 text-red-300 border-red-500/30',
  kick: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function ChannelContent() {
  const params = useParams<{ platform: string; username: string }>();
  const platform = params.platform;
  const username = params.username;
  const { channel, snapshots, analysis, loading, error } = useChannel(platform, username);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  async function handleTrack() {
    setTracking(true);
    setTrackError(null);
    try {
      await trackChannel(platform, username);
      window.location.reload();
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : 'Failed to track channel');
    } finally {
      setTracking(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Loading header */}
        <div className="mb-10 flex items-center gap-6">
          <div className="h-20 w-20 animate-pulse rounded-full bg-white/[0.04] ring-2 ring-white/[0.06]" />
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.04]" />
            <div className="flex gap-3">
              <div className="h-5 w-20 animate-pulse rounded-full bg-white/[0.04]" />
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/[0.04]" />
            </div>
          </div>
        </div>
        {/* Loading cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card flex h-72 items-center justify-center">
            <div className="h-36 w-36 animate-pulse rounded-full bg-white/[0.03]" />
          </div>
          <div className="glass-card h-72 p-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
                  <div className="h-2.5 flex-1 animate-pulse rounded-full bg-white/[0.04]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-card mt-6 h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 animate-fade-in-up">
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03]">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-200" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Channel not found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            This channel hasn&apos;t been tracked yet, or the platform/username is incorrect.
          </p>
          <button
            onClick={handleTrack}
            disabled={tracking}
            className="mt-8 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:opacity-50"
          >
            {tracking ? 'Tracking...' : `Track ${username} on ${platform}`}
          </button>
          {trackError && (
            <p className="mt-3 text-xs text-red-400">{trackError}</p>
          )}
        </div>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <div className="flex items-center gap-5">
          <div
            className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-full ring-2 ${
              platformColors[channel.platform] || 'ring-gray-600'
            } ring-offset-2 ring-offset-[#0a0e1a]`}
          >
            {channel.avatar_url ? (
              <img
                src={channel.avatar_url}
                alt={channel.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.04] text-2xl font-bold text-gray-400">
                {channel.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl font-bold text-gray-100"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {channel.display_name}
              </h1>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  platformBadgeColors[channel.platform] || 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                }`}
              >
                {channel.platform}
              </span>
              {channel.is_live && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  LIVE
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              {channel.follower_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.208V17.5a2.25 2.25 0 012.25-2.25h.894c.572 0 1.065-.38 1.178-.943.162-.805.39-1.583.684-2.325M15 19.128l.842-1.37M12 9.75a3 3 0 11-6 0 3 3 0 016 0zm8.25 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {channel.follower_count.toLocaleString()}
                  </span>
                  followers
                </span>
              )}
              {channel.category && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h6m-6 0h6m-6-7.5h6" />
                  </svg>
                  {channel.category}
                </span>
              )}
            </div>
          </div>
        </div>
        {!analysis && (
          <button
            onClick={handleTrack}
            disabled={tracking}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 hover:brightness-110 disabled:opacity-50"
          >
            {tracking ? 'Tracking...' : 'Track this channel'}
          </button>
        )}
      </div>

      {/* Analysis */}
      {analysis ? (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card relative overflow-hidden p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                Suspicion Score
              </h3>
              <div className="flex items-center justify-center">
                <ScoreGauge
                  score={analysis.overall_score}
                  label={analysis.label}
                  confidence={analysis.confidence}
                />
              </div>
            </div>
            <div className="glass-card relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <SignalBreakdown signals={analysis.signal_scores} />
            </div>
          </div>
          <div className="mt-3 text-right text-xs text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {analysis.data_points} data points | Last analyzed:{' '}
            {new Date(analysis.analyzed_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="glass-card animate-fade-in-up p-16 text-center" style={{ animationDelay: '0.1s' }}>
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03]">
            <svg className="h-6 w-6 text-cyan-500/50 animate-glow-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            No analysis available yet. Data is still being collected.
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Analysis will begin once enough data points are gathered.
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <ViewerChart snapshots={snapshots} />
      </div>
    </div>
  );
}
