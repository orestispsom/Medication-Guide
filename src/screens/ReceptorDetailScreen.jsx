import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

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
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
        >
          View All Receptors
        </button>
      </div>
    )
  }

  const [sortBy, setSortBy] = useState('occupancy') // 'occupancy' | 'name'

  // Drugs binding this target
  const drugsWithBinding = useMemo(() => {
    return data.drugs
      .filter(d => (d.receptors || []).some(r => r.receptor === receptorId))
      .map(d => ({
        ...d,
        binding: d.receptors.find(r => r.receptor === receptorId),
      }))
      .sort((a, b) => {
        if (sortBy === 'occupancy') {
          return (b.binding?.occupancy || 0) - (a.binding?.occupancy || 0)
        }
        return a.name.localeCompare(b.name)
      })
  }, [receptorId, sortBy])

  // Group by family
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

      {/* Target Header Card */}
      <div
        className="rounded-2xl p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border"
        style={{
          backgroundColor: receptor.color + '10',
          borderColor: receptor.color + '30',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm flex-shrink-0"
            style={{ backgroundColor: receptor.color }}
          >
            {receptor.id.slice(0, 2)}
          </span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black" style={{ color: receptor.color }}>
              {receptor.id}
            </h1>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{receptor.fullName}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
          <div>
            <span className="text-xs font-black uppercase tracking-wider block mb-0.5" style={{ color: receptor.color }}>
              Molecular Mechanism & Neurobiology
            </span>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {receptor.action}
            </p>
          </div>

          {receptor.therapeuticEffect && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider block mb-0.5 text-emerald-700 dark:text-emerald-400">
                Therapeutic Efficacy Profile
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {receptor.therapeuticEffect}
              </p>
            </div>
          )}

          {receptor.sideEffects && (
            <div>
              <span className="text-xs font-black uppercase tracking-wider block mb-0.5 text-rose-700 dark:text-rose-400">
                Adverse Liabilities & Risks
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {receptor.sideEffects}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Target Category: Molecular Psychopharmacology</span>
          <span className="px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold">
            {drugsWithBinding.length} drugs documented
          </span>
        </div>
      </div>

      {/* Drugs Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Drugs with {receptor.id} Affinity ({drugsWithBinding.length})
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Binding affinities and occupancy percentages documented in the compendium
          </p>
        </div>

        <div className="flex bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1 rounded-xl flex-shrink-0 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setSortBy('occupancy')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'occupancy' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Occupancy %
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'name' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            A–Z
          </button>
        </div>
      </div>

      {/* Drugs Grouped by Family */}
      {drugsWithBinding.length > 0 ? (
        Object.entries(familyGroups).map(([familyName, drugs]) => {
          const famObj = data.families.find(f => f.name === familyName)
          return (
            <div key={familyName} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: famObj?.color || '#6366f1' }}
                />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {familyName} ({drugs.length})
                </h3>
              </div>

              <div className="space-y-2">
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
                            <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                              Ki: {b.ki}
                            </span>
                          )}
                          <span
                            className="text-xs font-black w-10 text-right"
                            style={{ color: receptor.color }}
                          >
                            {occ}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(Math.max(occ, 10), 100)}%`,
                            backgroundColor: receptor.color,
                          }}
                        />
                      </div>

                      {/* Clinical Action Note */}
                      {b?.clinicalAction && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Clinical Action:</span> {b.clinicalAction}
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
          <p className="text-sm text-slate-500 dark:text-slate-400">No drugs documented with primary affinity for {receptor.id}.</p>
        </div>
      )}
    </div>
  )
}
