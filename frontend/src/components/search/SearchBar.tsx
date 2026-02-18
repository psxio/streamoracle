'use client';

import { useRef, useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import SearchResults from './SearchResults';

export default function SearchBar() {
  const { query, setQuery, results, loading } = useSearch();
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showResults = focused && (results.length > 0 || loading) && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <svg
          className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search any streamer across Twitch, YouTube, and Kick..."
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pl-14 pr-14 text-lg text-gray-100 placeholder-gray-500 outline-none backdrop-blur-sm transition-all focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/[0.1] border-t-cyan-500" />
          </div>
        )}
      </div>

      {showResults && (
        <SearchResults
          results={results}
          loading={loading}
          onSelect={() => {
            setFocused(false);
            setQuery('');
          }}
        />
      )}
    </div>
  );
}
