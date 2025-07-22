type Props = {
  result: any;
  currentPrice: string;
};

const formatINR = (num: number) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function ValuationSummary({ result, currentPrice }: Props) {
  const fv = result?.fair_value_per_share || 0;
  const cp = parseFloat(currentPrice || '0');
  const diff = fv - cp;
  const absDiffPct = cp > 0 ? Math.abs(diff / cp) * 100 : 0;

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
    <div className="mt-10 space-y-6">
      <div className="p-4 border border-green-300 bg-green-20 rounded-md">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Fair Value Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Enterprise Value:</strong> ₹{formatINR(result.enterprise_value)}</div>
          <div><strong>Equity Value:</strong> ₹{formatINR(result.equity_value)}</div>
          <div><strong>Net Debt:</strong> ₹{formatINR(result.net_debt)}</div>
          <div><strong>Shares Outstanding:</strong> {result.shares_outstanding} Cr</div>
          <div className="col-span-2 text-sm text-green-800">
            💰 <strong>Fair Value:</strong> ₹{result.fair_value_per_share}
            <br />
            📈 <strong>Current Price:</strong> ₹{currentPrice || '—'}
            {valuationMessage && (
              <div className={`mt-3 font-bold text-lg ${valuationColor}`}>
                {valuationIcon} {valuationMessage}
              </div>
            )}
            <div className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded shadow-sm mt-2">
              <p className="text-blue-800 text-sm">
                Terminal value contributes <strong>{result.terminal_weight}%</strong> of the total valuation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
