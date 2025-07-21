'use client';

import { useState, useEffect } from 'react';
import Disclaimer from '@/components/Disclaimer';
import { useGlobalStore } from '@/store/globalStore';
import ValuationSummary from '@/components/dcf/ValuationSummary';
import DCFTable from '@/components/dcf/DCFTable';
import SensitivityTable from '@/components/dcf/SensitivityTable';

const formatINR = (num: number) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function DCFPage() {
  const assumptions = useGlobalStore((state) => state.assumptions);

  const [form, setForm] = useState({
    ticker: '',
    base_revenue: '',
    net_debt: '',
    shares_outstanding: '',
    ebit_margin: '',
    depreciation_pct: '',
    capex_pct: '',
    wc_change_pct: '',
    tax_rate: '',
    interest_pct: '',
    x_years: '5',
    growth_x: '',
    y_years: '15',
    growth_y: '',
    growth_terminal: '',
  });

  const [valuationResult, setValuationResult] = useState<any | null>(null);
  const [currentPrice, setCurrentPrice] = useState('');
  const [sensitivityData, setSensitivityData] = useState<any | null>(null);
  const [showSensitivity, setShowSensitivity] = useState(false);

  useEffect(() => {
    if (Object.keys(assumptions).length > 0) {
      setForm((prev) => ({
        ...prev,
        base_revenue: assumptions.latest_revenue?.toString() || '',
        net_debt: assumptions.net_debt?.toString() || '',
        shares_outstanding: assumptions.shares_outstanding?.toString() || '',
        ebit_margin: assumptions.ebit_margin?.toString() || '',
        depreciation_pct: assumptions.depreciation_pct?.toString() || '',
        capex_pct: assumptions.capex_pct?.toString() || '',
        wc_change_pct: assumptions.wc_change_pct?.toString() || '',
        tax_rate: assumptions.tax_rate?.toString() || '',
        interest_pct: assumptions.interest_pct?.toString() || '',
        x_years: assumptions.period_x?.toString() || '',
        growth_x: assumptions.growth_x?.toString() || '',
        y_years: assumptions.period_y?.toString() || '',
        growth_y: assumptions.growth_y?.toString() || '',
        growth_terminal: assumptions.growth_terminal?.toString() || '',
      }));
      
      setCurrentPrice(assumptions.current_price?.toString() || '');
      if (assumptions.missing_fields?.length > 0) {
        console.warn("📉 Missing fields in upload:", assumptions.missing_fields.join(", "));
      }
    }
  }, [assumptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const runValuation = async () => {
    try {
      const res = await fetch('https://PaiseDePange.onrender.com/api/dcf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          base_revenue: parseFloat(form.base_revenue),
          net_debt: parseFloat(form.net_debt),
          shares_outstanding: parseFloat(form.shares_outstanding),
          ebit_margin: parseFloat(form.ebit_margin),
          depreciation_pct: parseFloat(form.depreciation_pct),
          capex_pct: parseFloat(form.capex_pct),
          wc_change_pct: parseFloat(form.wc_change_pct),
          tax_rate: parseFloat(form.tax_rate),
          interest_pct: parseFloat(form.interest_pct),
          x_years: parseInt(form.x_years),
          growth_x: parseFloat(form.growth_x),
          y_years: parseInt(form.y_years),
          growth_y: parseFloat(form.growth_y),
          growth_terminal: parseFloat(form.growth_terminal),
        }),
      });
      const data = await res.json();
      setValuationResult(data);
    } catch (err) {
      console.error('Valuation failed', err);
      setValuationResult(null);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-white text-black dark:bg-zinc-900 dark:text-white">
      <Disclaimer />
      <h1 className="text-2xl font-bold mb-4">📊 DCF Valuation</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries({
          base_revenue: 'Latest Annual Revenue',
          net_debt: 'Net Debt',
          shares_outstanding: 'Shares Outstanding (Cr)',
          ebit_margin: 'EBIT Margin (%)',
          depreciation_pct: 'Depreciation (% of Revenue)',
          capex_pct: 'CapEx (% of Revenue)',
          wc_change_pct: 'Change in WC (% of Revenue)',
          tax_rate: 'Tax Rate (%)',
          interest_pct: 'WACC (%)',
          x_years: 'High Growth Period (X years)',
          growth_x: 'Growth Rate in X years (%)',
          y_years: 'Total Projection Period (Y years)',
          growth_y: 'Growth Rate from X to Y years (%)',
          growth_terminal: 'Terminal Growth Rate (%)'
        }).map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="number"
              name={name}
              value={(form as any)[name]}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
            />
          </div>
        ))}
      </div>

      <div className="mb-4 mt-4">
        <label className="block text-sm font-medium mb-1">Current Market Price (₹)</label>
        <input
          type="number"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
          placeholder="e.g. 712.50"
        />
      </div>

      {Object.keys(assumptions).length > 0 && (
        <div className="mt-4 p-3 border-l-4 text-sm rounded bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100 border-blue-400 dark:border-blue-300">
          📂 Assumptions auto-filled from uploaded Excel file. Please review/edit before running valuation.
        </div>
      )}

      <button
        onClick={runValuation}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Run Valuation
      </button>

      {valuationResult && (
        <>
          <ValuationSummary result={valuationResult} currentPrice={currentPrice} />
          <DCFTable data={valuationResult.fcf_table} />
        </>
      )}

      {valuationResult && (
        <SensitivityTable
          visible={showSensitivity}
          setVisible={setShowSensitivity}
          valuationResult={valuationResult}
          currentPrice={currentPrice}
          form={form}
          setSensitivityData={setSensitivityData}
          sensitivityData={sensitivityData}
        />
      )}
    </main>
  );
}
