'use client';

import { useState, useEffect } from 'react';
import Disclaimer from '@/components/Disclaimer';




const formatINR = (num: number) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function DCFPage() {
  
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
  const [tickers, setTickers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
  fetch('/tickers.json')
    .then(res => res.json())
    .then(data => setTickers(data));
  }, []);
  const [sensitivityData, setSensitivityData] = useState<any | null>(null);
  const [showSensitivity, setShowSensitivity] = useState(false);
  
  const fetchFromYahoo = async () => {
    if (!form.ticker) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/yfinance?ticker=${form.ticker}`);
      const data = await res.json();
      // Optional: log fetched assumptions for debugging
      console.log("🔍 Auto-calculated assumptions:", data);

      setForm((prev) => ({
        ...prev,
        ...data,
      }));
      if (data.current_price) {
        setCurrentPrice(data.current_price.toString());
      }
    } catch (error) {
      console.error('Fetch failed', error);
      }
  };

  const input = (name: string, label: string, type = 'number') => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={(form as any)[name]}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
    </div>
  );
  
  {form.ebit_margin && (
  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm text-blue-800 rounded">
    📊 Assumptions auto-filled based on Yahoo Finance data. Please review/edit as needed before running valuation.
  </div>
  )}
  const fv = valuationResult?.fair_value_per_share || 0;
  const cp = parseFloat(currentPrice || '0');
  const potential = fv && cp ? (((fv - cp) / cp) * 100).toFixed(1) : null;

  let verdict: string | null = null;
  if (potential) {
    const potentialNum = parseFloat(potential);
    verdict = potentialNum > 0
      ? `🔼 Potential upside of ${potential}%`
      : `🔽 Potential downside of ${Math.abs(potentialNum).toFixed(1)}%`;
  }
  
  const currentPriceNum = parseFloat(currentPrice || '0');
  const diff = fv - currentPriceNum;
  const absDiffPct = currentPriceNum > 0 ? Math.abs(diff / currentPriceNum) * 100 : 0;

  let valuationMessage: string | null = null;
  let valuationColor = "";
  let valuationIcon = "";

  if (fv && cp) {
    if (absDiffPct < 15) {
      valuationMessage = "⚖️ Fairly Valued";
      valuationColor = "text-yellow-600";
    } else if (diff > 0) {
      valuationMessage = "📈 Undervalued";
      valuationColor = "text-green-600";
      valuationIcon = "🔼";
    } else {
      valuationMessage = "📉 Overvalued";
      valuationColor = "text-red-600";
      valuationIcon = "🔽";
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Disclaimer />
      
      <h1 className="text-2xl font-bold mb-4">📊 DCF Valuation</h1>


      <div className="mb-6">
        <label className="block font-semibold mb-1">Stock Ticker (e.g., INFY.NS)</label>
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              name="ticker"
              value={form.ticker}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setForm((prev) => ({ ...prev, ticker: val }));
                const filtered = tickers.filter((t) => t.includes(val));
                setSuggestions(filtered.slice(0, 8));
              }}
              className="border p-2 w-full rounded"
              placeholder="Start typing NSE symbol..."
            />
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border rounded mt-1 w-full z-10 shadow max-h-48 overflow-y-auto">
                {suggestions.map((t, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, ticker: t }));
                      setSuggestions([]);
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={fetchFromYahoo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fetch
          </button>
        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-6">
        {input('base_revenue', 'Latest Annual Revenue')}
        {input('net_debt', 'Net Debt')}
        {input('shares_outstanding', 'Shares Outstanding (Cr)')}
        {input('ebit_margin', 'EBIT Margin (%)')}
        {input('depreciation_pct', 'Depreciation (% of Revenue)')}
        {input('capex_pct', 'CapEx (% of Revenue)')}
        {input('wc_change_pct', 'Change in WC (% of Revenue)')}
        {input('tax_rate', 'Tax Rate (%)')}
        {input('interest_pct', 'WACC (%)')}
        {input('x_years', 'High Growth Period (X years)')}
        {input('growth_x', 'Growth Rate in X years (%)')}
        {input('y_years', 'Total Projection Period (Y years)')}
        {input('growth_y', 'Growth Rate from X to Y years (%)')}
        {input('growth_terminal', 'Terminal Growth Rate (%)')}
      </div>


      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Current Market Price (₹)</label>
        <input
          type="number"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g. 712.50"
        />
      </div>

      <button
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={async () => {
          try {
            const res = await fetch('http://127.0.0.1:8000/api/dcf', {
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
        }}

      >
        Run Valuation
      </button>
      
      {valuationResult && (
        <div className="mt-10 space-y-6">

          {/* 💰 Summary Box */}
          <div className="p-4 border border-green-300 bg-green-20 rounded-md">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Fair Value Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Enterprise Value:</strong> ₹{formatINR(valuationResult.enterprise_value)}</div>
              <div><strong>Equity Value:</strong> ₹{formatINR(valuationResult.equity_value)}</div>
              <div><strong>Net Debt:</strong> ₹{formatINR(valuationResult.net_debt)}</div>
              <div><strong>Shares Outstanding:</strong> {valuationResult.shares_outstanding} Cr</div>
              <div className="col-span-2 text-sm text-green-800">
                💰 <strong>Fair Value:</strong> ₹{valuationResult.fair_value_per_share}
                <br />
                📈 <strong>Current Price:</strong> ₹{currentPrice || '—'}
                {potential && (
                  <div className={`mt-1 font-semibold ${parseFloat(potential) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {verdict}
                  </div>
                )}
                {valuationMessage && (
                  <div className={`mt-3 font-bold text-lg ${valuationColor}`}>
                    {valuationIcon} {valuationMessage}
                  </div>
                )}        
                {/* 📍 Final Verdict */}
                <div className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded shadow-sm">
                  <p className="text-blue-800 text-sm">
                    Terminal value contributes <strong>{valuationResult.terminal_weight}%</strong> of the total valuation.
                  </p>
                </div>

              
              </div>
              
            </div>
          </div>

          {/* 📘 Explanation */}
          <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700">
            <h3 className="font-semibold mb-1">🧠 Explanation:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Forecasted free cashflows over {valuationResult.fcf_table.length} years using 3-stage growth model.</li>
              <li>Phase 1 PV: ₹{formatINR(valuationResult.phase1_pv)}, Phase 2 PV: ₹{formatINR(valuationResult.phase2_pv)}, Terminal Value PV: ₹{formatINR(valuationResult.terminal_value_pv)}</li>
              <li>Enterprise value = PV of all future FCFs + Terminal value.</li>
              <li>Equity value = Enterprise value − Net debt.</li>
              <li>Fair value per share = Equity value / Shares outstanding</li>
            </ul>
          </div>

          {/* 📊 DCF Table */}
          <div>
            <h3 className="font-semibold text-lg mb-2">📊 Discounted Cash Flow Table</h3>
            <div className="overflow-auto border rounded">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {Object.keys(valuationResult.fcf_table[0]).map((col) => (
                      <th key={col} className="p-2 border">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {valuationResult.fcf_table.map((row: any, i: number) => (
                    <tr key={i} className="text-center">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="p-2 border">
                          {typeof val === 'number' ? formatINR(val) : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
      
      <button
        onClick={async () => {
          if (!valuationResult || !form) return;

          const res = await fetch("http://127.0.0.1:8000/api/dcf/sensitivity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base_revenue: parseFloat(form.base_revenue),
              net_debt: parseFloat(form.net_debt),
              shares_outstanding: parseFloat(form.shares_outstanding),
              depreciation_pct: parseFloat(form.depreciation_pct),
              capex_pct: parseFloat(form.capex_pct),
              wc_change_pct: parseFloat(form.wc_change_pct),
              tax_rate: parseFloat(form.tax_rate),
              interest_pct: parseFloat(form.interest_pct),
              x_years: parseInt(form.x_years),
              y_years: parseInt(form.y_years),
              growth_y: parseFloat(form.growth_y),
              ebit_margin: parseFloat(form.ebit_margin),
              growth_terminal: parseFloat(form.growth_terminal),
            }),
          });

          const data = await res.json();
          setSensitivityData(data);
          setShowSensitivity(true);
        }}
        className="mt-6 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        🔍 Show Sensitivity Table
      </button>  

      {showSensitivity && sensitivityData && (
        <div className="mt-6 border rounded shadow p-4 bg-white">
          <h3 className="text-lg font-semibold mb-3">📊 Sensitivity Analysis</h3>
          <div className="overflow-auto max-w-full">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-200 sticky left-0">EBIT ↓ / Growth →</th>
                  {sensitivityData.growth_values.map((g: number, i: number) => (
                    <th key={i} className="p-2 border bg-gray-100">{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityData.ebit_values.map((ebit: number, rowIdx: number) => (
                  <tr key={rowIdx}>
                    <td className="p-2 border bg-gray-100 font-medium sticky left-0 bg-white">
                      {ebit.toFixed(2)}%
                    </td>
                    {sensitivityData.fair_values[rowIdx].map((val: number, colIdx: number) => {
                      const fv = val;
                      const cp = parseFloat(currentPrice || '0');
                      const userFV = valuationResult.fair_value_per_share;
                      const isCloseToMarket = Math.abs(fv - cp) / cp < 0.15;
                      const isUserInputs = (
                        ebit === parseFloat(form.ebit_margin) &&
                        sensitivityData.growth_values[colIdx] === parseFloat(form.growth_y)
                      );

                      let bg = 'bg-white';
                      if (isCloseToMarket) bg = 'bg-yellow-100';
                      else if (fv > cp) bg = 'bg-green-100';
                      else if (fv < cp) bg = 'bg-red-100';

                      return (
                        <td
                          key={colIdx}
                          className={`p-2 border text-center ${bg} ${isUserInputs ? 'font-bold ring-2 ring-blue-500' : ''}`}
                        >
                          ₹{fv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  


    </main>
  );
}
