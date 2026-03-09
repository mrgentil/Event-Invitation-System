import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="page-container max-w-2xl">
        <div className="card">
          <div className="card-body p-8">
            <h1 className="page-title mb-6">Politique de confidentialité et CGU</h1>

        <section className="mb-6">
          <h2 className="form-section-title">1. Données collectées</h2>
          <p className="text-slate-600 text-sm">
            Nous collectons les informations que vous fournissez lors de l'inscription (nom, adresse email, mot de passe)
            et les données relatives à vos événements et listes d'invités. Ces données sont utilisées uniquement pour
            le fonctionnement du service (création d'événements, envoi d'invitations, rappels).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="form-section-title">2. Utilisation</h2>
          <p className="text-slate-600 text-sm">
            Vos données ne sont pas vendues à des tiers. Les emails d'invitation et de rappel sont envoyés aux
            adresses que vous indiquez. Vous pouvez à tout moment supprimer votre compte et vos données depuis
            votre profil.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="form-section-title">3. Conditions d'utilisation</h2>
          <p className="text-slate-600 text-sm">
            Vous vous engagez à utiliser le service de manière conforme à la loi et à ne pas envoyer de contenu
            illicite ou abusif. Nous nous réservons le droit de suspendre un compte en cas de non-respect de ces
            conditions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="form-section-title">4. Contact</h2>
          <p className="text-slate-600 text-sm">
            Pour toute question relative à vos données ou à cette politique, vous pouvez nous contacter via
            l'application.
          </p>
        </section>

        <p className="text-slate-500 text-xs mt-8">
          Dernière mise à jour : mars 2025.
        </p>

        <Link to="/register" className="mt-6 inline-block btn btn-secondary btn-md">← Retour à l'inscription</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
