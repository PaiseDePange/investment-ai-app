'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';
import { getTrendSummaryLine } from '@/lib/TrendAnalyzer';
interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const GrowthSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'net_profit', label: 'Net Profit' },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">📊 Past Growth</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data) ? data.map((n) => Number(n)).filter((n) => !isNaN(n)) : [];

          console.log(`📊 ${label}`, {
            key,
            dataLength: validData.length,
            yearsLength: years.length,
            rawData: data,
            rawYears: years,
          });

          // Test fallback chart if data is missing
          if (label === 'Revenue' && (!validData.length || !years.length)) {
            console.warn(`🔍 Showing test fallback chart for ${label}`);
            return (
              <div key="test" className="bg-white rounded-md p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Test Chart</h3>
                <MetricBarChart
                  label="Test"
                  data={[100, 200, 300]}
                  labels={['2021', '2022', '2023']}
                />
              </div>
            );
          }

          if (!validData.length || !years.length) return null;

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);
          const trend = getTrendSummaryLine(alignedData);
          return (
            <div key={key} className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{label}</h3>
              <MetricBarChart label={label} data={alignedData} labels={alignedYears} />
              

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
