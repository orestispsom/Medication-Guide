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
            className="w-full bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 text-gray-900 dark:text-white rounded-2xl pl-12 pr-10 py-3.5 text-base shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-4 text-xs font-mono font-semibold text-gray-400 dark:text-gray-500 pointer-events-none border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
              /
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-30 divide-y divide-gray-100 dark:divide-gray-700">
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
                    className="w-full px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({drug.brand.split('·')[0].replace('US:', '').trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{drug.subgroup}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                      {family?.shortName || drug.family}
                    </span>
                  </button>
                )
              })
            ) : (
              <div className="p-5 text-center text-sm text-gray-500 dark:text-gray-400">
                No medications matching &quot;{searchQuery}&quot;
              </div>
            )}
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  navigate(`/all-drugs?search=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                }}
                className="w-full py-3 px-4 bg-gray-50 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
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
        className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-8"
      >
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap mr-1">
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
            className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-2xs transition-all cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 1. CLINICAL DOMAINS & DRUG FAMILIES FIRST */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Clinical Domains & Drug Families
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse 170+ monographs across 12 psychopharmacologic classes
            </p>
          </div>
          <button
            onClick={() => navigate('/all-drugs')}
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Browse All →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {data.families.map(family => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      </div>

      {/* 2. POINT-OF-CARE CLINICAL TOOLS (CALM, CONTENT-FIRST DESIGN) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Point-of-Care Clinical Tools
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive clinical calculators and pharmacodynamic engines
            </p>
          </div>
          <button
            onClick={() => navigate('/tools')}
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            All 9 Tools →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'cpz', name: 'CPZ Dose Converter', desc: 'Convert between FGAs & SGAs to standard chlorpromazine equivalents', icon: '🎭' },
            { id: 'lithium', name: 'Lithium 12h TDM', desc: 'Predict steady-state trough levels & Cockcroft-Gault clearance', icon: '🧪' },
            { id: 'clozapine', name: 'Clozapine REMS ANC', desc: 'Neutropenia triage, rechallenge protocols, and blood monitoring', icon: '🩸' },
            { id: 'cyp', name: 'CYP450 Collision Matrix', desc: 'Screen enzyme induction and inhibition interactions', icon: '⚡' },
            { id: 'bzd', name: 'BZD / Ashton Taper', desc: 'Calculate diazepam equivalents and gradual withdrawal schedules', icon: '⚖️' },
            { id: 'emergency', name: 'Emergency Playbook', desc: 'Rapid rescue protocols for NMS, SS, Catatonia, and toxicity', icon: '🚨' },
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => navigate(`/tools?tab=${tool.id}`)}
              className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 border border-gray-200/90 dark:border-gray-700/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. KEY CLINICAL REFERENCE DIRECTORIES */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
          Reference Compendium Directories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/all-drugs')}
            className="bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 rounded-2xl p-4 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
          >
            <span className="text-2xl block mb-2">📋</span>
            <span className="text-base font-bold text-gray-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">All Drugs</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complete A–Z index</p>
          </button>

          <button
            onClick={() => navigate('/cross-titration')}
            className="bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 rounded-2xl p-4 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
          >
            <span className="text-2xl block mb-2">🔄</span>
            <span className="text-base font-bold text-gray-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Titration</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">20 Switch Protocols</p>
          </button>

          <button
            onClick={() => navigate('/receptors')}
            className="bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 rounded-2xl p-4 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
          >
            <span className="text-2xl block mb-2">🧬</span>
            <span className="text-base font-bold text-gray-900 dark:text-white block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Receptors</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">44 Targets & Ki</p>
          </button>

          <button
            onClick={() => navigate('/family/antidotes-interventional')}
            className="bg-white dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-700/90 hover:border-red-400/60 dark:hover:border-red-500/60 rounded-2xl p-4 text-left shadow-2xs hover:shadow-md transition-all group cursor-pointer"
          >
            <span className="text-2xl block mb-2">🚨</span>
            <span className="text-base font-bold text-gray-900 dark:text-white block group-hover:text-red-600 dark:group-hover:text-red-400">Antidotes</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Emergency Rescues</p>
          </button>
        </div>
      </div>
    </div>
  )
}
