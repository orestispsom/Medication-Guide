import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import FamilyCard from '../components/FamilyCard'
import { useTheme } from '../context/ThemeContext'

const QUICK_CHIPS = [
  { label: 'Clozapine Titration', query: 'Clozapine' },
  { label: 'Lithium Level', query: 'Lithium' },
  { label: 'Cobenfy (Dual Muscarinic)', query: 'Cobenfy' },
  { label: 'Ashton BZD Taper', path: '/cross-titration/protocol-10-long-term-benzodiazepine-deprescribing-the-ashton-manual-paradigm' },
  { label: 'MAOI Safe Washout', path: '/cross-titration/protocol-03-ssri-to-maoi-cross-titration' },
  { label: 'Auvelity (NMDA)', query: 'Auvelity' },
  { label: 'Cariprazine D3', query: 'Cariprazine' },
  { label: 'Emergency Antidotes', path: '/family/antidotes-interventional' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      {/* Top Header: Single Line */}
      <div className="flex items-center justify-between mb-4 pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>💊</span>
          <span>Psychiatric Medication App</span>
        </h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-amber-500 dark:hover:text-yellow-400 hover:border-amber-300 dark:hover:border-yellow-500 transition-all shadow-2xs text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-4 pointer-events-none"
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
            placeholder="Search 170+ drugs, brands (e.g. Cobenfy, Vyvanse), press / to focus..."
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl pl-11 pr-10 py-3.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-4 text-xs font-mono font-semibold text-gray-300 dark:text-gray-600 pointer-events-none border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
              /
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 divide-y divide-gray-50 dark:divide-gray-700">
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
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ({drug.brand.split('·')[0].replace('US:', '').trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{drug.subgroup}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: (family?.color || '#6366f1') + '15',
                        color: family?.color || '#6366f1',
                      }}
                    >
                      {family?.shortName || drug.family}
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No medications matching &quot;{searchQuery}&quot;
              </div>
            )}
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  navigate(`/all-drugs?search=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                }}
                className="w-full py-2.5 px-4 bg-gray-50 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
              >
                View all results in A-Z Directory →
              </button>
            )}
          </div>
        )}
      </div>

      {/* High-Yield Clinical Quick Prescribing Chips with mousewheel support */}
      <div
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY
          }
        }}
        className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-6"
      >
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap mr-1">
          Quick Picks:
        </span>
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => {
              if (chip.path) {
                navigate(chip.path)
              } else if (chip.query) {
                setSearchQuery(chip.query)
              }
            }}
            className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 shadow-2xs transition-all cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 1. CLINICAL DOMAINS & DRUG FAMILIES FIRST */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>💊</span>
          <span>Clinical Domains & Drug Families</span>
        </h2>
        <button
          onClick={() => navigate('/all-drugs')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          Browse All ({data.drugs.length}) →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {data.families.map(family => (
          <FamilyCard key={family.id} family={family} />
        ))}
      </div>

      {/* 2. CLINICAL DECISION TOOLS SECOND */}
      <div
        onClick={() => navigate('/tools')}
        className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-5 text-white shadow-md mb-6 cursor-pointer hover:shadow-lg transition-all border border-teal-800/40 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-600 text-teal-100">
              Point-of-Care Clinical Tools
            </span>
            <h3 className="font-extrabold text-base mt-2 mb-1 group-hover:text-teal-300 transition-colors">
              Clinical Decision Calculators & Pharmacokinetic Engines
            </h3>
            <p className="text-xs text-teal-200/90 leading-relaxed max-w-md">
              CPZ & BZD equivalencies · Lithium 12h TDM · Clozapine REMS triage · CYP450 collisions · QTc stacker · SGA metabolic tracking.
            </p>
          </div>
          <span className="text-2xl text-teal-300 group-hover:translate-x-1 transition-transform flex-shrink-0">
            🛠️
          </span>
        </div>

        {/* 1-Tap Quick Tool Chips */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-teal-800/40">
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=cpz'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            🎭 CPZ Converter
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=lithium'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            🧪 Lithium TDM
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=clozapine'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            🩸 Clozapine REMS
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=cyp'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            ⚡ CYP450
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=qtc'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            ❤️ QTc Stacker
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=bzd'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            ⚖️ BZD / Ashton
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=metabolic'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors cursor-pointer"
          >
            📊 Metabolic
          </button>
        </div>
      </div>

      {/* 3. High-Yield Quick Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <button
          onClick={() => navigate('/all-drugs')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">All Drugs</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Complete A–Z index</p>
        </button>

        <button
          onClick={() => navigate('/cross-titration')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Cross-Titration</span>
          </div>
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 mt-1">20 Switch Protocols</p>
        </button>

        <button
          onClick={() => navigate('/receptors')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="text-xs font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Receptors</span>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">44 Molecular Targets</p>
        </button>

        <button
          onClick={() => navigate('/family/antidotes-interventional')}
          className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-500 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <span className="text-xs font-extrabold text-rose-900 dark:text-rose-200 group-hover:text-rose-700 dark:group-hover:text-rose-300">Antidotes</span>
          </div>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">Emergency Rescues</p>
        </button>
      </div>

      {/* Cross-Module Clinical Tools Callout */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-700 text-indigo-200">
            Module 12 Master Tool
          </span>
          <h3 className="text-base font-bold mt-1.5">
            Cross-Titration & Deprescribing Algorithm
          </h3>
          <p className="text-xs text-indigo-200 mt-0.5 max-w-md">
            Interactive step-by-step algorithms, receptor shift kinetics, Ashton BZD tapers, MAOI washouts, and emergency rescue guides.
          </p>
        </div>
        <button
          onClick={() => navigate('/cross-titration')}
          className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap cursor-pointer"
        >
          Launch Protocols →
        </button>
      </div>
    </div>
  )
}
