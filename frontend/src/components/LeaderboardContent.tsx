'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/types';
import PlatformFilter from '@/components/search/PlatformFilter';
import CategoryFilter from '@/components/leaderboard/CategoryFilter';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

export default function LeaderboardContent() {
  const [platform, setPlatform] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = Array.from(
    new Set(
      entries
        .map((e) => e.channel.category)
        .filter((c): c is string => c !== null && c !== undefined)
    )
  ).sort();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const data = await getLeaderboard(
          platform || undefined,
          category || undefined,
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
  }, [platform, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Suspicion Leaderboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Channels ranked by suspicion score. Higher scores indicate more anomalous patterns.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PlatformFilter selected={platform} onChange={setPlatform} />
        <CategoryFilter
          categories={categories}
          selected={category}
          onChange={setCategory}
        />
      </div>

      <LeaderboardTable entries={entries} loading={loading} />
    </div>
  );
}
