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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [selectedTarget, setSelectedTarget] = useState(initialTarget)

  // Pre-calculate count of unique drugs binding each target
  const receptorUniqueDrugCounts = useMemo(() => {
    const map = {}
    data.drugs.forEach(d => {
      const canonicalName = d.name.trim().toLowerCase()
      ;(d.receptors || []).forEach(r => {
        if (!map[r.receptor]) map[r.receptor] = new Set()
        map[r.receptor].add(canonicalName)
      })
    })
    const counts = {}
    for (const [recId, set] of Object.entries(map)) {
      counts[recId] = set.size
    }
    return counts
  }, [])

  // Pre-calculate count of unique drugs binding each category
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

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    setSelectedTarget('ALL')
    setSearchParams({ family: catId })
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
            const drugCount = receptorUniqueDrugCounts[r.id] || 0
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

      {/* SCROLLABLE DOUBLE COLUMN OF RECEPTOR TARGETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold">
            Showing {filteredReceptors.length} {filteredReceptors.length === 1 ? 'target' : 'targets'}
          </span>
          <span>Click target to view binding drugs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {filteredReceptors.map(receptor => {
            const family = getReceptorFamily(receptor.id)
            const famColor = family.color
            const drugCount = receptorUniqueDrugCounts[receptor.id] || 0

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
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-black text-xs shadow-2xs"
                  style={{ backgroundColor: famColor }}
                >
                  {receptor.id.slice(0, 3)}
                </div>

                {/* Name + Target Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {receptor.id}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                      · {receptor.fullName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {receptor.action || family.name}
                  </p>
                </div>

                {/* Drug Count Badge */}
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: `${famColor}15`,
                    color: famColor,
                    borderColor: `${famColor}30`,
                  }}
                >
                  {drugCount} {drugCount === 1 ? 'drug' : 'drugs'}
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
    </div>
  )
}