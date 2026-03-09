import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (!acceptTerms) {
      setError('Veuillez accepter la politique de confidentialité et les CGU')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password, passwordConfirmation, acceptTerms)
      navigate('/dashboard')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : 'Échec de l\'inscription'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card shadow-lg">
          <div className="card-body p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="page-title text-3xl">Créer un compte</h1>
              <p className="page-subtitle">Plateforme d'invitations aux événements</p>
            </div>

            {error && (
              <div className="alert alert-error mb-6" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-section space-y-5">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nom</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="form-input"
                  placeholder="Votre nom"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="form-input"
                  placeholder="vous@exemple.fr"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="Minimum 8 caractères"
                />
                <p className="form-hint mt-1">Au moins 8 caractères</p>
              </div>
              <div className="form-group">
                <label htmlFor="password_confirmation" className="form-label">Confirmer le mot de passe</label>
                <input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="form-input"
                  placeholder="Repétez le mot de passe"
                />
              </div>
              <div className="form-group">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="form-checkbox mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-slate-600">
                    J'accepte la{' '}
                    <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                      politique de confidentialité
                    </Link>
                    {' '}et les conditions d'utilisation.
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? 'Création du compte...' : 'S\'inscrire'}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-600 text-sm">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
