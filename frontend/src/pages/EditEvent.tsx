import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { eventsApi, type Event } from '../api'

export default function EditEvent() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [invitationSubject, setInvitationSubject] = useState('')
  const [invitationBody, setInvitationBody] = useState('')
  const [reminderDays, setReminderDays] = useState<number | ''>('')
  const [rsvpDeadline, setRsvpDeadline] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    eventsApi
      .get(Number(id))
      .then((res) => {
        const e = res.data.data
        setEvent(e)
        setTitle(e.title)
        setDescription(e.description ?? '')
        setLocation(e.location ?? '')
        setDate(e.date.slice(0, 10))
        setTime(e.time.slice(0, 5))
        setInvitationSubject(e.invitation_subject ?? '')
        setInvitationBody(e.invitation_body ?? '')
        setReminderDays(e.reminder_days ?? '')
        setRsvpDeadline(e.rsvp_deadline ? e.rsvp_deadline.slice(0, 10) : '')
      })
      .catch(() => setError('Événement introuvable'))
      .finally(() => setFetchLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    setError('')
    const today = new Date().toISOString().slice(0, 10)
    if (date && date < today) {
      setError('La date ne peut pas être dans le passé')
      return
    }
    setLoading(true)
    try {
      await eventsApi.update(event.id, {
        title,
        description,
        location,
        date,
        time,
        invitation_subject: invitationSubject || undefined,
        invitation_body: invitationBody || undefined,
        reminder_days: reminderDays === '' ? undefined : Number(reminderDays),
        rsvp_deadline: rsvpDeadline || undefined,
      })
      toast.success('Événement mis à jour')
      navigate(`/events/${event.id}`)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : 'Échec de la mise à jour de l\'événement'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        {error}
        <Link to="/events" className="block mt-2 text-primary-600">Retour aux événements</Link>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Link to={`/events/${id}`} className="text-sm text-primary-600 hover:underline mb-6 inline-block">← Retour à l'événement</Link>
      <h1 className="page-title mb-2">Modifier l'événement</h1>
      <p className="page-subtitle mb-8">Modifiez les informations ci-dessous.</p>
      {error && <div className="alert alert-error mb-6" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Titre *</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
            </div>
        <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-textarea" />
            </div>
            <div className="form-group">
              <label htmlFor="location" className="form-label">Lieu</label>
              <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date *</label>
                <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label htmlFor="time" className="form-label">Heure *</label>
                <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="form-input" />
              </div>
            </div>
          </div>
          <div className="form-section-title">Email d'invitation</div>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="invitation_subject" className="form-label form-label-optional">Sujet (optionnel)</label>
              <input id="invitation_subject" type="text" value={invitationSubject} onChange={(e) => setInvitationSubject(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="invitation_body" className="form-label form-label-optional">Corps (optionnel)</label>
              <textarea id="invitation_body" value={invitationBody} onChange={(e) => setInvitationBody(e.target.value)} rows={3} className="form-textarea" />
            </div>
            <div className="form-group">
              <label htmlFor="reminder_days" className="form-label form-label-optional">Rappel (jours avant)</label>
              <input id="reminder_days" type="number" min={1} max={365} value={reminderDays} onChange={(e) => setReminderDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="rsvp_deadline" className="form-label form-label-optional">Date limite de réponse</label>
              <input id="rsvp_deadline" type="date" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} className="form-input" min={date || undefined} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
