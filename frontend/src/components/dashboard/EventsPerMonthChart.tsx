import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      grid: { display: false },
    },
  },
}

function formatMonth(key: string): string {
  const [y, m] = key.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`
}

interface EventsPerMonthChartProps {
  eventsPerMonth: Record<string, number>
}

export default function EventsPerMonthChart({ eventsPerMonth }: EventsPerMonthChartProps) {
  const labels = Object.keys(eventsPerMonth).map(formatMonth)
  const data = Object.values(eventsPerMonth)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Événements',
        data,
        backgroundColor: 'rgba(2, 132, 199, 0.6)',
        borderColor: 'rgb(2, 132, 199)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">Événements par mois</h3>
      <div className="h-64">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  )
}
