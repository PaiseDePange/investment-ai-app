'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const LeverageSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'debt_to_equity', label: 'Debt to Equity (x)' },
    { key: 'interest_coverage', label: 'Interest Coverage (x)' },
    { key: 'cash_and_bank', label: 'Cash & Bank (₹ Cr)' }, // Optional
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">⚖️ Leverage & Liquidity</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data)
            ? data.map((n) => Number(n)).filter((n) => !isNaN(n))
            : [];

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);

          if (!alignedData.length || !alignedYears.length) return null;

          return (
            <div key={key} className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
              <MetricLineChart label={label} data={alignedData} labels={alignedYears} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
