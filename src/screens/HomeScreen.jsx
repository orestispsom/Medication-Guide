import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import ReceptorNavModal from '../components/ReceptorNavModal'
import { useTheme } from '../context/ThemeContext'

const DRUG_FAMILIES = [
  { id: 'antipsychotics', name: 'Antipsychotics', icon: '🧠', color: '#8E44AD', path: '/family/antipsychotics' },
  { id: 'antidepressants', name: 'Antidepressants', icon: '💊', color: '#2563EB', path: '/family/antidepressants' },
  { id: 'mood-stabilizers', name: 'Mood Stabilizers', icon: '⚖️', color: '#D97706', path: '/family/mood-stabilizers' },
  { id: 'anxiolytics', name: 'Anxiolytics, Sedatives & Hypnotics', icon: '🌙', color: '#059669', path: '/family/anxiolytics' },
  { id: 'adhd', name: 'ADHD, Wakefulness & Cognitive Enhancers', icon: '⚡', color: '#DC2626', path: '/family/adhd' },
  { id: 'substance-use', name: 'SUD & Addiction Medicine', icon: '🛡️', color: '#0D9488', path: '/family/substance-use' },
  { id: 'neuropsychiatry', name: 'Neuropsychiatry & Movement Disorders', icon: '🩺', color: '#7C3AED', path: '/family/neuropsychiatry' },
  { id: 'neurology', name: 'Neurology Essentials for Psychiatry', icon: '🔬', color: '#4F46E5', path: '/family/neurology' },
  { id: 'antidotes-interventional', name: 'Emergency Antidotes', icon: '🚨', color: '#E11D48', path: '/family/antidotes-interventional' },
]



export default function HomeScreen() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isReceptorNavOpen, setIsReceptorNavOpen] = useState(false)
  const searchInputRef = useRef(null)

  // Listen for keyboard '/' shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Live filter drugs across generic name, brand names, subgroup, family, and indications
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return data.drugs
      .filter(drug => {
        const nameMatch = drug.name.toLowerCase().includes(q)
        const brandMatch = drug.brand && drug.brand.toLowerCase().includes(q)
        const subgroupMatch = drug.subgroup && drug.subgroup.toLowerCase().includes(q)
        const familyMatch = drug.family && drug.family.toLowerCase().includes(q)
        const indicationMatch = drug.indications && drug.indications.some(ind => ind.toLowerCase().includes(q))
        const pearlMatch = drug.clinicalPearls && drug.clinicalPearls.some(p => p.toLowerCase().includes(q))
        return nameMatch || brandMatch || subgroupMatch || familyMatch || indicationMatch || pearlMatch
      })
      .slice(0, 8)
  }, [searchQuery])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length === 1) {
        navigate(`/drug/${searchResults[0].id}`)
        setSearchQuery('')
      } else if (searchResults.length > 1) {
        navigate(`/all-drugs?search=${encodeURIComponent(searchQuery)}`)
        setSearchQuery('')
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-base shadow-xs">
            💊
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Psychiatric Medication App
            </h1>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="text-sm">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </header>

      {/* Global Command Bar / Spotlight Search */}
      <div className="relative mb-6">
        <div className="relative flex items-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <svg
            className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search drugs, brands, or indications (press / to focus)..."
            className="w-full bg-transparent text-slate-900 dark:text-white rounded-2xl pl-12 pr-12 py-3.5 text-base shadow-none focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-4 text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 pointer-events-none border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
              /
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-30 divide-y divide-slate-100 dark:divide-slate-800">
            {searchResults.length > 0 ? (
              searchResults.map(drug => {
                const family = data.families.find(f => f.id === drug.familyId)
                return (
                  <button
                    key={drug.id}
                    onClick={() => {
                      setSearchQuery('')
                      navigate(`/drug/${drug.id}`)
                    }}
                    className="w-full px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            ({drug.brand.split('·')[0].replace('US:', '').trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{drug.subgroup}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                      {family?.shortName || drug.family}
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                No medications matching &quot;{searchQuery}&quot;
              </div>
            )}
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  navigate(`/all-drugs?search=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                }}
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
              >
                View all results in A-Z Directory →
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. CLINICAL DOMAINS & DRUG FAMILIES */}
      <div className="mb-9">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Drug Families
          </h2>
          <button
            onClick={() => navigate('/all-drugs')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            View All A–Z →
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {DRUG_FAMILIES.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${item.color}14`,
                    borderColor: `${item.color}28`,
                  }}
                >
                  <span>{item.icon}</span>
                </div>
                <span className="font-display font-semibold text-[15px] sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center pl-2 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}

          {/* Small vertical gap between last drug family and Receptors & Targets */}
          <div className="pt-2 sm:pt-2.5"></div>

          {/* Receptors & Targets bar in distinct color */}
          <button
            onClick={() => navigate('/receptors')}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-indigo-50/30 hover:from-indigo-100/90 hover:to-purple-100/60 dark:from-[#171633] dark:via-[#13172e] dark:to-[#111827] dark:hover:from-[#1f1d44] dark:hover:to-[#161a35] border-2 border-indigo-400/40 dark:border-indigo-500/40 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl shadow-[0_2px_8px_rgba(99,102,241,0.08)] hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-indigo-500/15 dark:bg-indigo-500/25 border border-indigo-500/35 text-indigo-600 dark:text-indigo-400 transition-transform duration-200 group-hover:scale-105">
                <span>🧬</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="font-display font-bold text-[15px] sm:text-base text-indigo-950 dark:text-indigo-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                  Receptors & Targets
                </span>
              </div>
            </div>

            <div className="flex items-center pl-2 flex-shrink-0">
              <svg
                className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-200 group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Clinical Comparison Matrix bar in the same style */}
          <button
            onClick={() => navigate('/comparison')}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: '#D9770614',
                  borderColor: '#D9770628',
                }}
              >
                <span>⚖️</span>
              </div>
              <span className="font-display font-semibold text-[15px] sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                Clinical Comparison Matrix
              </span>
            </div>

            <div className="flex items-center pl-2 flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Transition & Deprescribing bar in the same style */}
          <button
            onClick={() => navigate('/cross-titration')}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundColor: '#05966914',
                  borderColor: '#05966928',
                }}
              >
                <span>🔄</span>
              </div>
              <span className="font-display font-semibold text-[15px] sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                Transition & Deprescribing
              </span>
            </div>

            <div className="flex items-center pl-2 flex-shrink-0">
              <svg
                className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Tools Hub bar in different highlight color */}
          <button
            onClick={() => navigate('/tools')}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/30 hover:from-emerald-100/90 hover:to-teal-100/60 dark:from-[#092720] dark:via-[#0a2e26] dark:to-[#111827] dark:hover:from-[#0d3930] dark:hover:to-[#123e35] border-2 border-emerald-400/40 dark:border-emerald-500/40 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl shadow-[0_2px_8px_rgba(16,185,129,0.08)] hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-105">
                <span>🛠️</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="font-display font-bold text-[15px] sm:text-base text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors truncate">
                  Tools Hub
                </span>
              </div>
            </div>

            <div className="flex items-center pl-2 flex-shrink-0">
              <svg
                className="w-4 h-4 text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 group-hover:translate-x-1 transition-all duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Molecular Receptor & Target Navigation Modal */}
      <ReceptorNavModal
        isOpen={isReceptorNavOpen}
        onClose={() => setIsReceptorNavOpen(false)}
      />
    </div>
  )
}
