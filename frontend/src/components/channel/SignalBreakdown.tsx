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

function getBarGlow(score: number): string {
  if (score <= 20) return 'shadow-[0_0_8px_rgba(34,197,94,0.4)]';
  if (score <= 40) return 'shadow-[0_0_8px_rgba(234,179,8,0.4)]';
  if (score <= 60) return 'shadow-[0_0_8px_rgba(249,115,22,0.4)]';
  if (score <= 80) return 'shadow-[0_0_8px_rgba(239,68,68,0.4)]';
  return 'shadow-[0_0_8px_rgba(220,38,38,0.4)]';
}

function getTextColor(score: number): string {
  if (score <= 20) return 'text-score-normal';
  if (score <= 40) return 'text-score-low';
  if (score <= 60) return 'text-score-moderate';
  if (score <= 80) return 'text-score-elevated';
  return 'text-score-high';
}

function getLeftBorderColor(score: number): string {
  if (score <= 20) return 'border-l-green-500/50';
  if (score <= 40) return 'border-l-yellow-500/50';
  if (score <= 60) return 'border-l-orange-500/50';
  if (score <= 80) return 'border-l-red-500/50';
  return 'border-l-red-600/50';
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
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-[1fr_60px_60px_60px_100px] gap-2 border-b border-white/[0.06] px-5 py-3.5 text-xs uppercase tracking-wider text-gray-500 sm:grid-cols-[1fr_60px_60px_80px_100px]">
        <span>Signal</span>
        <span className="text-right">Score</span>
        <span className="text-right">Weight</span>
        <span className="hidden text-right sm:block">Conf.</span>
        <span>Progress</span>
      </div>

      {/* Rows */}
      {signals.map((signal) => {
        const key = signal.name.toLowerCase().replace(/[^a-z]/g, '_');
        const isExpanded = expanded === signal.name;

        return (
          <div key={signal.name} className="border-b border-white/[0.04] last:border-0">
            <button
              onClick={() => setExpanded(isExpanded ? null : signal.name)}
              className={`grid w-full grid-cols-[1fr_60px_60px_60px_100px] items-center gap-2 border-l-2 border-l-transparent px-5 py-3.5 text-left transition-all duration-200 hover:bg-white/[0.03] sm:grid-cols-[1fr_60px_60px_80px_100px] ${
                isExpanded ? getLeftBorderColor(signal.score) + ' bg-white/[0.02]' : 'hover:' + getLeftBorderColor(signal.score)
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-200">
                <svg
                  className={`h-3 w-3 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
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
              <span
                className={`text-right text-sm font-bold ${getTextColor(signal.score)}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {Math.round(signal.score)}
              </span>
              <span
                className="text-right text-sm text-gray-400"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {signal.weight.toFixed(1)}
              </span>
              <span
                className="hidden text-right text-sm text-gray-400 sm:block"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {Math.round(signal.confidence * 100)}%
              </span>
              <span>
                <span className="block h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className={`block h-full rounded-full transition-all duration-700 ${getBarColor(signal.score)} ${getBarGlow(signal.score)}`}
                    style={{ width: `${Math.min(signal.score, 100)}%` }}
                  />
                </span>
              </span>
            </button>

            {isExpanded && (
              <div className="mx-5 mb-4 mt-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-sm text-gray-400">
                  {signalDescriptions[key] || 'Signal analysis details.'}
                </p>
                {Object.keys(signal.details).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(signal.details).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-gray-300"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
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
