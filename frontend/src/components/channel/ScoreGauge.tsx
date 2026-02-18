'use client';

interface ScoreGaugeProps {
  score: number;
  label: string;
  confidence: number;
}

function getScoreColor(score: number): string {
  if (score <= 20) return '#22c55e';
  if (score <= 40) return '#eab308';
  if (score <= 60) return '#f97316';
  if (score <= 80) return '#ef4444';
  return '#dc2626';
}

function getScoreColorClass(score: number): string {
  if (score <= 20) return 'text-score-normal';
  if (score <= 40) return 'text-score-low';
  if (score <= 60) return 'text-score-moderate';
  if (score <= 80) return 'text-score-elevated';
  return 'text-score-high';
}

export default function ScoreGauge({ score, label, confidence }: ScoreGaugeProps) {
  const radius = 100;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Radial glow behind gauge */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        />
        <svg width="250" height="150" viewBox="0 0 250 150">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background arc */}
          <path
            d="M 25 135 A 100 100 0 0 1 225 135"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Score arc with glow */}
          <path
            d="M 25 135 A 100 100 0 0 1 225 135"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            filter="url(#glow)"
            className="animate-[gaugeStroke_1.2s_ease-out_forwards]"
            style={{
              strokeDashoffset: 0,
            }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <span
            className={`text-5xl font-bold ${getScoreColorClass(score)}`}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p
          className={`text-lg font-semibold ${getScoreColorClass(score)}`}
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {label}
        </p>
        <div className="h-px w-16 bg-white/[0.06]" />
        <p className="text-xs text-gray-500">
          Confidence:{' '}
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {Math.round(confidence * 100)}%
          </span>
        </p>
      </div>
    </div>
  );
}
