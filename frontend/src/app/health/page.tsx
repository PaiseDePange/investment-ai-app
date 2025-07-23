'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { HealthMetricCard } from '@/components/health/HealthMetricCard';
import { GrowthSection } from '@/components/health/sections/GrowthSection';
import { GrowthRateSection } from '@/components/health/sections/GrowthRateSection';
import { ProfitabilitySection } from '@/components/health/sections/ProfitabilitySection';
import { LeverageSection } from '@/components/health/sections/LeverageSection';
import { BalanceSheetSection } from '@/components/health/sections/BalanceSheetSection';
import { SummaryBox } from '@/components/health/SummaryBox';


export default function FinancialHealthPage() {
  const metrics = useGlobalStore((state) => state.calculated_metrics);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const metricsList = [
    { key: 'ebitda_margin', label: 'EBITDA Margin (%)', green: 20, red: 5, percent: true },
    { key: 'net_profit_margin', label: 'Net Profit Margin (%)', green: 15, red: 2, percent: true },
    { key: 'roce', label: 'ROCE (%)', green: 20, red: 7, percent: true },
    { key: 'roe', label: 'ROE (%)', green: 18, red: 5, percent: true },
    { key: 'interest_coverage', label: 'Interest Coverage (x)', green: 5, red: 1, percent: false },
    { key: 'debt_to_equity', label: 'Debt to Equity (x)', green: 0.5, red: 2, percent: false },
    { key: 'fcf_margin', label: 'Free Cash Flow Margin (%)', green: 10, red: 0, percent: true },
  ];

  const rawYears = metrics["years"] || [];
  const years = rawYears.map((y: string) => y.replace("Mar-", ""));

  if (!hydrated || !metrics || Object.keys(metrics).length === 0) {
    return <div className="text-center text-gray-500 p-8">📂 No financial data available.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">📊 Financial Health Check</h1>
      <GrowthSection metrics={metrics} years={years} />
      <GrowthRateSection metrics={metrics} years={years} />
      <ProfitabilitySection metrics={metrics} years={years} />
      <BalanceSheetSection metrics={metrics} years={years} />
      <LeverageSection metrics={metrics} years={years} />
      <SummaryBox metrics={metrics} />

    </div>
  );
}
