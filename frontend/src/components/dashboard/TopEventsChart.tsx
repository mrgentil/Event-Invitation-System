import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    y: {
      grid: { display: false },
    },
  },
}

interface TopEventsChartProps {
  topEvents: { title: string; guests_count: number }[]
}

export default function TopEventsChart({ topEvents }: TopEventsChartProps) {
  const labels = topEvents.map((e) => (e.title.length > 25 ? e.title.slice(0, 22) + '…' : e.title))
  const data = topEvents.map((e) => e.guests_count)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Invités',
        data,
        backgroundColor: 'rgba(109, 40, 217, 0.6)',
        borderColor: 'rgb(109, 40, 217)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Top événements par nombre d'invités</h3>
      <div className="h-64">
        {topEvents.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Aucune donnée pour l'instant</div>
        ) : (
          <Bar options={options} data={chartData} />
        )}
      </div>
    </div>
  )
}
