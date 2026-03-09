import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/events', label: 'Événements', icon: '📅' },
  { to: '/email-history', label: 'Historique des emails', icon: '✉️' },
  { to: '/profile', label: 'Profil', icon: '👤' },
  { to: '/settings', label: 'Paramètres', icon: '⚙️' },
  { to: '/privacy', label: 'Confidentialité', icon: '🔒' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-tight">Plateforme Événements</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestion des invitations</p>
        </div>
        <nav className="p-3 flex-1">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  <span className="text-lg" aria-hidden>{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-400 text-sm">
            <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </span>
            <span className="truncate">{user?.name}</span>
          </div>
          <button
            onClick={() => logout()}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white text-sm"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
