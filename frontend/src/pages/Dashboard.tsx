import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dashboardApi, type DashboardStats } from '../api'
import KPICard from '../components/dashboard/KPICard'
import EventsPerMonthChart from '../components/dashboard/EventsPerMonthChart'
import TopEventsChart from '../components/dashboard/TopEventsChart'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setError('Impossible de charger le tableau de bord'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
        {error || 'Impossible de charger les statistiques.'}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {user?.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Voici un aperçu de vos événements.
          </p>
        </div>
        <Link
          to="/events/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
        >
          Créer un événement
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total événements"
          value={stats.total_events}
          subtitle="Tout confondu"
          icon="📅"
          accent="primary"
        />
        <KPICard
          title="Total invités"
          value={stats.total_guests}
          subtitle="Tous événements"
          icon="👥"
          accent="emerald"
        />
        <KPICard
          title="Événements à venir"
          value={stats.upcoming_events}
          subtitle="À partir d'aujourd'hui"
          icon="🔜"
          accent="amber"
        />
        <KPICard
          title="6 derniers mois"
          value={Object.values(stats.events_per_month).reduce((a, b) => a + b, 0)}
          subtitle="Événements créés"
          icon="📊"
          accent="violet"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsPerMonthChart eventsPerMonth={stats.events_per_month} />
        <TopEventsChart topEvents={stats.top_events_by_guests} />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/events/create"
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            Nouvel événement
          </Link>
          <Link
            to="/events"
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            Voir tous les événements
          </Link>
        </div>
      </div>
    </div>
  )
}
