'use client';

import Link from 'next/link';
import type { Channel } from '@/lib/types';

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-600',
  youtube: 'bg-red-600',
  kick: 'bg-green-600',
};

interface SearchResultsProps {
  results: Channel[];
  loading: boolean;
  onSelect: () => void;
}

export default function SearchResults({ results, loading, onSelect }: SearchResultsProps) {
  if (loading && results.length === 0) {
    return (
      <div className="absolute top-full z-40 mt-2 w-full rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-purple-500" />
          Searching...
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="absolute top-full z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
      {results.map((channel) => (
        <Link
          key={`${channel.platform}-${channel.username}`}
          href={`/channel/${channel.platform}/${channel.username}`}
          onClick={onSelect}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-800"
        >
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-700">
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
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-gray-100">
              {channel.display_name}
            </p>
            {channel.category && (
              <p className="truncate text-xs text-gray-500">{channel.category}</p>
            )}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              platformColors[channel.platform] || 'bg-gray-600'
            }`}
          >
            {channel.platform}
          </span>
        </Link>
      ))}
    </div>
  );
}
