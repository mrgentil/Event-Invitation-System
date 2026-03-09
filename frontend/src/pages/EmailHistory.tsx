import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { emailLogsApi, type EmailLogEntryGlobal } from '../api'

const typeLabel: Record<string, string> = {
  invitation: 'Invitation',
  reminder: 'Rappel',
  event_created: 'Événement créé',
  reset_password: 'Réinitialisation mot de passe',
}

export default function EmailHistory() {
  const [logs, setLogs] = useState<EmailLogEntryGlobal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await emailLogsApi.list({ page, per_page: perPage })
      const list = Array.isArray(res.data.data) ? res.data.data : []
      setLogs(list)
      const meta = res.data.meta?.pagination
      if (meta) {
        setTotalPages(meta.last_page)
        setTotal(meta.total)
      } else {
        setTotal(list.length)
        setTotalPages(1)
      }
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } }
      const msg = ax.response?.status === 401
        ? 'Session expirée. Reconnectez-vous.'
        : (ax.response?.data?.message ?? 'Impossible de charger l\'historique des emails.')
      setError(msg)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="page-container">
      <h1 className="page-title mb-2">Historique des emails</h1>
      <p className="page-subtitle mb-8">Tous les envois liés à vos événements (invitations, rappels, etc.).</p>

      {error && (
        <div className="alert alert-error mb-6">{error}</div>
      )}

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <div className="card-body text-center text-slate-600 py-12 max-w-md mx-auto">
            <p className="font-medium">Aucun envoi enregistré</p>
            <p className="text-sm mt-2 text-slate-500">
              Les invitations, rappels et notifications envoyés à partir de maintenant apparaîtront ici. Créez un événement et envoyez des invitations pour voir des entrées.
            </p>
            <Link to="/events" className="btn btn-primary btn-md mt-6 inline-block">
              Voir mes événements
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Événement</th>
                    <th className="px-4 py-3">Invité</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
                        {new Date(log.sent_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">
                          {typeLabel[log.type] ?? log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{log.event_title ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{log.guest_name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{log.email}</td>
                      <td className="px-4 py-3">
                        {log.status === 'failed' ? (
                          <span className="text-red-600 text-sm" title={log.error_message ?? ''}>
                            Échec
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-sm">Envoyé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  {total} envoi(s) au total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
