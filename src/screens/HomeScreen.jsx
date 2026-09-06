import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import FamilyCard from '../components/FamilyCard'

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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
          <span>📚</span>
          <span>12-Module Master Psychopharmacology Compendium</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Psychiatric Medication Guide
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Evidence-Based Pharmacodynamics, Titration & Deprescribing
        </p>

        {/* Stats Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] font-semibold text-gray-400">
          <span>{data.drugs.length} Monographs</span>
          <span>•</span>
          <span>{data.protocols?.length || 20} Transition Protocols</span>
          <span>•</span>
          <span>{data.receptors.length} Molecular Targets</span>
          <span>•</span>
          <span>8 Adverse Safety Domains</span>
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none"
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
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600 p-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-4 text-xs font-mono font-semibold text-gray-300 pointer-events-none border border-gray-200 rounded px-1.5 py-0.5">
              /
            </span>
          )}
        </div>

        {/* Live Search Dropdown */}
        {searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 divide-y divide-gray-50">
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
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50/50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm group-hover:text-indigo-600">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-xs text-gray-400">
                            ({drug.brand.split('·')[0].replace('US:', '').trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{drug.subgroup}</p>
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
              <div className="p-4 text-center text-sm text-gray-500">
                No medications matching &quot;{searchQuery}&quot;
              </div>
            )}
            {searchResults.length > 0 && (
              <button
                onClick={() => {
                  navigate(`/all-drugs?search=${encodeURIComponent(searchQuery)}`)
                  setSearchQuery('')
                }}
                className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-center text-xs font-semibold text-indigo-600 transition-colors"
              >
                View all results in A-Z Directory →
              </button>
            )}
          </div>
        )}
      </div>

      {/* High-Yield Clinical Quick Prescribing Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap mr-1">
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
            className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-2xs transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* High-Yield Quick Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <button
          onClick={() => navigate('/all-drugs')}
          className="bg-white border border-gray-200 hover:border-indigo-400 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span className="text-xs font-extrabold text-gray-900 group-hover:text-indigo-600">All Drugs</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Complete A–Z index</p>
        </button>

        <button
          onClick={() => navigate('/cross-titration')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-400 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="text-xs font-extrabold text-indigo-900 group-hover:text-indigo-700">Cross-Titration</span>
          </div>
          <p className="text-[11px] text-indigo-500 mt-1">20 Switch Protocols</p>
        </button>

        <button
          onClick={() => navigate('/receptors')}
          className="bg-white border border-gray-200 hover:border-indigo-400 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <span className="text-xs font-extrabold text-gray-900 group-hover:text-indigo-600">Receptors</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">44 Molecular Targets</p>
        </button>

        <button
          onClick={() => navigate('/family/antidotes-interventional')}
          className="bg-rose-50 border border-rose-200 hover:border-rose-400 rounded-2xl p-3.5 text-left shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <span className="text-xs font-extrabold text-rose-900 group-hover:text-rose-700">Antidotes</span>
          </div>
          <p className="text-[11px] text-rose-500 mt-1">Emergency Rescues</p>
        </button>
      </div>

      {/* Clinical Decision Tools Banner */}
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
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            🎭 CPZ Converter
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=lithium'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            🧪 Lithium TDM
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=clozapine'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            🩸 Clozapine REMS
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=cyp'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            ⚡ CYP450
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=qtc'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            ❤️ QTc Stacker
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=bzd'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            ⚖️ BZD / Ashton
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/tools?tab=metabolic'); }}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-teal-200 transition-colors"
          >
            📊 Metabolic
          </button>
        </div>
      </div>

      {/* Clinical Families Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Clinical Domains & Drug Families
        </h2>
        <button
          onClick={() => navigate('/all-drugs')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Browse All ({data.drugs.length}) →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {data.families.map(family => (
          <FamilyCard key={family.id} family={family} />
        ))}
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
          className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap"
        >
          Launch Protocols →
        </button>
      </div>
    </div>
  )
}
