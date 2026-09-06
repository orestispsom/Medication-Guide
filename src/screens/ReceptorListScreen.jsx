import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export const categorizeReceptor = (recId) => {
  const id = (recId || '').toUpperCase()
  if (id.startsWith('D') && ['D1', 'D2', 'D3', 'D4', 'D5'].includes(id)) return 'Dopaminergic'
  if (id.startsWith('5HT') || id.startsWith('5-HT')) return 'Serotonergic'
  if (id.startsWith('ALPHA') || id.startsWith('BETA') || id.startsWith('Α') || id.startsWith('Β')) return 'Adrenergic'
  if (id === 'H1' || id === 'H2' || id === 'H3' || id === 'H4') return 'Histaminergic'
  if (['M1', 'M2', 'M3', 'M4', 'M5'].includes(id)) return 'Muscarinic'
  if (['SERT', 'NET', 'DAT', 'VMAT2'].includes(id)) return 'Transporters'
  if (id.includes('GABA') || ['NMDA', 'AMPA'].includes(id)) return 'GABA & Glutamate'
  if (['MOR', 'KOR', 'DOR', 'SIGMA1', 'OX1R_OX2R'].includes(id)) return 'Opioid & Neuropeptides'
  return 'Enzymes & Channels'
}

const RECEPTOR_CATEGORIES = [
  { id: 'ALL', label: 'All Targets' },
  { id: 'Serotonergic', label: 'Serotonin (5-HT)' },
  { id: 'Dopaminergic', label: 'Dopamine (D)' },
  { id: 'Adrenergic', label: 'Adrenergic (α/β)' },
  { id: 'Transporters', label: 'Transporters (SERT/NET/DAT)' },
  { id: 'Histaminergic', label: 'Histamine (H)' },
  { id: 'Muscarinic', label: 'Muscarinic (M)' },
  { id: 'GABA & Glutamate', label: 'GABA & Glutamate' },
  { id: 'Opioid & Neuropeptides', label: 'Opioid & Peptides' },
  { id: 'Enzymes & Channels', label: 'Enzymes & Channels' },
]

