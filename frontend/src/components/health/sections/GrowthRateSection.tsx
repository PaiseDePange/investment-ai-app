'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';
import { getTrendSummaryLine } from '@/lib/TrendAnalyzer';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const GrowthRateSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'revenue_growth', label: 'Revenue Growth (%)' },
    { key: 'ebitda_growth', label: 'EBITDA Growth (%)' },
    { key: 'net_profit_growth', label: 'Net Profit Growth (%)' },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">📈 Growth Rates</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data) ? data.map((n) => Number(n)).filter((n) => !isNaN(n)) : [];

          // ⏱ Trim years to match growth data (YoY = one less year)
          const minLen = Math.min(validData.length, years.length - 1);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(1).slice(-minLen); // skip first year

          // 🔍 Debug (optional)
          console.log(`📈 ${label}`, {
            data: alignedData,
            years: alignedYears,
            raw: data,
          });

          if (!alignedData.length || !alignedYears.length) return null;
          const trend = getTrendSummaryLine(alignedData);
          return (
            <div key={key} className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
              <MetricLineChart label={label} data={alignedData} labels={alignedYears} percent />
              <p className={`text-xs mt-1 ${trend.color}`}>
                • {trend.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
