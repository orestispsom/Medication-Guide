import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import ReceptorTag from '../components/ReceptorTag'
import DrugCard from '../components/DrugCard'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function AllDrugsScreen() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedFamilyId, setSelectedFamilyId] = useState('all')
  const [selectedSubgroupId, setSelectedSubgroupId] = useState('all')
  const [selectedLetter, setSelectedLetter] = useState('all')
  const [clinicalFilter, setClinicalFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc') // 'name-asc' | 'halfLife'

  // Subgroups available for the currently selected family
  const availableSubgroups = useMemo(() => {
    if (selectedFamilyId === 'all') return data.subgroups
    return data.subgroups.filter(s => s.familyId === selectedFamilyId)
  }, [selectedFamilyId])

  // Helper to extract approximate hours from half-life string
  const parseHalfLifeHours = (hlStr) => {
    if (!hlStr) return 999
    const match = hlStr.match(/(\d+(\.\d+)?)\s*(h|hour|day)/i)
    if (!match) return 999
    const val = parseFloat(match[1])
    if (match[3].toLowerCase().startsWith('d')) return val * 24
    return val
  }

  // Filter drugs
  const filteredDrugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return data.drugs.filter(drug => {
      // Family filter
      if (selectedFamilyId !== 'all' && drug.familyId !== selectedFamilyId) {
        return false
      }

      // Subgroup filter
      if (selectedSubgroupId !== 'all' && drug.subgroupId !== selectedSubgroupId) {
        return false
      }

      // Letter filter
      if (selectedLetter !== 'all') {
        if (!drug.name.toUpperCase().startsWith(selectedLetter)) {
          return false
        }
      }

      // Clinical Smart Filters
      if (clinicalFilter === 'weight-neutral') {
        const wt = (drug.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('weight') || a.domain.toLowerCase().includes('metabolic'))
        if (wt && (wt.severity.toLowerCase().includes('high') || wt.severity.toLowerCase().includes('severe') || wt.severity.toLowerCase().includes('mod'))) {
          return false
        }
      } else if (clinicalFilter === 'low-qtc') {
        const qtc = (drug.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('qtc'))
        if (qtc && (qtc.severity.toLowerCase().includes('high') || qtc.severity.toLowerCase().includes('severe') || qtc.severity.toLowerCase().includes('mod'))) {
          return false
        }
      } else if (clinicalFilter === 'sedating') {
        const sed = (drug.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('sedation'))
        if (!sed || (!sed.severity.toLowerCase().includes('high') && !sed.severity.toLowerCase().includes('severe') && !sed.severity.toLowerCase().includes('mod'))) {
          return false
        }
      } else if (clinicalFilter === 'activating') {
        const sed = (drug.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('sedation'))
        const isLowSed = sed && (sed.severity.toLowerCase().includes('low') || sed.severity.toLowerCase().includes('near zero') || sed.severity.toLowerCase().includes('sparing'))
        const pearls = (drug.clinicalPearls || []).join(' ').toLowerCase()
        const isActivatingMention = pearls.includes('morning') || pearls.includes('activating') || pearls.includes('insomnia') || pearls.includes('alerting')
        if (!isLowSed && !isActivatingMention) return false
      } else if (clinicalFilter === 'renal-safe') {
        const clearance = (drug.benchmarks?.clearance || '').toLowerCase()
        if (!clearance.includes('hepatic') && !clearance.includes('cyp')) return false
      } else if (clinicalFilter === 'meal-req') {
        if (!drug.foodRequirement || !drug.foodRequirement.toLowerCase().includes('meal')) return false
      } else if (clinicalFilter === 'boxed-warning') {
        if (!drug.blackBox) return false
      }

      // Search query filter
      if (q) {
        const nameMatch = drug.name.toLowerCase().includes(q)
        const brandMatch = drug.brand && drug.brand.toLowerCase().includes(q)
        const subgroupMatch = drug.subgroup && drug.subgroup.toLowerCase().includes(q)
        const familyMatch = drug.family && drug.family.toLowerCase().includes(q)
        const indicationMatch = drug.indications && drug.indications.some(ind => ind.toLowerCase().includes(q))
        const pearlMatch = drug.clinicalPearls && drug.clinicalPearls.some(p => p.toLowerCase().includes(q))
        return nameMatch || brandMatch || subgroupMatch || familyMatch || indicationMatch || pearlMatch
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'halfLife') {
        return parseHalfLifeHours(a.halfLife) - parseHalfLifeHours(b.halfLife)
      }
      return a.name.localeCompare(b.name)
    })
  }, [searchQuery, selectedFamilyId, selectedSubgroupId, selectedLetter, clinicalFilter, sortBy])

  const handleFamilyChange = (famId) => {
    setSelectedFamilyId(famId)
    setSelectedSubgroupId('all')
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setSelectedFamilyId('all')
    setSelectedSubgroupId('all')
    setSelectedLetter('all')
    setClinicalFilter('all')
    setSortBy('name-asc')
    setSearchParams({})
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A–Z Medication Compendium
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse {data.drugs.length} clinical drug monographs across {data.families.length} clinical domains
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800 flex-shrink-0">
            {filteredDrugs.length} of {data.drugs.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3.5">
        <svg
          className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-4 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            if (e.target.value) {
              setSelectedLetter('all')
            }
          }}
          placeholder="Filter by generic name, brand, indication, or mechanism..."
          className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white rounded-2xl pl-11 pr-10 py-3.5 text-sm font-medium shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Clinical Smart Filter Chips */}
      <div className="flex items-center gap-1.5 mb-3.5 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: 'all', label: 'All', icon: '💊' },
          { id: 'weight-neutral', label: 'Weight Neutral', icon: '⚡' },
          { id: 'low-qtc', label: 'Low QTc', icon: '❤️' },
          { id: 'sedating', label: 'Bedtime / Sedating', icon: '🌙' },
          { id: 'activating', label: 'Morning / Activating', icon: '☀️' },
          { id: 'renal-safe', label: 'Hepatic Cleared', icon: '🩺' },
          { id: 'meal-req', label: 'Meal Required', icon: '🍽️' },
          { id: 'boxed-warning', label: 'Boxed Warnings', icon: '⚠️' },
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setClinicalFilter(chip.id === clinicalFilter ? 'all' : chip.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
              clinicalFilter === chip.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs focus:outline-none cursor-pointer"
          >
            <option value="name-asc">A–Z</option>
            <option value="halfLife">Half-Life (t½)</option>
          </select>
        </div>
      </div>

      {/* Alphabet Quick Jump Bar */}
      <div className="flex flex-wrap items-center gap-1 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setSelectedLetter('all')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedLetter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {ALPHABET.map(letter => {
          const count = data.drugs.filter(d => d.name.toUpperCase().startsWith(letter)).length
          if (count === 0) {
            return (
              <span
                key={letter}
                className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-slate-300 dark:text-slate-700 cursor-not-allowed"
              >
                {letter}
              </span>
            )
          }
          return (
            <button
              key={letter}
              onClick={() => {
                setSelectedLetter(letter)
                setSearchQuery('')
              }}
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedLetter === letter
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
              title={`${count} drugs starting with ${letter}`}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Clinical Family Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-3.5">
        <button
          onClick={() => handleFamilyChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
            selectedFamilyId === 'all'
              ? 'bg-slate-900 text-white border-transparent shadow-sm'
              : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
          }`}
        >
          <span>All Families</span>
          <span className="text-[10px] opacity-75 font-semibold">({data.drugs.length})</span>
        </button>
        {data.families.map(fam => {
          const isSelected = selectedFamilyId === fam.id
          const count = data.drugs.filter(d => d.familyId === fam.id).length
          return (
            <button
              key={fam.id}
              onClick={() => handleFamilyChange(fam.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer"
              style={{
                backgroundColor: isSelected ? fam.color : fam.color + '10',
                color: isSelected ? '#ffffff' : fam.color,
                borderColor: isSelected ? fam.color : fam.color + '30',
              }}
            >
              <span>{fam.shortName || fam.name.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75 font-semibold">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Subgroup Filter Dropdown (if family or all selected) */}
      {availableSubgroups.length > 1 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">Subgroup:</span>
          <select
            value={selectedSubgroupId}
            onChange={e => setSelectedSubgroupId(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full truncate cursor-pointer"
          >
            <option value="all">All Subgroups ({availableSubgroups.length})</option>
            {availableSubgroups.map(sg => (
              <option key={sg.id} value={sg.id}>
                {sg.name}
              </option>
            ))}
          </select>

          {(selectedFamilyId !== 'all' || selectedSubgroupId !== 'all' || selectedLetter !== 'all' || searchQuery || clinicalFilter !== 'all') && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 ml-auto whitespace-nowrap cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Drug List */}
      {filteredDrugs.length > 0 ? (
        <div className="space-y-3">
          {filteredDrugs.map(drug => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-xl">
            🔍
          </div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-base mb-1">No matching medications</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            We couldn&apos;t find any drugs matching your search criteria. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
