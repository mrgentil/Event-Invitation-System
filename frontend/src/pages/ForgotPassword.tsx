import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
      toast('Si cet email est associé à un compte, un lien vous a été envoyé.', { icon: '📧' })
    } catch {
      toast.error('Une erreur est survenue')
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
              <h1 className="page-title text-3xl">Mot de passe oublié</h1>
              <p className="page-subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>
            {sent ? (
              <p className="text-slate-600 text-sm mb-6">Vérifiez votre boîte de réception (et les spams). Le lien expire dans 60 minutes.</p>
            ) : (
              <form onSubmit={handleSubmit} className="form-section space-y-5">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Adresse email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="vous@exemple.fr" />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
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
