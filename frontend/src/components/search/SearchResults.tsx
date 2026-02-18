'use client';

import Link from 'next/link';
import type { Channel } from '@/lib/types';

const platformBadge: Record<string, { bg: string; label: string }> = {
  twitch: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Twitch' },
  youtube: { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'YouTube' },
  kick: { bg: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Kick' },
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

interface SearchResultsProps {
  results: Channel[];
  loading: boolean;
  onSelect: () => void;
}

export default function SearchResults({ results, loading, onSelect }: SearchResultsProps) {
  if (loading && results.length === 0) {
    return (
      <div className="absolute top-full z-40 mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#0f1629]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/[0.1] border-t-cyan-500" />
          Searching...
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="absolute top-full z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0f1629]/95 shadow-2xl backdrop-blur-xl">
      {results.map((channel) => {
        const badge = platformBadge[channel.platform] || {
          bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          label: channel.platform,
        };
        return (
          <Link
            key={`${channel.platform}-${channel.username}`}
            href={`/channel/${channel.platform}/${channel.username}`}
            onClick={onSelect}
            className="group flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/[0.04] hover:shadow-[inset_0_0_30px_rgba(6,182,212,0.03)]"
          >
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-white/[0.06] ring-2 ring-transparent transition-all group-hover:ring-cyan-500/30">
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
              <div className="flex items-center gap-2">
                {channel.category && (
                  <p className="truncate text-xs text-gray-500">{channel.category}</p>
                )}
              </div>
            </div>
            <span
              className="font-mono text-xs text-gray-500"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatFollowers(channel.follower_count)}
            </span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.bg}`}
            >
              {badge.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
