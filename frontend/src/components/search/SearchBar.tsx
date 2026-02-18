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
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
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
          placeholder="Search for a streamer..."
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-4 pl-12 pr-4 text-lg text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-purple-500" />
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
