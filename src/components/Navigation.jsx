import { useNavigate, useLocation } from 'react-router-dom'

export default function Navigation({ onOpenSearch, onOpenFavorites }) {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    {
      label: 'Home',
      icon: '🏠',
      path: '/',
      isActive: path === '/',
    },
    {
      label: 'Drugs',
      icon: '📋',
      path: '/all-drugs',
      isActive: path === '/all-drugs',
    },
    {
      label: 'Titration',
      icon: '🔄',
      path: '/cross-titration',
      isActive: path.startsWith('/cross-titration'),
    },
    {
      label: 'Compare',
      icon: '⚖️',
      path: '/comparison',
      isActive: path.includes('/comparison'),
    },
    {
      label: 'Tools',
      icon: '🛠️',
      path: '/tools',
      isActive: path.startsWith('/tools'),
    },
    {
      label: 'Receptors',
      icon: '🧬',
      path: '/receptors',
      isActive: path.startsWith('/receptors'),
    },
  ]

  return (
    <nav className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] p-1.5 transition-all">
      <div className="flex items-center justify-between gap-1">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
              item.isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium'
            }`}
          >
            <span className="text-base leading-none mb-1">{item.icon}</span>
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        ))}

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-medium cursor-pointer"
            title="Clinical Favorites"
          >
            <span className="text-base leading-none mb-1">⭐</span>
            <span className="text-[11px] tracking-tight">Starred</span>
          </button>
        )}

        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-medium cursor-pointer"
            title="Spotlight Search (Ctrl+K or /)"
          >
            <span className="text-base leading-none mb-1">🔍</span>
            <span className="text-[11px] tracking-tight">Search</span>
          </button>
        )}
      </div>
    </nav>
  )
}
