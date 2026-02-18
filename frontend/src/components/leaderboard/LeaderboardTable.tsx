'use client';

import Link from 'next/link';
import type { LeaderboardEntry } from '@/lib/types';

function getScoreColor(score: number): string {
  if (score <= 20) return 'text-green-400';
  if (score <= 40) return 'text-yellow-400';
  if (score <= 60) return 'text-orange-400';
  if (score <= 80) return 'text-red-400';
  return 'text-red-500';
}

function getScoreGlow(score: number): string {
  if (score <= 20) return 'shadow-[0_0_10px_rgba(74,222,128,0.2)]';
  if (score <= 40) return 'shadow-[0_0_10px_rgba(250,204,21,0.2)]';
  if (score <= 60) return 'shadow-[0_0_10px_rgba(251,146,60,0.2)]';
  if (score <= 80) return 'shadow-[0_0_10px_rgba(248,113,113,0.2)]';
  return 'shadow-[0_0_10px_rgba(239,68,68,0.3)]';
}

function getLabelBadge(label: string): string {
  switch (label.toLowerCase()) {
    case 'normal':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'low':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'moderate':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'elevated':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'high':
      return 'bg-red-500/15 text-red-500 border-red-500/25';
    default:
      return 'bg-white/[0.04] text-gray-400 border-white/[0.08]';
  }
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'text-amber-400 font-bold';
  if (rank === 2) return 'text-gray-300 font-bold';
  if (rank === 3) return 'text-amber-600 font-bold';
  return 'text-gray-500';
}

function getRankIcon(rank: number): string | null {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

const platformBadge: Record<string, { bg: string; label: string }> = {
  twitch: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Twitch' },
  youtube: { bg: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'YouTube' },
  kick: { bg: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Kick' },
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
          <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <p className="text-sm text-gray-500">No leaderboard data available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-4 text-left">Rank</th>
              <th className="px-5 py-4 text-left">Channel</th>
              <th className="px-5 py-4 text-left">Platform</th>
              <th className="px-5 py-4 text-right">Score</th>
              <th className="px-5 py-4 text-left">Label</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const badge = platformBadge[entry.platform] || {
                bg: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                label: entry.platform,
              };
              const rankIcon = getRankIcon(entry.rank);
              return (
                <tr
                  key={`${entry.platform}-${entry.username}`}
                  className={`group ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="p-0" colSpan={5}>
                    <Link
                      href={`/channel/${entry.platform}/${entry.username}`}
                      className="flex items-center border-b border-white/[0.03] transition-all hover:bg-white/[0.03] hover:shadow-[inset_3px_0_0_0_rgba(6,182,212,0.5)]"
                    >
                      <span className={`w-20 px-5 py-4 text-sm ${getRankStyle(entry.rank)}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {rankIcon ? (
                          <span className="mr-1">{rankIcon}</span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </span>
                      <span className="flex flex-1 items-center gap-3 px-5 py-4">
                        <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-white/[0.06] ring-2 ring-transparent transition-all group-hover:ring-cyan-500/20">
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
                      <span className="w-28 px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </span>
                      <span className="w-24 px-5 py-4 text-right">
                        <span
                          className={`inline-flex rounded-lg px-2 py-0.5 text-sm font-bold ${getScoreColor(entry.overall_score)} ${getScoreGlow(entry.overall_score)}`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {Math.round(entry.overall_score)}
                        </span>
                      </span>
                      <span className="w-28 px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getLabelBadge(entry.label)}`}
                        >
                          {entry.label}
                        </span>
                      </span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
