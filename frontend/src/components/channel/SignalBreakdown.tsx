'use client';

import { useState } from 'react';
import type { SignalScore } from '@/lib/types';

function getBarColor(score: number): string {
  if (score <= 20) return 'bg-score-normal';
  if (score <= 40) return 'bg-score-low';
  if (score <= 60) return 'bg-score-moderate';
  if (score <= 80) return 'bg-score-elevated';
  return 'bg-score-high';
}

function getTextColor(score: number): string {
  if (score <= 20) return 'text-score-normal';
  if (score <= 40) return 'text-score-low';
  if (score <= 60) return 'text-score-moderate';
  if (score <= 80) return 'text-score-elevated';
  return 'text-score-high';
}

const signalDescriptions: Record<string, string> = {
  cvr: 'Chatter-to-Viewer Ratio: compares unique chatters against reported viewer count.',
  step_function: 'Detects sudden, unnatural jumps in viewer count.',
  chat_entropy: 'Measures diversity and naturalness of chat messages.',
  follower_ratio: 'Analyzes the relationship between followers and concurrent viewers.',
  growth: 'Evaluates channel growth patterns for anomalies.',
  benfords_law: "Tests viewer count digit distribution against Benford's Law.",
  temporal_pattern: 'Examines viewer count patterns over time for regularity.',
};

interface SignalBreakdownProps {
  signals: SignalScore[];
}

export default function SignalBreakdown({ signals }: SignalBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-800">
      {/* Header */}
      <div className="grid grid-cols-[1fr_60px_60px_60px_100px] gap-2 border-b border-gray-800 bg-gray-900/50 px-4 py-3 text-xs uppercase tracking-wider text-gray-500 sm:grid-cols-[1fr_60px_60px_80px_100px]">
        <span>Signal</span>
        <span className="text-right">Score</span>
        <span className="text-right">Weight</span>
        <span className="hidden text-right sm:block">Confidence</span>
        <span>Progress</span>
      </div>

      {/* Rows */}
      {signals.map((signal) => {
        const key = signal.name.toLowerCase().replace(/[^a-z]/g, '_');
        const isExpanded = expanded === signal.name;

        return (
          <div key={signal.name} className="border-b border-gray-800/50 last:border-0">
            <button
              onClick={() => setExpanded(isExpanded ? null : signal.name)}
              className="grid w-full grid-cols-[1fr_60px_60px_60px_100px] items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-gray-800/30 sm:grid-cols-[1fr_60px_60px_80px_100px]"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
                <svg
                  className={`h-3 w-3 flex-shrink-0 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate">{signal.name}</span>
              </span>
              <span className={`text-right text-sm font-bold ${getTextColor(signal.score)}`}>
                {Math.round(signal.score)}
              </span>
              <span className="text-right text-sm text-gray-400">
                {signal.weight.toFixed(1)}
              </span>
              <span className="hidden text-right text-sm text-gray-400 sm:block">
                {Math.round(signal.confidence * 100)}%
              </span>
              <span>
                <span className="block h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ${getBarColor(signal.score)}`}
                    style={{ width: `${Math.min(signal.score, 100)}%` }}
                  />
                </span>
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-800/30 bg-gray-900/30 px-4 py-3">
                <p className="text-sm text-gray-400">
                  {signalDescriptions[key] || 'Signal analysis details.'}
                </p>
                {Object.keys(signal.details).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(signal.details).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300"
                      >
                        {k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
