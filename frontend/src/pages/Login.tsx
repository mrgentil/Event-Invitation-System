import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors
        ? Object.values(ax.response.data.errors).flat().join(' ')
        : 'Email ou mot de passe incorrect'
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
              <h1 className="page-title text-3xl">Bon retour</h1>
              <p className="page-subtitle">Connectez-vous à votre compte</p>
            </div>
            {error && (
              <div className="alert alert-error mb-6" role="alert">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="form-section space-y-5">
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Mot de passe oublié ?</Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <p className="mt-8 text-center text-slate-600 text-sm">
              Vous n'avez pas de compte ? <Link to="/register" className="font-medium text-primary-600 hover:underline">S'inscrire</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