export default function ReceptorListScreen() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCat = searchParams.get('family') || 'ALL'
  const initialTarget = searchParams.get('target') || 'ALL'
  const initialView = searchParams.get('view') || 'drugs' // 'drugs' | 'receptors'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [selectedTarget, setSelectedTarget] = useState(initialTarget)
  const [viewMode, setViewMode] = useState(initialView) // 'drugs' | 'receptors'
  const [drugSortBy, setDrugSortBy] = useState('occupancy') // 'occupancy' | 'name' | 'family'

  // Pre-calculate count of drugs binding each category
  const categoryDrugCounts = useMemo(() => {
    const counts = {}
    data.drugs.forEach(d => {
      const hitCats = new Set()
      ;(d.receptors || []).forEach(r => {
        hitCats.add(categorizeReceptor(r.receptor))
      })
      hitCats.forEach(c => {
        counts[c] = (counts[c] || 0) + 1
      })
    })
    return counts
  }, [])

  // Receptors in current category
  const categoryReceptors = useMemo(() => {
    if (selectedCategory === 'ALL') return data.receptors
    return data.receptors.filter(r => categorizeReceptor(r.id) === selectedCategory)
  }, [selectedCategory])

  // Filtered Receptors based on search & category
  const filteredReceptors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return categoryReceptors.filter(r => {
      if (selectedTarget !== 'ALL' && r.id !== selectedTarget) {
        return false
      }
      if (q) {
        const idMatch = r.id.toLowerCase().includes(q)
        const nameMatch = r.fullName.toLowerCase().includes(q)
        const actionMatch = r.action && r.action.toLowerCase().includes(q)
        const effectMatch = r.therapeuticEffect && r.therapeuticEffect.toLowerCase().includes(q)
        return idMatch || nameMatch || actionMatch || effectMatch
      }
      return true
    })
  }, [categoryReceptors, selectedTarget, searchQuery])

  // Drugs matching current category & target
  const correspondingDrugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return data.drugs
      .map(drug => {
        // Collect all receptor bindings for this drug that match the selected category/target
        const matchingBindings = (drug.receptors || []).filter(r => {
          if (selectedTarget !== 'ALL') {
            return r.receptor === selectedTarget
          }
          if (selectedCategory !== 'ALL') {
            return categorizeReceptor(r.receptor) === selectedCategory
          }
          return true
        })

        if (matchingBindings.length === 0) return null

        // Max occupancy among matching bindings
        const maxOccupancy = Math.max(...matchingBindings.map(b => b.occupancy || 0), 0)
        const primaryBinding = matchingBindings[0]

        // Search query filter
        if (q) {
          const nameMatch = drug.name.toLowerCase().includes(q)
          const brandMatch = drug.brand && drug.brand.toLowerCase().includes(q)
          const classMatch = drug.subgroup && drug.subgroup.toLowerCase().includes(q)
          const recMatch = matchingBindings.some(b => b.receptor.toLowerCase().includes(q))
          if (!nameMatch && !brandMatch && !classMatch && !recMatch) return null
        }

        return {
          ...drug,
          matchingBindings,
          primaryBinding,
          maxOccupancy,
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (drugSortBy === 'occupancy') {
          return b.maxOccupancy - a.maxOccupancy
        }
        if (drugSortBy === 'family') {
          return (a.family || '').localeCompare(b.family || '') || a.name.localeCompare(b.name)
        }
        return a.name.localeCompare(b.name)
      })
  }, [selectedCategory, selectedTarget, searchQuery, drugSortBy])

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    setSelectedTarget('ALL')
    setSearchParams({ family: catId, view: viewMode })
  }

  const handleTargetChange = (targetId) => {
    setSelectedTarget(targetId)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton title="Receptor Guide" />

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Receptor & Pharmacodynamic Explorer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore 44 molecular targets across 9 receptor families and examine corresponding medications
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <svg
          className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by receptor symbol (e.g. 5HT2A, D2, SERT, H1) or drug name..."
          className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white rounded-2xl pl-11 pr-10 py-3 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Primary Receptor Family Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-3">
        {RECEPTOR_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id
          const count = cat.id === 'ALL' ? data.drugs.length : (categoryDrugCounts[cat.id] || 0)
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-xs opacity-75 font-semibold">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Sub-Target Chips (when family selected) */}
      {categoryReceptors.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-4">
          <button
            onClick={() => handleTargetChange('ALL')}
            className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              selectedTarget === 'ALL'
                ? 'bg-indigo-600 text-white border-transparent shadow-2xs'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300'
            }`}
          >
            All {selectedCategory !== 'ALL' ? selectedCategory : 'Targets'}
          </button>
          {categoryReceptors.map(r => {
            const isSelected = selectedTarget === r.id
            const drugCount = data.drugs.filter(d => (d.receptors || []).some(rec => rec.receptor === r.id)).length
            return (
              <button
                key={r.id}
                onClick={() => handleTargetChange(r.id)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: isSelected ? r.color : `${r.color}15`,
                  color: isSelected ? '#ffffff' : r.color,
                  borderColor: isSelected ? r.color : `${r.color}40`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isSelected ? '#ffffff' : r.color }}
                />
                <span>{r.id}</span>
                <span className="text-xs opacity-80">({drugCount})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Dual Mode Switcher Bar: Corresponding Drugs vs Receptors Grid */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1.5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('drugs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'drugs'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>💊</span>
            <span>Corresponding Drugs ({correspondingDrugs.length})</span>
          </button>
          <button
            onClick={() => setViewMode('receptors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'receptors'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🧬</span>
            <span>Target Profiles ({filteredReceptors.length})</span>
          </button>
        </div>

        {viewMode === 'drugs' && (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <span>Sort:</span>
            <select
              value={drugSortBy}
              onChange={e => setDrugSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="occupancy">Highest Occupancy</option>
              <option value="name">Drug Name (A–Z)</option>
              <option value="family">Drug Family</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: CORRESPONDING DRUGS LIST */}
      {viewMode === 'drugs' && (
        <div className="space-y-3">
          {correspondingDrugs.length > 0 ? (
            correspondingDrugs.map(drug => (
              <div
                key={drug.id}
                onClick={() => navigate(`/drug/${drug.id}`)}
                className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {drug.name}
                      </h3>
                      {drug.brand && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          ({drug.brand.replace('US:', '').split('·')[0].trim()})
                        </span>
                      )}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {drug.family}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{drug.subgroup}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {drug.targetDose && (
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 px-2 py-0.5 rounded-lg whitespace-nowrap block mb-1">
                        🎯 {drug.targetDose.split('·')[0].trim()}
                      </span>
                    )}
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform inline-block">
                      Monograph →
                    </span>
                  </div>
                </div>

                {/* Matching Receptor Bindings with Occupancy Bars */}
                <div className="space-y-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {drug.matchingBindings.map(b => {
                    const receptorObj = (data.receptors || []).find(rec => rec.id === b.receptor)
                    const color = receptorObj?.color || '#6366f1'
                    const occ = b.occupancy || 0

                    return (
                      <div key={b.receptor} className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-800/70">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/receptors/${b.receptor}`)
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md transition-transform hover:scale-105 border cursor-pointer"
                              style={{
                                backgroundColor: `${color}18`,
                                color: color,
                                borderColor: `${color}40`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                              <span>{b.receptor}</span>
                            </span>
                            {receptorObj?.fullName && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] hidden sm:inline">
                                {receptorObj.fullName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {b.ki && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80">
                                Ki: {b.ki}
                              </span>
                            )}
                            <span className="text-xs font-black w-10 text-right" style={{ color }}>
                              {occ}%
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Progress Bar */}
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(Math.max(occ, 8), 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>

                        {/* Clinical Action Directive */}
                        {b.clinicalAction && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed mt-1">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Clinical Mechanism: </span>
                            {b.clinicalAction}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <p className="text-base font-bold text-slate-900 dark:text-white mb-1">No matching medications</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                No medications documented with affinity for the selected receptor target. Try clearing filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL')
                  setSelectedTarget('ALL')
                  setSearchQuery('')
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer"
              >
                Reset Receptor Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: RECEPTOR TARGETS PROFILES GRID */}
      {viewMode === 'receptors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredReceptors.map(receptor => {
            const drugCount = data.drugs.filter(d =>
              (d.receptors || []).some(r => r.receptor === receptor.id)
            ).length

            return (
              <div
                key={receptor.id}
                className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: receptor.color }}
                      />
                      <span className="font-display font-black text-base text-slate-900 dark:text-white">
                        {receptor.id}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTarget(receptor.id)
                        setViewMode('drugs')
                      }}
                      className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                      title="View all drugs binding this target"
                    >
                      {drugCount} {drugCount === 1 ? 'drug' : 'drugs'} →
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug mb-1">
                    {receptor.fullName}
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {receptor.action}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  {receptor.therapeuticEffect && (
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-bold text-emerald-700 dark:text-emerald-400">Therapeutic: </strong>
                      {receptor.therapeuticEffect}
                    </p>
                  )}
                  {receptor.sideEffects && (
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-bold text-rose-700 dark:text-rose-400">Adverse: </strong>
                      {receptor.sideEffects}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/receptors/${receptor.id}`)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Full Target Dossier →
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTarget(receptor.id)
                        setViewMode('drugs')
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Explore Drugs
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

