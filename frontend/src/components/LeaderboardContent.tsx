'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/types';
import PlatformFilter from '@/components/search/PlatformFilter';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardContent() {
  const [platform, setPlatform] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const data = await getLeaderboard(
          platform || undefined,
          undefined,
          100
        );
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [platform]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-outfit text-3xl font-bold">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Suspicion Leaderboard
          </span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Channels ranked by suspicion score. Higher scores indicate more anomalous patterns.
        </p>
      </div>

      {/* Stats bar */}
      <div className="mb-6 flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 backdrop-blur-sm">
          <span className="text-xs text-gray-500">Total tracked:</span>
          <span
            className="text-sm font-bold text-cyan-400"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {loading ? '...' : entries.length}
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <PlatformFilter selected={platform} onChange={setPlatform} />
      </div>

      {/* Table */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <LeaderboardTable entries={entries} loading={loading} />
      </div>
    </div>
  );
}
