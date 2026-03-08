import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi, type Event, type EventsPaginationMeta, type ListEventsParams } from '../api'

// Icônes SVG inline (voir, modifier, supprimer)
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const PER_PAGE_OPTIONS = [10, 15, 25, 50]
const SORT_OPTIONS: { value: ListEventsParams['sort']; label: string }[] = [
  { value: 'date_desc', label: 'Date (récent → ancien)' },
  { value: 'date_asc', label: 'Date (ancien → récent)' },
  { value: 'title_asc', label: 'Titre A → Z' },
  { value: 'title_desc', label: 'Titre Z → A' },
]

function EventTableRow({ event, onDeleted }: { event: Event; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm) {
      setConfirm(true)
      return
    }
    setDeleting(true)
    try {
      await eventsApi.delete(event.id)
      onDeleted()
    } catch {
      setConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const guestsCount = event.guests_count ?? event.guests?.length ?? 0

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-3">
        <Link to={`/events/${event.id}`} className="font-medium text-slate-900 hover:text-primary-600">
          {event.title}
        </Link>
      </td>
      <td className="px-4 py-3 text-slate-600">{event.location ?? '—'}</td>
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
        {new Date(event.date).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{event.time}</td>
      <td className="px-4 py-3 text-slate-600">{guestsCount} invités</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            to={`/events/${event.id}`}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Voir"
          >
            <IconEye />
          </Link>
          <Link
            to={`/events/${event.id}/edit`}
            className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <IconPencil />
          </Link>
          {!confirm ? (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <IconTrash />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                title="Confirmer la suppression"
              >
                {deleting ? '…' : <IconTrash />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirm(false) }}
                className="text-sm text-slate-600 hover:text-slate-900 px-2"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [meta, setMeta] = useState<EventsPaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [sort, setSort] = useState<ListEventsParams['sort']>('date_desc')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    const today = new Date().toISOString().slice(0, 10)
    const params: ListEventsParams = {
      page,
      per_page: perPage,
      search: search || undefined,
      sort,
    }
    if (dateFilter === 'upcoming') {
      params.date_from = today
    } else if (dateFilter === 'past') {
      params.date_to = today
    }
    try {
      const res = await eventsApi.listPaginated(params)
      setEvents(res.data.data)
      setMeta(res.data.meta ?? null)
    } catch {
      setError('Impossible de charger les événements')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, sort, dateFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Debounce recherche + retour page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const pagination = meta?.pagination
  const totalPages = pagination?.last_page ?? 1

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Événements</h1>
        <Link
          to="/events/create"
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700"
        >
          Créer un événement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4">
          <input
            type="search"
            placeholder="Rechercher (titre, lieu…)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg w-56 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value as 'all' | 'upcoming' | 'past'); setPage(1) }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous</option>
            <option value="upcoming">À venir</option>
            <option value="past">Passés</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as ListEventsParams['sort']); setPage(1) }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-slate-500 text-sm ml-auto">
            {pagination ? `${pagination.total} résultat(s)` : ''}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            <p className="mb-4">Aucun événement trouvé.</p>
            <Link to="/events/create" className="text-primary-600 font-medium hover:underline">
              Créer un événement
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                    <th className="px-4 py-3">Titre</th>
                    <th className="px-4 py-3">Lieu</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Heure</th>
                    <th className="px-4 py-3">Invités</th>
                    <th className="px-4 py-3 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <EventTableRow
                      key={event.id}
                      event={event}
                      onDeleted={fetchEvents}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Par page</span>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
                    className="px-2 py-1 border border-slate-300 rounded text-sm"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {pagination.current_page} / {pagination.last_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
