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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-lg">
      <div className="max-w-lg mx-auto px-2 flex items-center justify-between h-16">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              item.isActive
                ? 'text-indigo-600 font-extrabold scale-105'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <span className="text-base leading-none mb-1">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {item.isActive && (
              <span className="absolute -top-1 w-5 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-gray-500 hover:text-amber-600 transition-all font-medium"
            title="Clinical Favorites"
          >
            <span className="text-base leading-none mb-1">⭐</span>
            <span className="text-[10px] tracking-tight">Starred</span>
          </button>
        )}

        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-gray-500 hover:text-indigo-600 transition-all font-medium"
            title="Spotlight Search (Ctrl+K or /)"
          >
            <span className="text-base leading-none mb-1">🔍</span>
            <span className="text-[10px] tracking-tight">Search</span>
          </button>
        )}
      </div>
    </nav>
  )
}
