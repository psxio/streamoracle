'use client';

import Link from 'next/link';
import type { LeaderboardEntry } from '@/lib/types';

function getScoreColorClass(score: number): string {
  if (score <= 20) return 'text-score-normal';
  if (score <= 40) return 'text-score-low';
  if (score <= 60) return 'text-score-moderate';
  if (score <= 80) return 'text-score-elevated';
  return 'text-score-high';
}

function getLabelBadge(label: string): string {
  switch (label.toLowerCase()) {
    case 'normal':
      return 'bg-green-900/30 text-score-normal border-green-800';
    case 'low':
      return 'bg-yellow-900/30 text-score-low border-yellow-800';
    case 'moderate':
      return 'bg-orange-900/30 text-score-moderate border-orange-800';
    case 'elevated':
      return 'bg-red-900/30 text-score-elevated border-red-800';
    case 'high':
      return 'bg-red-950/30 text-score-high border-red-700';
    default:
      return 'bg-gray-800 text-gray-400 border-gray-700';
  }
}

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-600',
  youtube: 'bg-red-600',
  kick: 'bg-green-600',
};

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading: boolean;
}

export default function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-800/50" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-gray-800">
        <p className="text-sm text-gray-500">No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-left">Platform</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-left">Label</th>
              <th className="hidden px-4 py-3 text-left md:table-cell">Category</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`${entry.platform}-${entry.username}`} className="group">
                <td className="p-0" colSpan={6}>
                  <Link
                    href={`/channel/${entry.platform}/${entry.username}`}
                    className="flex items-center border-b border-gray-800/50 transition-colors hover:bg-gray-800/30"
                  >
                    <span className="w-16 px-4 py-3 text-sm font-medium text-gray-400">
                      #{entry.rank}
                    </span>
                    <span className="flex flex-1 items-center gap-3 px-4 py-3">
                      <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-700">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            alt={entry.display_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                            {entry.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium text-gray-200">
                        {entry.display_name}
                      </span>
                    </span>
                    <span className="w-24 px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                          platformColors[entry.platform] || 'bg-gray-600'
                        }`}
                      >
                        {entry.platform}
                      </span>
                    </span>
                    <span
                      className={`w-20 px-4 py-3 text-right text-sm font-bold ${getScoreColorClass(
                        entry.overall_score
                      )}`}
                    >
                      {Math.round(entry.overall_score)}
                    </span>
                    <span className="w-28 px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getLabelBadge(
                          entry.label
                        )}`}
                      >
                        {entry.label}
                      </span>
                    </span>
                    <span className="hidden w-40 truncate px-4 py-3 text-xs text-gray-500 md:block">
                      {entry.category || '-'}
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
