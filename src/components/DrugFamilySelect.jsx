import { useState, useRef, useEffect, useMemo } from 'react'

export default function DrugFamilySelect({
  label,
  selectedDrug,
  onSelect,
  placeholder = 'Select or search medication...',
  groupedFamilies = []
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery('')
    }
  }, [isOpen])

  // Filter drugs by search query across all families
  const filteredFamilies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return groupedFamilies

    return groupedFamilies
      .map(fam => {
        const matchingDrugs = fam.drugs.filter(d => {
          const nameMatch = d.name.toLowerCase().includes(q)
          const subMatch = (d.subgroup || '').toLowerCase().includes(q)
          const shortMatch = (d.shortSubgroup || '').toLowerCase().includes(q)
          return nameMatch || subMatch || shortMatch
        })
        return {
          ...fam,
          drugs: matchingDrugs
        }
      })
      .filter(fam => fam.drugs.length > 0)
  }, [groupedFamilies, searchQuery])

  const totalMatches = useMemo(() => {
    return filteredFamilies.reduce((acc, fam) => acc + fam.drugs.length, 0)
  }, [filteredFamilies])

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
          {label}
        </label>
      )}

      {/* Main Selector Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b0f19] cursor-pointer transition-all ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
            : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedDrug ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {selectedDrug.name}
              </span>
              {selectedDrug.shortSubgroup && (
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                  {selectedDrug.shortSubgroup}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
          {selectedDrug && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              ✕
            </button>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu Anchored Underneath */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#111827] border border-slate-200/95 dark:border-slate-700/95 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Internal Search Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19]/70">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-slate-400 pointer-events-none">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter by drug name or class..."
                className="w-full pl-8 pr-7 py-1.5 text-xs font-medium bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Grouped Drug List */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 p-2 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
            {totalMatches > 0 ? (
              filteredFamilies.map(fam => (
                <div key={fam.id} className="pt-2 first:pt-0">
                  {/* Family Category Header */}
                  <div className="flex items-center gap-1.5 px-2 py-1 mb-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>{fam.icon}</span>
                    <span>{fam.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      ({fam.drugs.length})
                    </span>
                  </div>

                  {/* Drugs under this family */}
                  <div className="space-y-0.5">
                    {fam.drugs.map(drug => {
                      const isSelected = selectedDrug?.id === drug.id || selectedDrug?.name === drug.name
                      return (
                        <button
                          key={drug.id}
                          type="button"
                          onClick={() => {
                            onSelect(drug)
                            setIsOpen(false)
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          <span className="truncate">{drug.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">
                            {drug.shortSubgroup}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                No medications matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
