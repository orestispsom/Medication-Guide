import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import FamilyCard from '../components/FamilyCard'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
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
      </div>

      {/* Global Quick Search Bar */}
      <div className="relative mb-6">
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
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 170+ drugs, brands (e.g. Cobenfy, Vyvanse), indications..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600 p-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ✕
            </button>
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

      {/* High-Yield Quick Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        <button
          onClick={() => navigate('/all-drugs')}
          className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-3 text-left shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">All Drugs</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Complete A–Z index</p>
        </button>

        <button
          onClick={() => navigate('/cross-titration')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-400 rounded-xl p-3 text-left shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔄</span>
            <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">Cross-Titration</span>
          </div>
          <p className="text-[10px] text-indigo-500 mt-1">20 Switch Protocols</p>
        </button>

        <button
          onClick={() => navigate('/receptors')}
          className="bg-white border border-gray-200 hover:border-indigo-400 rounded-xl p-3 text-left shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🧬</span>
            <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">Receptors</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">44 Molecular Targets</p>
        </button>

        <button
          onClick={() => navigate('/family/antidotes-interventional')}
          className="bg-rose-50 border border-rose-200 hover:border-rose-400 rounded-xl p-3 text-left shadow-xs hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <span className="text-xs font-bold text-rose-900 group-hover:text-rose-700">Antidotes</span>
          </div>
          <p className="text-[10px] text-rose-500 mt-1">Emergency Rescues</p>
        </button>
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
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-5 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-700 text-indigo-200">
            Module 12 Integration
          </span>
          <h3 className="text-base font-bold mt-1.5">
            Cross-Titration & Deprescribing Tool
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

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-400 mt-6">
        {data.drugs.length} clinical monographs · {data.protocols?.length || 20} transition algorithms · {data.receptors.length} molecular targets · 9 authoritative clinical domains
      </p>
    </div>
  )
}
