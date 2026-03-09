import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password && password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    setLoading(true)
    try {
      const data: { name?: string; email?: string; password?: string; password_confirmation?: string } = { name, email }
      if (password) {
        data.password = password
        data.password_confirmation = passwordConfirmation
      }
      const res = await authApi.updateProfile(data)
      updateUser(res.data.data)
      setSuccess('Profil mis à jour.')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : 'Échec de la mise à jour du profil'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await authApi.deleteAccount()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login', { replace: true })
      window.location.reload()
    } catch {
      setError('Impossible de supprimer le compte')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title mb-2">Mon profil</h1>
      <p className="page-subtitle mb-8">Gérez vos informations personnelles.</p>

      {error && <div className="alert alert-error mb-6" role="alert">{error}</div>}
      {success && <div className="alert alert-success mb-6" role="status">{success}</div>}

      <div className="card mb-8">
        <div className="card-body">
          <h2 className="form-section-title">Informations du compte</h2>
          <form onSubmit={handleSubmit} className="form-section space-y-5">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nom</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Laisser vide pour ne pas changer" />
              <p className="form-hint mt-1">Minimum 8 caractères</p>
            </div>
            <div className="form-group">
              <label htmlFor="password_confirmation" className="form-label">Confirmer le nouveau mot de passe</label>
              <input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="form-input" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-md">
              {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
            </button>
          </form>
        </div>
      </div>

      <div className="card border-red-200 bg-red-50/30">
        <div className="card-body">
          <h2 className="font-semibold text-slate-900 mb-1">Zone de danger</h2>
          <p className="text-sm text-slate-600 mb-4">La suppression de votre compte supprimera tous vos événements et invités. Cette action est irréversible.</p>
          {!showDeleteConfirm ? (
            <button type="button" onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-md">
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-600">Êtes-vous sûr ?</span>
              <button type="button" onClick={handleDeleteAccount} disabled={deleteLoading} className="btn btn-danger btn-md">
                {deleteLoading ? 'Suppression...' : 'Oui, supprimer le compte'}
              </button>
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary btn-md">
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
