'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { Snapshot } from '@/lib/types';

const timeRanges = [
  { label: '6h', hours: 6 },
  { label: '12h', hours: 12 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

interface ViewerChartProps {
  snapshots: Snapshot[];
}

export default function ViewerChart({ snapshots }: ViewerChartProps) {
  const [range, setRange] = useState(24);

  const data = useMemo(() => {
    const cutoff = Date.now() - range * 60 * 60 * 1000;
    return snapshots
      .filter((s) => new Date(s.collected_at).getTime() >= cutoff)
      .map((s) => ({
        time: formatTime(s.collected_at),
        rawTime: s.collected_at,
        viewers: s.viewer_count,
        chatters: s.chatter_count,
      }));
  }, [snapshots, range]);

  if (data.length === 0) {
    return (
      <div className="glass-card flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">No snapshot data available for this time range.</p>
      </div>
    );
  }

  return (
    <div className="glass-card relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Viewer &amp; Chatter Count
        </h3>
        <div className="flex gap-1.5">
          {timeRanges.map((r) => (
            <button
              key={r.hours}
              onClick={() => setRange(r.hours)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-200 ${
                range === r.hours
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'border border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1] hover:text-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="chatterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#f3f4f6',
              backdropFilter: 'blur(12px)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              formatNumber(value),
              name === 'viewers' ? 'Viewers' : 'Chatters',
            ]}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
            formatter={(value: string) =>
              value === 'viewers' ? 'Viewer Count' : 'Chatter Count'
            }
          />
          <Area
            type="monotone"
            dataKey="viewers"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#viewerGradient)"
            dot={false}
            activeDot={{ r: 4, stroke: '#06b6d4', strokeWidth: 2, fill: '#0a0e1a' }}
          />
          <Area
            type="monotone"
            dataKey="chatters"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#chatterGradient)"
            dot={false}
            activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#0a0e1a' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
