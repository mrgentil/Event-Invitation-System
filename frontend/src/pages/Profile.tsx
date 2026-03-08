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
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon profil</h1>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-w-xl mb-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Adresse email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Nouveau mot de passe (laisser vide pour conserver l'actuel)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1">
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-red-200 p-6 max-w-xl">
        <h2 className="font-semibold text-slate-900 mb-2">Zone de danger</h2>
        <p className="text-sm text-slate-600 mb-4">
          La suppression de votre compte supprimera tous vos événements et invités. Cette action est irréversible.
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Êtes-vous sûr ?</span>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Suppression...' : 'Oui, supprimer le compte'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
