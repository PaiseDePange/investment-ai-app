'use client';

import { getTrendTag, generateSummary } from '@/lib/TrendAnalyzer';

interface Props {
  metrics: Record<string, number[]>;
}

const tagColor = {
  Improving: 'text-green-600',
  Declining: 'text-red-600',
  Volatile: 'text-yellow-600',
  Stable: 'text-gray-600',
};

export const SummaryBox = ({ metrics }: Props) => {
  const rev = metrics["revenue"] ?? [];
  const profit = metrics["net_profit"] ?? [];
  const margin = metrics["ebitda_margin"] ?? [];
  const debt = metrics["debt_to_equity"] ?? [];

  const tags = [
    { label: "Revenue", tag: getTrendTag(rev) },
    { label: "Net Profit", tag: getTrendTag(profit) },
    { label: "EBITDA Margin", tag: getTrendTag(margin) },
    { label: "Debt-to-Equity", tag: getTrendTag(debt) },
  ];

  const summary = generateSummary(metrics);

  return (
    <div className="bg-white rounded-md shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold">🧠 Financial Summary</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {tags.map(({ label, tag }) => (
          <div key={label}>
            <span className="font-medium text-gray-600">{label}: </span>
            <span className={`font-semibold ${tagColor[tag]}`}>{tag}</span>
          </div>
        ))}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
    </div>
  );
};
