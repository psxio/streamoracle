'use client';

interface PlatformFilterProps {
  selected: string | null;
  onChange: (platform: string | null) => void;
}

const platforms = [
  { id: 'twitch', label: 'Twitch', color: 'bg-purple-600 hover:bg-purple-700', activeRing: 'ring-purple-500' },
  { id: 'youtube', label: 'YouTube', color: 'bg-red-600 hover:bg-red-700', activeRing: 'ring-red-500' },
  { id: 'kick', label: 'Kick', color: 'bg-green-600 hover:bg-green-700', activeRing: 'ring-green-500' },
];

export default function PlatformFilter({ selected, onChange }: PlatformFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? 'bg-gray-700 text-white ring-2 ring-gray-500'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
        }`}
      >
        All
      </button>
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(selected === p.id ? null : p.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-all ${p.color} ${
            selected === p.id ? `ring-2 ${p.activeRing}` : 'opacity-70 hover:opacity-100'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
