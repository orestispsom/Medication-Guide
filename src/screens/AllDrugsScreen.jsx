import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import ReceptorTag from '../components/ReceptorTag'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function AllDrugsScreen() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedFamilyId, setSelectedFamilyId] = useState('all')
  const [selectedSubgroupId, setSelectedSubgroupId] = useState('all')
  const [selectedLetter, setSelectedLetter] = useState('all')

  // Subgroups available for the currently selected family
  const availableSubgroups = useMemo(() => {
    if (selectedFamilyId === 'all') return data.subgroups
    return data.subgroups.filter(s => s.familyId === selectedFamilyId)
  }, [selectedFamilyId])

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
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [searchQuery, selectedFamilyId, selectedSubgroupId, selectedLetter])

  const handleFamilyChange = (famId) => {
    setSelectedFamilyId(famId)
    setSelectedSubgroupId('all')
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setSelectedFamilyId('all')
    setSelectedSubgroupId('all')
    setSelectedLetter('all')
    setSearchParams({})
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <BackButton />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              A–Z Medication Compendium
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Browse {data.drugs.length} clinical drug monographs across 9 clinical domains
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {filteredDrugs.length} of {data.drugs.length}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <svg
          className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 pointer-events-none"
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
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Alphabet Quick Jump Bar */}
      <div className="flex flex-wrap items-center gap-1 mb-4 pb-2 border-b border-gray-100">
        <button
          onClick={() => setSelectedLetter('all')}
          className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
            selectedLetter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className="w-7 h-7 flex items-center justify-center text-[11px] font-semibold text-gray-300 cursor-not-allowed"
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
              className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${
                selectedLetter === letter
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              title={`${count} drugs starting with ${letter}`}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Clinical Family Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-3">
        <button
          onClick={() => handleFamilyChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            selectedFamilyId === 'all'
              ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border"
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
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Subgroup:</span>
          <select
            value={selectedSubgroupId}
            onChange={e => setSelectedSubgroupId(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-full truncate"
          >
            <option value="all">All Subgroups ({availableSubgroups.length})</option>
            {availableSubgroups.map(sg => (
              <option key={sg.id} value={sg.id}>
                {sg.name}
              </option>
            ))}
          </select>

          {(selectedFamilyId !== 'all' || selectedSubgroupId !== 'all' || selectedLetter !== 'all' || searchQuery) && (
            <button
              onClick={handleClearAll}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 ml-auto whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Drug List */}
      {filteredDrugs.length > 0 ? (
        <div className="space-y-3">
          {filteredDrugs.map(drug => {
            const family = data.families.find(f => f.id === drug.familyId)
            const cleanBrand = drug.brand
              ? drug.brand.replace('US:', '').split('·')[0].trim()
              : ''

            return (
              <div
                key={drug.id}
                onClick={() => navigate(`/drug/${drug.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {drug.name}
                      </h3>
                      {cleanBrand && (
                        <span className="text-xs font-medium text-gray-400">
                          ({cleanBrand})
                        </span>
                      )}
                      {drug.blackBox && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Black Box / Boxed Warning">
                          ⚠️ Boxed Warning
                        </span>
                      )}
                      {drug.foodRequirement && drug.foodRequirement.toLowerCase().includes('meal') && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100" title={drug.foodRequirement}>
                          🍽️ Meal Req
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {drug.subgroup}
                    </p>

                    {/* Dosing & Half-Life Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      {drug.targetDose && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          🎯 Target: {drug.targetDose}
                        </span>
                      )}
                      {drug.halfLife && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                          ⏱️ t½: {drug.halfLife}
                        </span>
                      )}
                    </div>

                    {/* Top Receptor Affinity Badges */}
                    {drug.receptors && drug.receptors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {drug.receptors.slice(0, 4).map(r => (
                          <ReceptorTag key={r.receptor} receptorId={r.receptor} occupancy={r.occupancy} />
                        ))}
                        {drug.receptors.length > 4 && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            +{drug.receptors.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Indications */}
                    {drug.indications && drug.indications.length > 0 && (
                      <p className="text-[11px] text-gray-400 line-clamp-1">
                        <span className="font-semibold text-gray-500">Indications:</span> {drug.indications.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: (family?.color || '#6366f1') + '15',
                        color: family?.color || '#6366f1',
                      }}
                    >
                      {family?.shortName || drug.family}
                    </span>
                    <span className="text-gray-300 group-hover:text-indigo-600 transition-colors text-sm">
                      →
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-xl">
            🔍
          </div>
          <h3 className="font-bold text-gray-900 text-sm mb-1">No matching medications</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
            We couldn&apos;t find any drugs matching your search criteria. Try adjusting your query or resetting filters.
          </p>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
