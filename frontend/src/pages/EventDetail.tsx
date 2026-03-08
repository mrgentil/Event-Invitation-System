import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { eventsApi, type Event } from '../api'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function loadEvent() {
    if (!id) return
    setLoading(true)
    eventsApi
      .get(Number(id))
      .then((res) => setEvent(res.data.data))
      .catch(() => setError('Événement introuvable'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvent()
  }, [id])

  async function handleDelete() {
    if (!event) return
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await eventsApi.delete(event.id)
      navigate('/events')
    } catch {
      setDeleteError('Impossible de supprimer l\'événement')
    } finally {
      setDeleteLoading(false)
      setDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        {error || 'Événement introuvable'}
        <Link to="/events" className="block mt-2 text-primary-600">Retour aux événements</Link>
      </div>
    )
  }

  const guests = event.guests || []

  return (
    <div>
      {deleteError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{deleteError}</div>
      )}
      <div className="flex items-center justify-between mb-4">
        <Link to="/events" className="text-sm text-primary-600 hover:underline">
          ← Retour aux événements
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/events/${event.id}/edit`}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            Modifier
          </Link>
          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          ) : (
            <>
              <span className="text-sm text-slate-600 self-center">Supprimer cet événement ?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Suppression...' : 'Oui'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          {event.description && (
            <p className="text-slate-600 mt-2">{event.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span>{event.time}</span>
            {event.location && <span>{event.location}</span>}
          </div>
        </div>
        <div className="p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Invités ({guests.length})</h2>
          {guests.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucun invité.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {guests.map((g) => (
                <li key={g.id} className="py-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-900">{g.name}</span>
                  <span className="text-slate-600">{g.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
