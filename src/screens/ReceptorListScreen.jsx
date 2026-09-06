import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ReceptorListScreen() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Categorize receptors by neurotransmitter/system
  const categorizeReceptor = (r) => {
    const id = r.id.toUpperCase()
    if (id.startsWith('D') && (id === 'D1' || id === 'D2' || id === 'D3' || id === 'D4' || id === 'D5')) return 'Dopaminergic'
    if (id.startsWith('5-HT')) return 'Serotonergic'
    if (id.startsWith('ALPHA') || id.startsWith('BETA') || id.startsWith('Α') || id.startsWith('Β')) return 'Adrenergic'
    if (id.startsWith('H')) return 'Histaminergic'
    if (id.startsWith('M') && (id === 'M1' || id === 'M2' || id === 'M3' || id === 'M4' || id === 'M5' || id.includes('ACH'))) return 'Muscarinic'
    if (id.includes('GABA') || id.includes('NMDA') || id.includes('AMPA') || id.includes('GLU')) return 'GABA & Glutamate'
    if (id.includes('SERT') || id.includes('NET') || id.includes('DAT') || id.includes('VMAT')) return 'Transporters'
    if (id.includes('MOR') || id.includes('KOR') || id.includes('DOR') || id.includes('OX') || id.includes('CB') || id.includes('TAAR')) return 'Neuropeptides & Lipids'
    return 'Enzymes & Channels'
  }

  const categories = ['ALL', 'Dopaminergic', 'Serotonergic', 'Adrenergic', 'Histaminergic', 'Muscarinic', 'Transporters', 'GABA & Glutamate', 'Neuropeptides & Lipids', 'Enzymes & Channels']

  const filteredReceptors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return data.receptors.filter(r => {
      const cat = categorizeReceptor(r)
      if (selectedCategory !== 'ALL' && cat !== selectedCategory) {
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
  }, [searchQuery, selectedCategory])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton title="Receptor Guide" />

      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
          <span>🧬</span>
          <span>44 Molecular Targets & Nanomolar Ki Benchmarks</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Receptor & Enzyme Reference
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive binding profiles, therapeutic consequences, and adverse liability mappings
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
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
          placeholder="Search target by symbol (e.g. 5-HT2A, D2, SERT, α1, M1)..."
          className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white rounded-2xl pl-11 pr-10 py-3 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
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

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                  : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Receptor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredReceptors.map(receptor => {
          const drugCount = data.drugs.filter(d =>
            (d.receptors || []).some(r => r.receptor === receptor.id)
          ).length

          return (
            <button
              key={receptor.id}
              onClick={() => navigate(`/receptors/${receptor.id}`)}
              className="bg-white dark:bg-[#111827] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all text-left border border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: receptor.color }}
                    />
                    <span className="font-display font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {receptor.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {drugCount} {drugCount === 1 ? 'drug' : 'drugs'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight mb-1">
                  {receptor.fullName}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {receptor.action}
                </p>
              </div>

              {receptor.therapeuticEffect && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                  🎯 {receptor.therapeuticEffect}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
