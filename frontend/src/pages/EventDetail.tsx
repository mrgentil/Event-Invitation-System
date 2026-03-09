import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { eventsApi, guestsApi, type Event, type Guest } from '../api'

const statusLabel: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Oui',
  declined: 'Non',
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addSendInvitation, setAddSendInvitation] = useState(true)
  const [adding, setAdding] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')

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
      toast.success('Événement supprimé')
      navigate('/events')
    } catch {
      setDeleteError('Impossible de supprimer l\'événement')
    } finally {
      setDeleteLoading(false)
      setDeleteConfirm(false)
    }
  }

  async function handleDuplicate() {
    if (!event) return
    try {
      const res = await eventsApi.duplicate(event.id, { date_offset_days: 7, copy_guests: true })
      toast.success('Événement dupliqué')
      navigate(`/events/${res.data.data.id}`)
    } catch {
      toast.error('Impossible de dupliquer')
    }
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault()
    if (!event || !addName.trim() || !addEmail.trim()) return
    setAdding(true)
    try {
      await guestsApi.add(event.id, { name: addName.trim(), email: addEmail.trim(), send_invitation: addSendInvitation })
      setAddName('')
      setAddEmail('')
      toast.success('Invité ajouté')
      loadEvent()
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      toast.error(ax.response?.data?.message ?? 'Erreur lors de l\'ajout')
    } finally {
      setAdding(false)
    }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!event || !importFile) return
    setImporting(true)
    try {
      const res = await guestsApi.import(event.id, importFile)
      setImportFile(null)
      toast.success(`${res.data.data.count} invité(s) ajouté(s)`)
      loadEvent()
    } catch {
      toast.error('Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  function handleExport() {
    if (!event) return
    guestsApi.export(event.id).then((res) => {
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `invites-${event.id}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Export téléchargé')
    }).catch(() => toast.error('Erreur lors de l\'export'))
  }

  async function handleResendAll() {
    if (!event) return
    try {
      const res = await guestsApi.resend(event.id)
      toast.success(`${res.data.data.count} invitation(s) renvoyée(s)`)
    } catch {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  function startEdit(g: Guest) {
    setEditingId(g.id)
    setEditName(g.name)
    setEditEmail(g.email)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!event || editingId == null) return
    try {
      await guestsApi.update(event.id, editingId, { name: editName.trim(), email: editEmail.trim() })
      setEditingId(null)
      toast.success('Invité mis à jour')
      loadEvent()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function deleteGuest(guestId: number) {
    if (!event) return
    try {
      await guestsApi.delete(event.id, guestId)
      toast.success('Invité supprimé')
      loadEvent()
    } catch {
      toast.error('Erreur lors de la suppression')
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
      <div className="page-container">
        <div className="alert alert-error">{error || 'Événement introuvable'}</div>
        <Link to="/events" className="mt-4 inline-block btn btn-secondary btn-md">← Retour aux événements</Link>
      </div>
    )
  }

  const guests = event.guests || []
  const counts = event.guest_status_counts ?? { pending: 0, confirmed: 0, declined: 0 }

  return (
    <div className="page-container">
      {deleteError && <div className="alert alert-error mb-6" role="alert">{deleteError}</div>}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <Link to="/events" className="text-sm text-primary-600 hover:underline">← Retour aux événements</Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDuplicate} className="btn btn-secondary btn-md">Dupliquer</button>
          <Link to={`/events/${event.id}/edit`} className="btn btn-primary btn-md">Modifier</Link>
          {!deleteConfirm ? (
            <button type="button" onClick={() => setDeleteConfirm(true)} className="btn btn-danger btn-md">Supprimer</button>
          ) : (
            <>
              <span className="text-sm text-slate-600 self-center">Supprimer cet événement ?</span>
              <button type="button" onClick={handleDelete} disabled={deleteLoading} className="btn btn-danger btn-md">{deleteLoading ? 'Suppression...' : 'Oui'}</button>
              <button type="button" onClick={() => setDeleteConfirm(false)} className="btn btn-secondary btn-md">Annuler</button>
            </>
          )}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="card-header">
          <h1 className="page-title">{event.title}</h1>
          {event.description && (
            <p className="text-slate-600 mt-2">{event.description}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
            <span>{event.time}</span>
            {event.location && <span>{event.location}</span>}
          </div>
          {guests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="text-green-600 font-medium">{counts.confirmed} Oui</span>
              <span className="text-red-600 font-medium">{counts.declined} Non</span>
              <span className="text-slate-500">{counts.pending} En attente</span>
            </div>
          )}
        </div>

        <div className="card-body space-y-6">
          <h2 className="font-semibold text-slate-900">Invités ({guests.length})</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <form onSubmit={handleAddGuest} className="card-body border border-slate-200 rounded-xl space-y-4">
              <h3 className="form-section-title">Ajouter un invité</h3>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Nom" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@exemple.fr" className="form-input" required />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={addSendInvitation} onChange={(e) => setAddSendInvitation(e.target.checked)} className="form-checkbox" />
                Envoyer l'invitation par email
              </label>
              <button type="submit" disabled={adding} className="btn btn-primary btn-md w-full">{adding ? 'Ajout...' : 'Ajouter'}</button>
            </form>

            <div className="card-body border border-slate-200 rounded-xl space-y-4">
              <h3 className="form-section-title">Import / Export</h3>
              <form onSubmit={handleImport} className="form-group">
                <label className="form-label">Fichier Excel / CSV</label>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} className="form-file" />
                <button type="submit" disabled={!importFile || importing} className="btn btn-secondary btn-md mt-2">{importing ? 'Import...' : 'Importer'}</button>
              </form>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" onClick={handleExport} className="btn btn-secondary btn-sm">Exporter CSV</button>
                <button type="button" onClick={handleResendAll} disabled={guests.length === 0} className="btn btn-secondary btn-sm">Renvoyer toutes les invitations</button>
              </div>
            </div>
          </div>

          {guests.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucun invité.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {guests.map((g) => (
                <li key={g.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  {editingId === g.id ? (
                    <form onSubmit={saveEdit} className="flex flex-wrap items-center gap-2 flex-1">
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="form-input py-1.5 px-2 text-sm w-32" required />
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-input py-1.5 px-2 text-sm w-40" required />
                      <button type="submit" className="btn btn-primary btn-sm">Enregistrer</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Annuler</button>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">{g.name}</span>
                        <span className="text-slate-600 text-sm">{g.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          g.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          g.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {statusLabel[g.status ?? 'pending']}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => startEdit(g)} className="btn btn-ghost btn-sm">Modifier</button>
                        <button type="button" onClick={() => deleteGuest(g.id)} className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50">Supprimer</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
