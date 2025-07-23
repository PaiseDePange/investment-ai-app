'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  label: string;
  data: number[];
  labels: string[];
  percent?: boolean;
}

const getDynamicChartOptions = (data: number[], showPercent = false) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const buffer = (max - min) * 0.2 || 10;

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#4B5563' },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4B5563',
          autoSkip: false, // Show all year labels
          maxRotation: 45,
          minRotation: 30,
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      y: {
        suggestedMin: min - buffer,
        suggestedMax: max + buffer,
        ticks: {
          color: '#4B5563',
          callback: (value: string | number) =>
            showPercent ? `${Number(value).toFixed(1)}%` : Number(value).toFixed(1),
        },
        grid: {
          color: '#E5E7EB',
        },
      },
    },
  };
};

const formatChartData = (label: string, data: number[], labels: string[]) => ({
  labels: labels.slice(0, data.length),
  datasets: [
    {
      label,
      data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      barPercentage: 0.6,
      categoryPercentage: 0.8,
      borderRadius: 4,
    },
  ],
});

export const MetricBarChart = ({ label, data, labels, percent = false }: Props) => {
  return (
    <div className="relative w-full h-[200px]">
      <Bar
        data={formatChartData(label, data, labels)}
        options={getDynamicChartOptions(data, percent)}
      />
    </div>
  );
};
