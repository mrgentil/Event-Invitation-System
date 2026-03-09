import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (!token || !email) {
      toast.error('Lien invalide')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword({ email, token, password, password_confirmation: passwordConfirmation })
      setSuccess(true)
      toast.success('Mot de passe réinitialisé. Vous pouvez vous connecter.')
    } catch {
      toast.error('Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-12">
        <div className="card shadow-lg max-w-md text-center p-8">
          <p className="alert alert-error">Lien de réinitialisation invalide ou manquant.</p>
          <Link to="/forgot-password" className="mt-6 inline-block btn btn-primary btn-md">Demander un nouveau lien</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="card-body p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="page-title text-3xl">Nouveau mot de passe</h1>
              <p className="page-subtitle">Choisissez un nouveau mot de passe.</p>
            </div>
            {success ? (
            <Link to="/login" className="btn btn-primary btn-lg w-full block text-center">Se connecter</Link>
            ) : (
              <form onSubmit={handleSubmit} className="form-section space-y-5">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Nouveau mot de passe</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="form-input" placeholder="Minimum 8 caractères" />
                </div>
                <div className="form-group">
                  <label htmlFor="password_confirmation" className="form-label">Confirmer le mot de passe</label>
                  <input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required minLength={8} className="form-input" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            )}
            <p className="mt-8 text-center text-slate-600 text-sm">
              <Link to="/login" className="font-medium text-primary-600 hover:underline">Retour à la connexion</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
