import { useEffect } from 'react';

type Props = {
  visible: boolean;
  setVisible: (v: boolean) => void;
  valuationResult: any;
  currentPrice: string;
  form: any;
  setSensitivityData: (data: any) => void;
  sensitivityData: any;
};

export default function SensitivityTable({
  visible,
  setVisible,
  valuationResult,
  currentPrice,
  form,
  setSensitivityData,
  sensitivityData
}: Props) {
  const fetchSensitivity = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf/sensitivity`, {
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
    setVisible(true);
  };

  return (
    <div className="mt-6">
      <button
        onClick={fetchSensitivity}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        🔍 Show Sensitivity Table
      </button>

      {visible && sensitivityData && (
        <div className="mt-6 border rounded shadow p-4 bg-white dark:bg-zinc-800">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">📊 Sensitivity Analysis</h3>
          <div className="overflow-auto max-w-full">
            <table className="border-collapse text-sm w-full">
              <thead>
                <tr>
                  <th className="p-2 border bg-gray-200 dark:bg-zinc-700 dark:text-white sticky left-0">EBIT ↓ / Growth →</th>
                  {sensitivityData.growth_values.map((g: number, i: number) => (
                    <th key={i} className="p-2 border bg-gray-100 dark:bg-zinc-700 dark:text-white">{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityData.ebit_values.map((ebit: number, rowIdx: number) => (
                  <tr key={rowIdx}>
                    <td className="p-2 border font-medium sticky left-0 bg-white dark:bg-zinc-800 dark:text-white">
                      {ebit.toFixed(2)}%
                    </td>
                    {sensitivityData.fair_values[rowIdx].map((val: number, colIdx: number) => {
                      const fv = val;
                      const cp = parseFloat(currentPrice || '0');
                      const isCloseToMarket = Math.abs(fv - cp) / cp < 0.15;
                      const isUserInputs = (
                        ebit === parseFloat(form.ebit_margin) &&
                        sensitivityData.growth_values[colIdx] === parseFloat(form.growth_y)
                      );

                      let bg = 'bg-white dark:bg-zinc-800';
                      if (isCloseToMarket) bg = 'bg-yellow-100 dark:bg-yellow-600';
                      else if (fv > cp) bg = 'bg-green-100 dark:bg-green-700';
                      else if (fv < cp) bg = 'bg-red-100 dark:bg-red-900';

                      return (
                        <td
                          key={colIdx}
                          className={`p-2 border text-center text-black dark:text-white ${bg} ${isUserInputs ? 'font-bold ring-2 ring-blue-500' : ''}`}
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
    </div>
  );
}
