import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import {
  RECEPTOR_FAMILIES,
  categorizeReceptor,
  getReceptorFamily,
  getReceptorFamilyColor
} from '../utils/receptorFamily'

export { categorizeReceptor }

const RECEPTOR_CATEGORIES = [
  { id: 'ALL', label: 'All Targets', color: '#64748B' },
  ...RECEPTOR_FAMILIES.map(f => ({ id: f.id, label: f.shortName, color: f.color })),
]

export default function ReceptorListScreen() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialCat = searchParams.get('family') || 'ALL'
  const initialTarget = searchParams.get('target') || 'ALL'
  const initialView = searchParams.get('view') || 'receptors' // default to receptors double-column view

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [selectedTarget, setSelectedTarget] = useState(initialTarget)
  const [viewMode, setViewMode] = useState(initialView) // 'receptors' | 'drugs'
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
        const nameMatch = r.fullName && r.fullName.toLowerCase().includes(q)
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

        const maxOccupancy = Math.max(...matchingBindings.map(b => b.occupancy || 0), 0)
        const primaryBinding = matchingBindings[0]

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
      <BackButton title="Receptors" />

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg shadow-xs">
            🧬
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Molecular Receptor Targets
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Double-column receptor target navigator across 44 targets and 9 color-coded neurochemical families
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
          placeholder="Search by receptor symbol (e.g. 5HT2A, D2, SERT, Alpha1) or drug name..."
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
          const count = cat.id === 'ALL' ? data.receptors.length : (data.receptors.filter(r => categorizeReceptor(r.id) === cat.id).length)
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                isSelected
                  ? 'border-transparent shadow-xs text-white'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300'
              }`}
              style={{
                backgroundColor: isSelected ? (cat.id === 'ALL' ? '#0f172a' : cat.color) : undefined,
              }}
            >
              {cat.id !== 'ALL' && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                />
              )}
              <span>{cat.label}</span>
              <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Sub-Target Chips (when family selected) */}
      {categoryReceptors.length > 1 && selectedCategory !== 'ALL' && (
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 mb-4">
          <button
            onClick={() => handleTargetChange('ALL')}
            className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              selectedTarget === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-2xs'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300'
            }`}
          >
            All {selectedCategory}
          </button>
          {categoryReceptors.map(r => {
            const isSelected = selectedTarget === r.id
            const famColor = getReceptorFamilyColor(r.id)
            const drugCount = data.drugs.filter(d => (d.receptors || []).some(rec => rec.receptor === r.id)).length
            return (
              <button
                key={r.id}
                onClick={() => handleTargetChange(r.id)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer"
                style={{
                  backgroundColor: isSelected ? famColor : `${famColor}12`,
                  color: isSelected ? '#ffffff' : famColor,
                  borderColor: isSelected ? famColor : `${famColor}35`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isSelected ? '#ffffff' : famColor }}
                />
                <span>{r.id}</span>
                <span className="text-[10px] opacity-80">({drugCount})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Dual Mode Switcher Bar: Receptors Double Column vs Drugs List */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1.5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('receptors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'receptors'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🧬</span>
            <span>Receptor Targets ({filteredReceptors.length})</span>
          </button>
          <button
            onClick={() => setViewMode('drugs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'drugs'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>💊</span>
            <span>Binding Drugs ({correspondingDrugs.length})</span>
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
              <option value="occupancy">Highest Affinity</option>
              <option value="name">Drug Name (A–Z)</option>
              <option value="family">Drug Family</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: SCROLLABLE DOUBLE COLUMN OF RECEPTORS (DEFAULT) */}
      {viewMode === 'receptors' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold">
              Showing {filteredReceptors.length} {filteredReceptors.length === 1 ? 'target' : 'targets'}
            </span>
            <span>Click card to inspect binding drugs ranked by affinity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {filteredReceptors.map(receptor => {
              const family = getReceptorFamily(receptor.id)
              const famColor = family.color
              const drugCount = data.drugs.filter(d =>
                (d.receptors || []).some(r => r.receptor === receptor.id)
              ).length

              return (
                <div
                  key={receptor.id}
                  onClick={() => navigate(`/receptors/${receptor.id}`)}
                  className="rounded-xl px-3 py-2.5 border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group flex items-center gap-2.5"
                  style={{
                    backgroundColor: `${famColor}0C`,
                    borderColor: `${famColor}35`,
                  }}
                >
                  {/* Color dot + Symbol */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 min-w-[55px]">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: famColor }}
                    />
                    <span
                      className="font-display font-black text-sm tracking-tight"
                      style={{ color: famColor }}
                    >
                      {receptor.id}
                    </span>
                  </div>

                  {/* Full Name — truncated */}
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate flex-1 leading-tight">
                    {receptor.fullName}
                  </span>

                  {/* Drug count badge */}
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${famColor}18`,
                      color: famColor,
                    }}
                  >
                    {drugCount}
                  </span>

                  {/* Arrow */}
                  <span
                    className="text-xs font-bold flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
                    style={{ color: famColor }}
                  >
                    →
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CORRESPONDING DRUGS LIST WITH FAMILY-COLORED BARS */}
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
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {drug.name}
                      </h3>
                      {drug.brand && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          ({drug.brand.replace('US:', '').split('·')[0].trim()})
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                        {drug.family}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{drug.subgroup}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-block">
                      Monograph →
                    </span>
                  </div>
                </div>

                {/* Matching Receptor Bindings with Occupancy Bars in Family Color */}
                <div className="space-y-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {drug.matchingBindings.map(b => {
                    const receptorObj = (data.receptors || []).find(rec => rec.id === b.receptor)
                    const famColor = getReceptorFamilyColor(b.receptor)
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
                                backgroundColor: `${famColor}18`,
                                color: famColor,
                                borderColor: `${famColor}40`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: famColor }} />
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
                            <span className="text-xs font-black w-10 text-right" style={{ color: famColor }}>
                              {occ}%
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Progress Bar in Family Color */}
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(Math.max(occ, 8), 100)}%`,
                              backgroundColor: famColor,
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
    </div>
  )
}