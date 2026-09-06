import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import { getReceptorFamily, getReceptorFamilyColor } from '../utils/receptorFamily'

// Helper to parse numerical Ki in nM for tie-breaking
function parseKiValue(kiStr) {
  if (!kiStr || typeof kiStr !== 'string') return Infinity
  const match = kiStr.match(/([0-9.]+)/)
  if (!match) return Infinity
  let val = parseFloat(match[1])
  if (isNaN(val)) return Infinity
  if (kiStr.includes('μ') || kiStr.includes('uM') || kiStr.includes('M') || kiStr.includes('um')) {
    val *= 1000
  }
  return val
}

export default function ReceptorDetailScreen() {
  const { receptorId } = useParams()
  const navigate = useNavigate()

  const receptor = data.receptors.find(r => r.id === receptorId)
  if (!receptor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Receptor Target Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The specified molecular receptor does not exist in the database.</p>

        <button
          onClick={() => navigate('/receptors')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
        >
          View All Receptors
        </button>
      </div>
    )
  }

  // Retrieve receptor family & canonical family color
  const family = getReceptorFamily(receptor.id)
  const familyColor = family.color || getReceptorFamilyColor(receptor.id)

  const [viewLayout, setViewLayout] = useState('ranked') // 'ranked' | 'grouped'
  const [sortBy, setSortBy] = useState('affinity') // 'affinity' | 'name'

  // Drugs binding this target, sorted strictly by affinity (occupancy desc, Ki asc)
  const drugsWithBinding = useMemo(() => {
    return data.drugs
      .filter(d => (d.receptors || []).some(r => r.receptor === receptorId))
      .map(d => ({
        ...d,
        binding: d.receptors.find(r => r.receptor === receptorId),
      }))
      .sort((a, b) => {
        if (sortBy === 'affinity') {
          const occDiff = (b.binding?.occupancy || 0) - (a.binding?.occupancy || 0)
          if (occDiff !== 0) return occDiff
          const aKi = parseKiValue(a.binding?.ki)
          const bKi = parseKiValue(b.binding?.ki)
          if (aKi !== bKi) return aKi - bKi
          return a.name.localeCompare(b.name)
        }
        return a.name.localeCompare(b.name)
      })
  }, [receptorId, sortBy])

  // Optional grouping by drug class
  const familyGroups = useMemo(() => {
    const groups = {}
    drugsWithBinding.forEach(d => {
      const fName = d.family || 'Other'
      if (!groups[fName]) groups[fName] = []
      groups[fName].push(d)
    })
    return groups
  }, [drugsWithBinding])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton title={receptor.id} />

      {/* Target Header Card with Receptor Family Theming */}
      <div
        className="rounded-3xl p-6 sm:p-7 mb-6 shadow-sm border"
        style={{
          backgroundColor: `${familyColor}0D`,
          borderColor: `${familyColor}35`,
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <span
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0"
              style={{ backgroundColor: familyColor }}
            >
              {receptor.id.slice(0, 3)}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-black" style={{ color: familyColor }}>
                  {receptor.id}
                </h1>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${familyColor}18`,
                    color: familyColor,
                    borderColor: `${familyColor}40`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: familyColor }} />
                  {family.name}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{receptor.fullName}</p>
            </div>
          </div>

          <span className="hidden sm:inline-block text-xs font-bold px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {drugsWithBinding.length} {drugsWithBinding.length === 1 ? 'drug' : 'drugs'} binding
          </span>
        </div>

        {/* Mechanism & Clinical Dossier */}
        <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
          <div>
            <span className="text-xs font-black uppercase tracking-wider block mb-0.5" style={{ color: familyColor }}>
              Molecular Mechanism & Neurobiology
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {receptor.action}
            </p>
          </div>

          {receptor.therapeuticEffect && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider block mb-0.5 text-emerald-700 dark:text-emerald-400">
                Therapeutic Efficacy Profile
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {receptor.therapeuticEffect}
              </p>
            </div>
          )}

          {receptor.sideEffects && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider block mb-0.5 text-rose-700 dark:text-rose-400">
                Adverse Liabilities & Risks
              </span>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {receptor.sideEffects}
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Receptor Family: <strong>{family.shortName}</strong></span>
          <span className="sm:hidden font-semibold">
            {drugsWithBinding.length} drugs documented
          </span>
        </div>
      </div>

      {/* Drugs Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Medications Binding {receptor.id}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: `${familyColor}18`,
                color: familyColor,
              }}
            >
              {drugsWithBinding.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Listed in order of binding affinity with {family.shortName} color-coded progress bars
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Layout Toggle: Ranked Affinity vs Grouped by Class */}
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1 rounded-xl text-xs font-bold shadow-2xs">
            <button
              onClick={() => setViewLayout('ranked')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'ranked'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Affinity Ranking
            </button>
            <button
              onClick={() => setViewLayout('grouped')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'grouped'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              By Class
            </button>
          </div>

          {/* Sort: Affinity vs Name */}
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1 rounded-xl text-xs font-bold shadow-2xs">
            <button
              onClick={() => setSortBy('affinity')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === 'affinity'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Sort by highest affinity / occupancy"
            >
              Affinity
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Sort alphabetically"
            >
              A–Z
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: STRICT AFFINITY RANK ORDER (DEFAULT) */}
      {viewLayout === 'ranked' && (
        <div className="space-y-3">
          {drugsWithBinding.length > 0 ? (
            drugsWithBinding.map((drug, index) => {
              const b = drug.binding
              const occ = b?.occupancy || 0

              return (
                <div
                  key={drug.id}
                  onClick={() => navigate(`/drug/${drug.id}`)}
                  className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                >
                  {/* Top Row: Rank, Name, Brand, Class, Ki & Occupancy */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      {/* Rank Indicator Badge */}
                      <span
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 border"
                        style={{
                          backgroundColor: `${familyColor}15`,
                          color: familyColor,
                          borderColor: `${familyColor}35`,
                        }}
                      >
                        #{index + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {drug.name}
                          </span>
                          {drug.brand && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              ({drug.brand.replace('US:', '').split('·')[0].trim()})
                            </span>
                          )}
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                            {drug.family}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{drug.subgroup}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0 text-right">
                      {b?.ki && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                          Ki: {b.ki}
                        </span>
                      )}
                      <div className="w-12 text-right">
                        <span
                          className="text-sm sm:text-base font-black tracking-tight"
                          style={{ color: familyColor }}
                        >
                          {occ}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Fillable Affinity Bar in Receptor Family Color */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(Math.max(occ, 8), 100)}%`,
                        backgroundColor: familyColor,
                      }}
                    />
                  </div>

                  {/* Clinical Action Note / Functional Consequence */}
                  {b?.clinicalAction && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Clinical Mechanism: </span>
                      {b.clinicalAction}
                    </p>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <p className="text-sm text-slate-500 dark:text-slate-400">No drugs documented with affinity for {receptor.id}.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: GROUPED BY DRUG CLASS */}
      {viewLayout === 'grouped' && (
        drugsWithBinding.length > 0 ? (
          Object.entries(familyGroups).map(([familyName, drugs]) => {
            const famObj = data.families.find(f => f.name === familyName)
            return (
              <div key={familyName} className="mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: famObj?.color || familyColor }}
                  />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {familyName} ({drugs.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {drugs.map(drug => {
                    const b = drug.binding
                    const occ = b?.occupancy || 0
                    return (
                      <div
                        key={drug.id}
                        onClick={() => navigate(`/drug/${drug.id}`)}
                        className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {drug.name}
                              </span>
                              {drug.brand && (
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                  ({drug.brand.replace('US:', '').split('·')[0].trim()})
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{drug.subgroup}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {b?.ki && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                                Ki: {b.ki}
                              </span>
                            )}
                            <span
                              className="text-xs font-black w-10 text-right"
                              style={{ color: familyColor }}
                            >
                              {occ}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar in Family Color */}
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(Math.max(occ, 8), 100)}%`,
                              backgroundColor: familyColor,
                            }}
                          />
                        </div>

                        {/* Clinical Action Note */}
                        {b?.clinicalAction && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Clinical Mechanism: </span> {b.clinicalAction}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <p className="text-sm text-slate-500 dark:text-slate-400">No drugs documented with affinity for {receptor.id}.</p>
          </div>
        )
      )}
    </div>
  )
}