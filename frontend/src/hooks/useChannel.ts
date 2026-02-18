'use client';

import { useState, useEffect } from 'react';
import type { ChannelDetail, Snapshot, AnalysisResult } from '@/lib/types';
import { getChannel, getSnapshots, getAnalysis } from '@/lib/api';

interface UseChannelReturn {
  channel: ChannelDetail | null;
  snapshots: Snapshot[];
  analysis: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function useChannel(
  platform: string,
  username: string
): UseChannelReturn {
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platform || !username) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const [channelData, snapshotData] = await Promise.all([
          getChannel(platform, username),
          getSnapshots(platform, username),
        ]);

        if (cancelled) return;
        setChannel(channelData);
        setSnapshots(snapshotData);

        try {
          const analysisData = await getAnalysis(platform, username);
          if (!cancelled) setAnalysis(analysisData);
        } catch {
          // Analysis may not exist yet
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load channel'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [platform, username]);

  return { channel, snapshots, analysis, loading, error };
}
