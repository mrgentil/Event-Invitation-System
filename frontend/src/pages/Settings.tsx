import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { authApi, type UserPreferences } from '../api'

export default function Settings() {
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'fr',
    notifications_email_reminders: true,
    notifications_new_rsvp: true,
  })

  useEffect(() => {
    authApi
      .getProfile()
      .then((res) => {
        const prefs = res.data.data?.preferences
        if (prefs && typeof prefs === 'object') {
          setPreferences((p) => ({
            language: prefs.language ?? p.language,
            notifications_email_reminders: prefs.notifications_email_reminders ?? p.notifications_email_reminders,
            notifications_new_rsvp: prefs.notifications_new_rsvp ?? p.notifications_new_rsvp,
          }))
        }
      })
      .catch(() => toast.error('Impossible de charger les paramètres'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authApi.updateProfile({ preferences })
      updateUser(res.data.data)
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title mb-2">Paramètres</h1>
      <p className="page-subtitle mb-8">Gérez vos préférences, notifications et langue.</p>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="card-body space-y-8">
          <section>
            <h2 className="form-section-title mb-4">Langue</h2>
            <div className="form-group">
              <label className="form-label">Langue de l'interface</label>
              <select
                value={preferences.language ?? 'fr'}
                onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value as 'fr' | 'en' }))}
                className="form-input form-select w-48"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="form-section-title mb-4">Notifications par email</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications_email_reminders ?? true}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, notifications_email_reminders: e.target.checked }))
                  }
                  className="form-checkbox"
                />
                <span>Recevoir un rappel lorsque les rappels automatiques sont envoyés aux invités</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notifications_new_rsvp ?? true}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, notifications_new_rsvp: e.target.checked }))
                  }
                  className="form-checkbox"
                />
                <span>Être notifié lorsqu'un invité répond à une invitation</span>
              </label>
            </div>
            <p className="text-slate-500 text-sm mt-2">
              Ces options seront prises en compte dans les prochaines évolutions de la plateforme.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200">
            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
