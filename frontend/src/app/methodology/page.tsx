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
  { range: '0 - 20', label: 'Normal', color: 'text-score-normal', bg: 'bg-green-900/20' },
  { range: '21 - 40', label: 'Low', color: 'text-score-low', bg: 'bg-yellow-900/20' },
  { range: '41 - 60', label: 'Moderate', color: 'text-score-moderate', bg: 'bg-orange-900/20' },
  { range: '61 - 80', label: 'Elevated', color: 'text-score-elevated', bg: 'bg-red-900/20' },
  { range: '81 - 100', label: 'High', color: 'text-score-high', bg: 'bg-red-950/20' },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-100">Methodology</h1>
      <p className="mt-3 text-gray-400">
        How StreamOracle analyzes viewership data to produce suspicion scores.
      </p>

      {/* Philosophy */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Philosophy</h2>
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/30 p-6">
          <p className="text-sm leading-relaxed text-gray-300">
            StreamOracle follows the principle of <strong>&quot;Score, don&apos;t accuse.&quot;</strong>{' '}
            Suspicion scores are statistical indicators based on data patterns, not definitive
            proof of manipulation. Many legitimate factors can influence scores, including raids,
            embeds, events, and platform promotions. Always consider context when interpreting results.
          </p>
        </div>
      </section>

      {/* Signals */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Detection Signals</h2>
        <p className="mt-2 text-sm text-gray-500">
          Seven independent signals each produce a score from 0 to 100.
        </p>
        <div className="mt-6 space-y-4">
          {signals.map((signal) => (
            <div
              key={signal.name}
              className="rounded-xl border border-gray-800 bg-gray-900/30 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-200">{signal.name}</h3>
                <span className="flex-shrink-0 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  weight: {signal.weight}
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
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Aggregation Formula</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/30 p-6">
          <code className="text-sm text-purple-300">
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
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Score Labels</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-left">Score Range</th>
                <th className="px-4 py-3 text-left">Label</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((l) => (
                <tr key={l.label} className={`border-b border-gray-800/50 ${l.bg}`}>
                  <td className="px-4 py-3 text-sm text-gray-300">{l.range}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${l.color}`}>
                    {l.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Collection */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Data Collection</h2>
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/30 p-6">
          <p className="text-sm leading-relaxed text-gray-400">
            Viewership snapshots are collected at regular intervals (typically every 5 minutes)
            for tracked channels. Each snapshot records the viewer count, chatter count, and
            current category. Analysis requires a minimum number of data points to produce
            reliable scores.
          </p>
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-8 mt-12">
        <h2 className="text-xl font-semibold text-gray-100">Limitations &amp; Disclaimers</h2>
        <div className="mt-4 rounded-xl border border-yellow-900/50 bg-yellow-900/10 p-6">
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
