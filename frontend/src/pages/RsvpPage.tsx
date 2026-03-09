import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'

interface RsvpData {
  guest: { name: string; status: string; attendees_count?: number | null; rsvp_message?: string | null }
  event: { title: string; description: string | null; location: string | null; date: string; time: string; rsvp_deadline?: string | null }
}

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<RsvpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [responded, setResponded] = useState(false)
  const [attendeesCount, setAttendeesCount] = useState('1')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Lien invalide')
      setLoading(false)
      return
    }
    api
      .get<{ data: RsvpData }>(`/rsvp/${token}`)
      .then((res) => {
        setData(res.data.data)
        setResponded(['confirmed', 'declined'].includes(res.data.data.guest.status))
        if (res.data.data.guest.attendees_count != null) {
          setAttendeesCount(String(res.data.data.guest.attendees_count))
        }
        if (res.data.data.guest.rsvp_message) {
          setMessage(res.data.data.guest.rsvp_message)
        }
      })
      .catch(() => setError('Lien invalide ou expiré'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleRespond(status: 'confirmed' | 'declined') {
    if (!token || submitting) return
    setError('')
    setSubmitting(true)
    try {
      const payload: { status: 'confirmed' | 'declined'; attendees_count?: number; rsvp_message?: string } = { status }

      if (status === 'confirmed') {
        const count = Number(attendeesCount || '1')
        if (!Number.isFinite(count) || count < 1 || count > 20) {
          setError("Merci d'indiquer un nombre de personnes valide (1–20).")
          setSubmitting(false)
          return
        }
        payload.attendees_count = count
      }

      if (message.trim()) {
        payload.rsvp_message = message.trim()
      }

      await api.post(`/rsvp/${token}`, payload)
      setResponded(true)
      setData((prev) =>
        prev
          ? {
              ...prev,
              guest: {
                ...prev.guest,
                status,
                attendees_count: payload.attendees_count ?? prev.guest.attendees_count,
                rsvp_message: payload.rsvp_message ?? prev.guest.rsvp_message,
              },
            }
          : null,
      )
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } }
      setError(ax.response?.data?.message ?? 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md text-center">
          <p className="text-red-600">{error || 'Lien invalide'}</p>
        </div>
      </div>
    )
  }

  const { event, guest } = data
  const deadline = event.rsvp_deadline ? new Date(event.rsvp_deadline + 'T23:59:59') : null
  const isPastDeadline = deadline !== null && new Date() > deadline

  const apiBase = api.defaults.baseURL ?? ''
  const icsUrl = token ? `${apiBase}/rsvp/${token}/calendar` : ''
  const startDate = new Date(event.date + 'T' + event.time)
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
  const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z'
  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card shadow-lg max-w-lg w-full">
        <div className="card-header">
          <h1 className="page-title text-xl">Répondre à l'invitation</h1>
          <p className="text-slate-600 mt-1">Bonjour {guest.name},</p>
        </div>
        <div className="card-body space-y-6">
          <div>
            <h2 className="font-semibold text-slate-900">{event.title}</h2>
            {event.location && <p className="text-slate-600 text-sm">{event.location}</p>}
            <p className="text-slate-600 text-sm mt-1">{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</p>
            {event.rsvp_deadline && !isPastDeadline && (
              <p className="text-amber-600 text-sm mt-1">Répondez avant le {new Date(event.rsvp_deadline).toLocaleDateString('fr-FR')}</p>
            )}
            {event.description && <p className="text-slate-600 text-sm mt-2">{event.description}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <a href={icsUrl} download="invitation.ics" className="text-sm text-primary-600 hover:underline">
                📅 Télécharger .ics
              </a>
              <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                Google Calendar
              </a>
            </div>
          </div>
          {isPastDeadline && !responded ? (
            <p className="text-amber-700 font-medium bg-amber-50 p-3 rounded-lg">
              La date limite de réponse est dépassée. Vous ne pouvez plus modifier votre réponse.
            </p>
          ) : responded ? (
            <p className="text-emerald-600 font-medium">
              Merci pour votre réponse.
              {guest.status === 'confirmed' && " Nous avons hâte de vous voir !"}
              {guest.status === 'declined' && " Nous espérons vous voir une prochaine fois."}
            </p>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="form-group">
                <label className="form-label text-sm">Combien de personnes seront présentes ?</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(e.target.value)}
                  className="form-input"
                />
                <p className="text-xs text-slate-500 mt-1">Incluez-vous et vos accompagnants (ex: 2 pour vous + 1 invité).</p>
              </div>
              <div className="form-group">
                <label className="form-label text-sm">Un message pour l'organisateur (optionnel)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input min-h-[80px]"
                  maxLength={1000}
                  placeholder="Précisez par exemple des restrictions alimentaires, une arrivée tardive, etc."
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => handleRespond('confirmed')} disabled={submitting} className="btn btn-primary btn-lg flex-1">
                  Je confirme ma présence
                </button>
                <button type="button" onClick={() => handleRespond('declined')} disabled={submitting} className="btn btn-secondary btn-lg flex-1">
                  Je ne peux pas venir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
