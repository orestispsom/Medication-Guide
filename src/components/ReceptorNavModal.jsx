import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import { RECEPTOR_FAMILIES, categorizeReceptor, getReceptorFamily } from '../utils/receptorFamily'

export default function ReceptorNavModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFamily, setSelectedFamily] = useState('ALL')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Count drugs binding each target
  const receptorDrugCounts = useMemo(() => {
    const counts = {}
    data.drugs.forEach(d => {
      ;(d.receptors || []).forEach(r => {
        counts[r.receptor] = (counts[r.receptor] || 0) + 1
      })
    })
    return counts
  }, [])

  // Count targets in each family
  const familyTargetCounts = useMemo(() => {
    const counts = { ALL: data.receptors.length }
    data.receptors.forEach(r => {
      const famId = categorizeReceptor(r.id)
      counts[famId] = (counts[famId] || 0) + 1
    })
    return counts
  }, [])

  // Filtered Receptors
  const filteredReceptors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return data.receptors.filter(r => {
      const famId = categorizeReceptor(r.id)
      if (selectedFamily !== 'ALL' && famId !== selectedFamily) {
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
  }, [selectedFamily, searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md">
              🧬
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Molecular Receptor & Target Navigation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                44 neurochemical targets across 9 receptor families · 422 drug affinities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Filter Controls: Search and Family Chips */}
        <div className="px-5 sm:px-7 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0e1422]/50 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none"
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
              placeholder="Search by receptor symbol (e.g. 5HT2A, D2, SERT, Alpha1) or physiological action..."
              className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Family Filter Chips with Color Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setSelectedFamily('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedFamily === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              All ({familyTargetCounts.ALL || 44})
            </button>
            {RECEPTOR_FAMILIES.map(fam => {
              const isSelected = selectedFamily === fam.id
              const count = familyTargetCounts[fam.id] || 0
              return (
                <button
                  key={fam.id}
                  onClick={() => setSelectedFamily(fam.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? 'border-transparent shadow-xs text-white'
                      : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? fam.color : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : fam.color }}
                  />
                  <span>{fam.shortName}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Core Content: Scrollable Double Column of Receptors */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="font-semibold">
              Showing {filteredReceptors.length} {filteredReceptors.length === 1 ? 'target' : 'targets'}
            </span>
            <span>Click any target to view binding drugs ranked by affinity</span>
          </div>

          {filteredReceptors.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {filteredReceptors.map(receptor => {
                const family = getReceptorFamily(receptor.id)
                const famColor = family.color
                const drugCount = receptorDrugCounts[receptor.id] || 0

                return (
                  <button
                    key={receptor.id}
                    onClick={() => {
                      onClose()
                      navigate(`/receptors/${receptor.id}`)
                    }}
                    className="rounded-2xl p-4 sm:p-4.5 border text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    style={{
                      backgroundColor: `${famColor}0C`,
                      borderColor: `${famColor}38`,
                    }}
                  >
                    <div>
                      {/* Top Row: Symbol & Drug Count Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: famColor }}
                          />
                          <span
                            className="font-display font-black text-base sm:text-lg tracking-tight group-hover:scale-105 transition-transform"
                            style={{ color: famColor }}
                          >
                            {receptor.id}
                          </span>
                        </div>

                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${famColor}15`,
                            color: famColor,
                            borderColor: `${famColor}40`,
                          }}
                        >
                          {drugCount} {drugCount === 1 ? 'drug' : 'drugs'}
                        </span>
                      </div>

                      {/* Full Name */}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1">
                        {receptor.fullName}
                      </h4>

                      {/* Mechanism / Clinical Action Summary */}
                      {receptor.action && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {receptor.action}
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata: Family Pill & Explore Arrow */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: famColor }} />
                        {family.shortName}
                      </span>
                      <span
                        className="font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                        style={{ color: famColor }}
                      >
                        Affinities →
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <p className="text-base font-bold mb-1">No receptor targets found</p>
              <p className="text-xs">Try adjusting your search query or family filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0e1422]/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>All 44 targets color-coded by molecular receptor family</span>
          <button
            onClick={() => {
              onClose()
              navigate('/receptors')
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Open Full Receptor Explorer Screen →
          </button>
        </div>
      </div>
    </div>
  )
}