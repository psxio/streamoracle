'use client';

import { useParams } from 'next/navigation';
import { useChannel } from '@/hooks/useChannel';
import { trackChannel } from '@/lib/api';
import ScoreGauge from '@/components/channel/ScoreGauge';
import SignalBreakdown from '@/components/channel/SignalBreakdown';
import ViewerChart from '@/components/channel/ViewerChart';
import { useState } from 'react';

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-600',
  youtube: 'bg-red-600',
  kick: 'bg-green-600',
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
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gray-800" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-gray-800/50" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-800/50" />
        </div>
        <div className="mt-6 h-80 animate-pulse rounded-xl bg-gray-800/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-300">Channel not found</h2>
          <p className="mt-2 text-sm text-gray-500">
            This channel hasn&apos;t been tracked yet, or the platform/username is incorrect.
          </p>
          <button
            onClick={handleTrack}
            disabled={tracking}
            className="mt-6 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {tracking ? 'Tracking...' : `Track ${username} on ${platform}`}
          </button>
          {trackError && (
            <p className="mt-2 text-xs text-red-400">{trackError}</p>
          )}
        </div>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-700">
            {channel.avatar_url ? (
              <img
                src={channel.avatar_url}
                alt={channel.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
                {channel.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-100">
                {channel.display_name}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                  platformColors[channel.platform] || 'bg-gray-600'
                }`}
              >
                {channel.platform}
              </span>
              {channel.is_live && (
                <span className="flex items-center gap-1 rounded-full bg-red-600/20 px-2 py-0.5 text-xs font-medium text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  LIVE
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              {channel.category && <span>{channel.category}</span>}
              {channel.follower_count > 0 && (
                <span>
                  {channel.follower_count.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
        {!analysis && (
          <button
            onClick={handleTrack}
            disabled={tracking}
            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {tracking ? 'Tracking...' : 'Track this channel'}
          </button>
        )}
      </div>

      {/* Analysis */}
      {analysis ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900/30 p-8">
              <ScoreGauge
                score={analysis.overall_score}
                label={analysis.label}
                confidence={analysis.confidence}
              />
            </div>
            <div>
              <SignalBreakdown signals={analysis.signal_scores} />
            </div>
          </div>
          <div className="mt-2 text-right text-xs text-gray-600">
            Based on {analysis.data_points} data points | Last analyzed:{' '}
            {new Date(analysis.analyzed_at).toLocaleString()}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">
            No analysis available yet. Data is still being collected.
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="mt-6">
        <ViewerChart snapshots={snapshots} />
      </div>
    </div>
  );
}
