'use client';

interface PlatformFilterProps {
  selected: string | null;
  onChange: (platform: string | null) => void;
}

const platforms = [
  {
    id: 'twitch',
    label: 'Twitch',
    activeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    activeClass: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  },
  {
    id: 'kick',
    label: 'Kick',
    activeClass: 'bg-green-500/20 text-green-400 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]',
  },
];

export default function PlatformFilter({ selected, onChange }: PlatformFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
            : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
        }`}
      >
        All
      </button>
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(selected === p.id ? null : p.id)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            selected === p.id
              ? p.activeClass
              : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
