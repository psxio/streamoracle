'use client';

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          selected === null
            ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
            : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
            selected === cat
              ? 'border-violet-500/40 bg-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
              : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:border-white/[0.1] hover:bg-white/[0.04]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
