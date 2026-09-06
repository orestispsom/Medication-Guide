import { useNavigate, useLocation } from 'react-router-dom'

export default function Navigation({ onOpenSearch }) {
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
      label: 'All Drugs',
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
      label: 'Receptors',
      icon: '🧬',
      path: '/receptors',
      isActive: path.startsWith('/receptors'),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-200/80 shadow-lg">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              item.isActive
                ? 'text-indigo-600 font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <span className="text-lg leading-none mb-1">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {item.isActive && (
              <span className="absolute -top-1 w-6 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}

        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-gray-500 hover:text-indigo-600 transition-all font-medium"
            title="Spotlight Search (Ctrl+K or /)"
          >
            <span className="text-lg leading-none mb-1">🔍</span>
            <span className="text-[10px] tracking-tight">Search</span>
          </button>
        )}
      </div>
    </nav>
  )
}
