'use client';
import { Card } from '@/components/ui/card';
import { MetricBarChart } from './MetricBarChart';

const colorFlag = (value: number, green: number, red: number) => {
  if (value >= green) return 'text-green-600';
  if (value <= red) return 'text-red-600';
  return 'text-yellow-600';
};

interface Props {
  label: string;
  data: number[];
  years: string[];
  green: number;
  red: number;
  percent?: boolean;
}

export const HealthMetricCard = ({ label, data, years, green, red, percent }: Props) => {
  if (!data.length || !years.length) return null;

  return (
    <Card className="shadow-sm h-[350px] flex flex-col justify-between">
      <div className="p-4 space-y-2 flex-grow">
        <h2 className="text-md font-semibold">{label}</h2>
        <p className={`text-xl font-bold ${colorFlag(data.at(-1)!, green, red)}`}>
          {data.at(-1)!.toFixed(1)}
          {percent ? '%' : ''}
        </p>
        <MetricBarChart label={label} data={data} labels={years} percent={percent} />
      </div>
    </Card>
  );
};
