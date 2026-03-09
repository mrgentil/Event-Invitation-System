import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, type DashboardStats } from '../api'
import KPICard from '../components/dashboard/KPICard'
import EventsPerMonthChart from '../components/dashboard/EventsPerMonthChart'
import TopEventsChart from '../components/dashboard/TopEventsChart'

export default function Statistics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setError('Impossible de charger les statistiques'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'Impossible de charger les statistiques.'}</div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="page-title mb-2">Statistiques</h1>
        <p className="page-subtitle">Vue détaillée de l'activité de vos événements et invitations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total événements" value={stats.total_events} subtitle="Tout confondu" icon="📅" accent="primary" />
        <KPICard title="Total invités" value={stats.total_guests} subtitle="Tous événements" icon="👥" accent="emerald" />
        <KPICard title="Personnes attendues" value={stats.total_attendees ?? 0} subtitle="Confirmés (avec +1)" icon="✓" accent="primary" />
        <KPICard title="Événements à venir" value={stats.upcoming_events} subtitle="À partir d'aujourd'hui" icon="🔜" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventsPerMonthChart eventsPerMonth={stats.events_per_month} />
        <TopEventsChart topEvents={stats.top_events_by_guests} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/dashboard" className="btn btn-secondary btn-md">Retour au tableau de bord</Link>
        <Link to="/events" className="btn btn-primary btn-md">Voir les événements</Link>
      </div>
    </div>
  )
}
