import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { eventsApi } from '../api'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [invitationSubject, setInvitationSubject] = useState('')
  const [invitationBody, setInvitationBody] = useState('')
  const [reminderDays, setReminderDays] = useState<number | ''>('')
  const [rsvpDeadline, setRsvpDeadline] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const today = new Date().toISOString().slice(0, 10)
    if (date && date < today) {
      setError('La date ne peut pas être dans le passé')
      return
    }
    if (!file) {
      setError('Veuillez téléverser un fichier Excel avec les colonnes : nom, email')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('location', location)
      formData.append('date', date)
      formData.append('time', time)
      if (invitationSubject) formData.append('invitation_subject', invitationSubject)
      if (invitationBody) formData.append('invitation_body', invitationBody)
      if (reminderDays !== '') formData.append('reminder_days', String(reminderDays))
      if (rsvpDeadline) formData.append('rsvp_deadline', rsvpDeadline)
      formData.append('guests_file', file)
      await eventsApi.create(formData)
      toast.success('Événement créé et invitations envoyées')
      navigate('/events')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : 'Échec de la création de l\'événement'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title mb-2">Créer un événement</h1>
      <p className="page-subtitle mb-8">Renseignez les détails puis importez la liste d'invités (Excel/CSV).</p>

      {error && <div className="alert alert-error mb-6" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-6">
          <div className="form-section-title">Informations générales</div>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Titre *</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" placeholder="Nom de l'événement" />
            </div>
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-textarea" placeholder="Description optionnelle" />
            </div>
            <div className="form-group">
              <label htmlFor="location" className="form-label">Lieu</label>
              <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="Adresse ou lieu" />
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

          <div className="form-section-title">Email d'invitation (optionnel)</div>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="invitation_subject" className="form-label form-label-optional">Sujet de l'email</label>
              <input id="invitation_subject" type="text" value={invitationSubject} onChange={(e) => setInvitationSubject(e.target.value)} className="form-input" placeholder="Par défaut : Invitation : [titre]" />
            </div>
            <div className="form-group">
              <label htmlFor="invitation_body" className="form-label form-label-optional">Corps du message</label>
              <textarea id="invitation_body" value={invitationBody} onChange={(e) => setInvitationBody(e.target.value)} rows={3} className="form-textarea" placeholder="Laissez vide pour le message par défaut" />
            </div>
            <div className="form-group">
              <label htmlFor="reminder_days" className="form-label form-label-optional">Rappel automatique (jours avant)</label>
              <input id="reminder_days" type="number" min={1} max={365} value={reminderDays} onChange={(e) => setReminderDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))} className="form-input" placeholder="Ex. 3" />
            </div>
            <div className="form-group">
              <label htmlFor="rsvp_deadline" className="form-label form-label-optional">Date limite de réponse</label>
              <input id="rsvp_deadline" type="date" value={rsvpDeadline} onChange={(e) => setRsvpDeadline(e.target.value)} className="form-input" min={date || undefined} placeholder="Optionnel" />
              <p className="form-hint mt-1">Après cette date, les invités ne pourront plus modifier leur réponse.</p>
            </div>
          </div>

          <div className="form-section-title">Liste d'invités</div>
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Fichier Excel / CSV *</label>
              <p className="form-hint mb-2">Colonnes attendues : <strong>nom</strong> (ou Nom), <strong>email</strong>. Les invitations seront envoyées après création.</p>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="form-file" />
              {file && <p className="form-hint mt-2">Fichier sélectionné : {file.name}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Création et envoi des invitations...' : 'Créer l\'événement et envoyer les invitations'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
