// #chartOptions.ts

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#4B5563',
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#4B5563',
      },
      grid: {
        color: '#E5E7EB',
      },
    },
    y: {
      ticks: {
        color: '#4B5563',
      },
      grid: {
        color: '#E5E7EB',
      },
    },
  },
};