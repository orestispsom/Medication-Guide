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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Top Header: Single Line per user directive */}
      <header className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-base shadow-xs">
            💊
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Psychiatric Medication App
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              12-Module Master Clinical Psychopharmacology Compendium
            </p>
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
      <div className="relative mb-3">
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

      {/* High-Yield Clinical Quick Prescribing Chips with mousewheel support */}
      <div
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY
          }
        }}
        className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-8"
      >
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
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
            className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 1. CLINICAL DOMAINS & DRUG FAMILIES FIRST */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Clinical Domains & Drug Families
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              170+ monographs across 12 psychopharmacologic classes
            </p>
          </div>
          <button
            onClick={() => navigate('/all-drugs')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap pb-0.5"
          >
            View All 170+ →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {data.families.map(family => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      </div>

      {/* 2. POINT-OF-CARE CLINICAL TOOLS */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Point-of-Care Bedside Tools
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Calculators, therapeutic drug monitoring, and cross-titration engines
            </p>
          </div>
          <button
            onClick={() => navigate('/tools')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap pb-0.5"
          >
            All 9 Tools →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { id: 'cpz', name: 'CPZ Antipsychotic Equivalence', desc: 'Calculate chlorpromazine equivalents, cumulative D2 exposure, and switch targets.', icon: '🎭' },
            { id: 'lithium', name: 'Lithium 12h TDM & Cockcroft-Gault', desc: 'Predict steady-state trough levels, dose adjustments, and eGFR safety clearance.', icon: '🧪' },
            { id: 'clozapine', name: 'Clozapine REMS ANC & Rechallenge', desc: 'Neutropenia triage, ANC monitoring schedules, and benign ethnic neutropenia rules.', icon: '🩸' },
            { id: 'cyp', name: 'CYP450 Interaction Matrix', desc: 'Screen 1A2, 2D6, 3A4, 2C19 inhibitors and inducers with dose-adjustment guidance.', icon: '⚡' },
            { id: 'bzd', name: 'Ashton Benzodiazepine Taper', desc: 'Diazepam substitution and gradual 10%–25% stepped reduction timelines.', icon: '⚖️' },
            { id: 'emergency', name: 'Emergency Toxicity Playbook', desc: 'Stepwise resuscitation orders for NMS, Serotonin Syndrome, and Catatonia.', icon: '🚨' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => navigate(`/tools?tab=${tool.id}`)}
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xl border border-slate-200/60 dark:border-slate-700/60">
                  {tool.icon}
                </span>
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm font-bold">
                  →
                </span>
              </div>

              <h3 className="font-display font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {tool.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. KEY CLINICAL REFERENCE DIRECTORIES */}
      <div className="mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Reference Compendium Directories
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Direct access to cross-cutting compendium directories and matrices
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => navigate('/all-drugs')}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg mb-3 border border-slate-200/60 dark:border-slate-700/60">📋</span>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">A–Z Index</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">170+ Monographs</p>
          </button>

          <button
            onClick={() => navigate('/cross-titration')}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg mb-3 border border-slate-200/60 dark:border-slate-700/60">🔄</span>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Titration</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">20 Protocols</p>
          </button>

          <button
            onClick={() => navigate('/receptors')}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 sm:p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg mb-3 border border-slate-200/60 dark:border-slate-700/60">🧬</span>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Receptors</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">44 Targets & Ki</p>
          </button>

          <button
            onClick={() => navigate('/family/antidotes-interventional')}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 hover:border-rose-300 dark:hover:border-rose-900/60 rounded-2xl p-4 sm:p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center text-lg mb-3 border border-rose-200/60 dark:border-rose-900/60">🚨</span>
            <span className="font-display text-base font-bold text-slate-900 dark:text-white block group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Antidotes</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Emergency Guides</p>
          </button>
        </div>
      </div>
    </div>
  )
}
