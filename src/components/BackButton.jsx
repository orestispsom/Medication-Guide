import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function BackButton({ title }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      <div className="flex items-center gap-2">
        {title && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-[200px] truncate hidden sm:inline">
            {title}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="p-1.5 px-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-all text-xs cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="p-1.5 px-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-xs cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          title="Return to Home"
        >
          🏠
        </button>
      </div>
    </div>
  )
}
