'use client';

import { useState, useEffect } from 'react';
import type { Channel } from '@/lib/types';
import { searchChannels } from '@/lib/api';

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: Channel[];
  loading: boolean;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchChannels(query.trim());
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      setLoading(false);
    };
  }, [query]);

  return { query, setQuery, results, loading };
}
