'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const ProfitabilitySection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'ebitda_margin', label: 'EBITDA Margin (%)' },
    { key: 'net_profit_margin', label: 'Net Profit Margin (%)' },
    { key: 'roce', label: 'ROCE (%)' },
    { key: 'roe', label: 'ROE (%)' },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">💰 Profitability & Returns</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

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
              <MetricLineChart label={label} data={alignedData} labels={alignedYears} percent />
            </div>
          );
        })}
      </div>
    </div>
  );
};
