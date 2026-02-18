const signals = [
  {
    name: 'Chatter-to-Viewer Ratio (CVR)',
    weight: 1.5,
    description:
      'Compares the number of unique chatters to the reported viewer count. Legitimate streams typically have a consistent ratio of active chatters, while artificially inflated streams show very low engagement relative to viewers.',
    detects: 'Inflated viewer counts with low chat engagement',
  },
  {
    name: 'Step Function Detection',
    weight: 1.2,
    description:
      'Identifies sudden, sharp jumps or drops in viewer count that occur without natural ramp-up. Organic viewership changes tend to be gradual, following discovery and sharing patterns.',
    detects: 'Sudden, unnatural viewer count changes',
  },
  {
    name: 'Chat Entropy',
    weight: 1.0,
    description:
      'Measures the diversity and randomness of chat messages. Genuine chat exhibits varied vocabulary, sentence structure, and timing. Low entropy suggests repetitive or scripted messages.',
    detects: 'Scripted, repetitive, or bot-generated chat messages',
  },
  {
    name: 'Follower Ratio',
    weight: 0.8,
    description:
      'Analyzes the relationship between follower count and concurrent viewers. Channels with unusually high viewer-to-follower ratios may be receiving artificial viewers.',
    detects: 'Viewer count disproportionate to follower base',
  },
  {
    name: 'Growth Analysis',
    weight: 0.8,
    description:
      'Evaluates channel growth trajectory over time. Natural growth follows discoverable patterns tied to content, raids, and platform promotion. Anomalous growth can indicate artificial inflation.',
    detects: 'Unnatural growth spikes and trajectories',
  },
  {
    name: "Benford's Law",
    weight: 0.7,
    description:
      "Tests the distribution of leading digits in viewer counts against Benford's Law, a mathematical principle that naturally occurring numbers follow a specific frequency distribution. Artificial numbers tend to deviate significantly.",
    detects: 'Statistically improbable viewer count patterns',
  },
  {
    name: 'Temporal Pattern',
    weight: 1.0,
    description:
      'Examines how viewer counts change over time, looking for suspiciously regular patterns, flat lines, or mathematically perfect curves that differ from organic viewership behavior.',
    detects: 'Artificially stable or patterned viewer counts',
  },
];

const labels = [
  { range: '0 - 20', label: 'Normal', color: 'text-score-normal', bg: 'bg-green-500/5', border: 'border-l-green-500/40' },
  { range: '21 - 40', label: 'Low', color: 'text-score-low', bg: 'bg-yellow-500/5', border: 'border-l-yellow-500/40' },
  { range: '41 - 60', label: 'Moderate', color: 'text-score-moderate', bg: 'bg-orange-500/5', border: 'border-l-orange-500/40' },
  { range: '61 - 80', label: 'Elevated', color: 'text-score-elevated', bg: 'bg-red-500/5', border: 'border-l-red-500/40' },
  { range: '81 - 100', label: 'High', color: 'text-score-high', bg: 'bg-red-600/5', border: 'border-l-red-600/40' },
];

const signalAccents = [
  'border-t-cyan-500/40',
  'border-t-violet-500/40',
  'border-t-amber-500/40',
  'border-t-cyan-500/40',
  'border-t-violet-500/40',
  'border-t-amber-500/40',
  'border-t-cyan-500/40',
];

const weightPillColors = [
  'bg-cyan-500/15 text-cyan-400',
  'bg-violet-500/15 text-violet-400',
  'bg-amber-500/15 text-amber-400',
  'bg-cyan-500/15 text-cyan-400',
  'bg-violet-500/15 text-violet-400',
  'bg-amber-500/15 text-amber-400',
  'bg-cyan-500/15 text-cyan-400',
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="animate-fade-in-up">
        <h1
          className="text-gradient text-3xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Methodology
        </h1>
        <p className="mt-3 text-gray-400">
          How StreamOracle analyzes viewership data to produce suspicion scores.
        </p>
      </div>

      {/* Philosophy */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Philosophy
        </h2>
        <div className="glass-card mt-4 border-l-2 border-l-cyan-500/40 p-6">
          <p className="text-sm leading-relaxed text-gray-300">
            StreamOracle follows the principle of <strong className="text-gray-100">&quot;Score, don&apos;t accuse.&quot;</strong>{' '}
            Suspicion scores are statistical indicators based on data patterns, not definitive
            proof of manipulation. Many legitimate factors can influence scores, including raids,
            embeds, events, and platform promotions. Always consider context when interpreting results.
          </p>
        </div>
      </section>

      {/* Signals */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Detection Signals
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Seven independent signals each produce a score from 0 to 100.
        </p>
        <div className="mt-6 space-y-4">
          {signals.map((signal, i) => (
            <div
              key={signal.name}
              className={`glass-card-hover border-t-2 ${signalAccents[i]} p-5`}
              style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-200">{signal.name}</h3>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${weightPillColors[i]}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {signal.weight}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {signal.description}
              </p>
              <p className="mt-2 text-xs text-gray-600">
                Detects: {signal.detects}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Formula */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Aggregation Formula
        </h2>
        <div className="glass-card mt-4 overflow-x-auto border-l-2 border-l-cyan-500/40 p-6">
          <code
            className="text-sm text-cyan-300"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            final_score = Sum(score_i * weight_i * confidence_i) / Sum(weight_i * confidence_i)
          </code>
          <p className="mt-4 text-sm text-gray-400">
            Each signal&apos;s score is multiplied by its weight and confidence level, then
            normalized by the total weighted confidence. This ensures that signals with higher
            confidence have more influence on the final score.
          </p>
        </div>
      </section>

      {/* Score Labels */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Score Labels
        </h2>
        <div className="glass-card mt-4 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3.5 text-left">Score Range</th>
                <th className="px-5 py-3.5 text-left">Label</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((l) => (
                <tr
                  key={l.label}
                  className={`border-b border-white/[0.04] border-l-2 ${l.border} ${l.bg} last:border-b-0`}
                >
                  <td
                    className="px-5 py-3.5 text-sm text-gray-300"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {l.range}
                  </td>
                  <td className={`px-5 py-3.5 text-sm font-semibold ${l.color}`}>
                    {l.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Collection */}
      <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Data Collection
        </h2>
        <div className="glass-card mt-4 p-6">
          <p className="text-sm leading-relaxed text-gray-400">
            Viewership snapshots are collected at regular intervals (typically every 5 minutes)
            for tracked channels. Each snapshot records the viewer count, chatter count, and
            current category. Analysis requires a minimum number of data points to produce
            reliable scores.
          </p>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
        <h2
          className="text-xl font-semibold text-gray-100"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Limitations &amp; Disclaimers
        </h2>
        <div className="glass-card mt-4 border-l-2 border-l-amber-500/40 p-6">
          <div className="mb-3 flex items-center gap-2 text-amber-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Important Limitations</span>
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-gray-400">
            <li>
              Scores are statistical indicators, not definitive proof of viewership manipulation.
            </li>
            <li>
              Raids, hosted streams, embeds, and platform promotions can naturally cause anomalous patterns.
            </li>
            <li>
              New or small channels may have insufficient data for accurate analysis.
            </li>
            <li>
              The system cannot distinguish between purchased viewers and legitimate viral events with certainty.
            </li>
            <li>
              Platform API changes may affect data accuracy.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
