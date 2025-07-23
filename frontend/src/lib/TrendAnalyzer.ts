export type TrendTag = 'Improving' | 'Stable' | 'Declining' | 'Volatile';

export function getTrendTag(data: number[]): TrendTag {
  if (!data || data.length < 2) return 'Stable';

  const diff = data.map((val, i) =>
    i === 0 ? 0 : val - data[i - 1]
  ).slice(1);

  const positive = diff.filter((d) => d > 0).length;
  const negative = diff.filter((d) => d < 0).length;

  if (positive === diff.length) return 'Improving';
  if (negative === diff.length) return 'Declining';
  if (positive > 0 && negative > 0) return 'Volatile';
  return 'Stable';
}

export function generateSummary(metrics: Record<string, number[]>): string {
  const rev = metrics["revenue"] ?? [];
  const profit = metrics["net_profit"] ?? [];
  const margin = metrics["ebitda_margin"] ?? [];
  const debt = metrics["debt_to_equity"] ?? [];

  const revTag = getTrendTag(rev);
  const profTag = getTrendTag(profit);
  const marginTag = getTrendTag(margin);
  const debtTag = getTrendTag(debt);

  return `Revenue is ${revTag.toLowerCase()}, with net profit ${profTag.toLowerCase()}. ` +
         `EBITDA margin is ${marginTag.toLowerCase()}, while debt-to-equity is ${debtTag.toLowerCase()}.`;
}
export function getTrendSummaryLine(data: number[]): { tag: string; color: string; text: string } {
  const trend = getTrendTag(data);
  switch (trend) {
    case 'Improving':
      return { tag: 'Green', color: 'text-green-600', text: 'Improving over time.' };
    case 'Stable':
      return { tag: 'Amber', color: 'text-yellow-600', text: 'Stable trend.' };
    case 'Volatile':
      return { tag: 'Amber', color: 'text-yellow-600', text: 'Volatile pattern.' };
    case 'Declining':
    default:
      return { tag: 'Red', color: 'text-red-600', text: 'Declining over time.' };
  }
}
