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
  const radius = 80;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="200" height="120" viewBox="0 0 200 120">
          {/* Background arc */}
          <path
            d="M 10 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke="#374151"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 110 A 80 80 0 0 1 190 110"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={`text-4xl font-bold ${getScoreColorClass(score)}`}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className={`text-lg font-semibold ${getScoreColorClass(score)}`}>
          {label}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Confidence: {Math.round(confidence * 100)}%
        </p>
      </div>
    </div>
  );
}
