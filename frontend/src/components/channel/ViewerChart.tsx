'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/30">
        <p className="text-sm text-gray-500">No snapshot data available for this time range.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Viewer & Chatter Count</h3>
        <div className="flex gap-1">
          {timeRanges.map((r) => (
            <button
              key={r.hours}
              onClick={() => setRange(r.hours)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === r.hours
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#4b5563' }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#4b5563' }}
            axisLine={{ stroke: '#4b5563' }}
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value: number, name: string) => [
              formatNumber(value),
              name === 'viewers' ? 'Viewers' : 'Chatters',
            ]}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af' }}
            formatter={(value: string) =>
              value === 'viewers' ? 'Viewer Count' : 'Chatter Count'
            }
          />
          <Line
            type="monotone"
            dataKey="viewers"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="chatters"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
