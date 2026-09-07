import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import Toast from '../components/Toast'
import { getDomainReceptorTies } from '../utils/receptorFamily'
import { isFavorite, toggleFavorite } from '../utils/favorites'

export default function DrugDetailScreen() {
  const { drugId } = useParams()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')

  const drug = data.drugs.find(d => d.id === drugId)
  const [starred, setStarred] = useState(drug ? isFavorite('drug', drug.id) : false)

  if (!drug) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Medication Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">The requested drug monograph does not exist in the compendium.</p>
        <button
          onClick={() => navigate('/all-drugs')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700"
        >
          Browse All Medications
        </button>
      </div>
    )
  }

  const family = data.families.find(f => f.id === drug.familyId)

  // Find any related Module 12 switch protocols
  const relatedProtocols = useMemo(() => {
    return (data.protocols || []).filter(p => {
      const nameMatch = p.transitionTitle && p.transitionTitle.toLowerCase().includes(drug.name.toLowerCase())
      const titleMatch = p.title && p.title.toLowerCase().includes(drug.name.toLowerCase())
      const rationaleMatch = p.rationale && p.rationale.toLowerCase().includes(drug.name.toLowerCase())
      return nameMatch || titleMatch || rationaleMatch
    })
  }, [drug])

  // Copy titration schedule to clipboard
  const handleCopyTitration = () => {
    if (!drug.titrationSchedule || drug.titrationSchedule.length === 0) return
    const lines = [
      `=== ${drug.name.toUpperCase()} (${drug.brand || ''}) TITRATION PROTOCOL ===`,
      `Target Maintenance Dose: ${drug.targetDose || 'N/A'}`,
      `Max Approved Ceiling: ${drug.maxDose || 'N/A'}`,
      `Food Requirement: ${drug.foodRequirement || 'None specified'}`,
      '',
      'TITRATION SCHEDULE:',
      ...drug.titrationSchedule.map((s, idx) =>
        `${s.step || `Step ${idx + 1}`}: ${s.dose} ${s.timing ? `[${s.timing}]` : ''} - ${s.directive || ''}`
      ),
      '',
      drug.blackBox ? `CRITICAL WARNING: ${drug.blackBox.title} - ${drug.blackBox.warning}` : '',
      '====================================================='
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('Titration schedule copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

  // Severity color mapper for Adverse Footprint
  const getSeverityBadge = (severity) => {
    const s = (severity || '').toLowerCase()
    if (s.includes('severe')) {
      return { bg: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50', dot: 'bg-red-600 dark:bg-red-500' }
    }
    if (s.includes('very high')) {
      return { bg: 'bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-900/50', dot: 'bg-orange-600 dark:bg-orange-500' }
    }
    if (s.includes('high')) {
      return { bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', dot: 'bg-amber-600 dark:bg-amber-500' }
    }
    if (s.includes('mod')) {
      return { bg: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/50', dot: 'bg-yellow-500' }
    }
    if (s.includes('low')) {
      return { bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50', dot: 'bg-emerald-500' }
    }
    if (s.includes('near zero') || s.includes('sparing') || s.includes('minimal')) {
      return { bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50', dot: 'bg-blue-400' }
    }
    return { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton title={drug.name} />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Taxonomy Badges */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            {family && (
              <button
                onClick={() => navigate(`/family/${family.id}`)}
                className="text-xs font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 border cursor-pointer"
                style={{
                  backgroundColor: family.color + '15',
                  color: family.color,
                  borderColor: family.color + '30',
                }}
              >
                {family.name}
              </button>
            )}
            {drug.subgroupId && (
              <button
                onClick={() => navigate(`/subgroup/${drug.subgroupId}`)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {drug.subgroup}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const isNow = toggleFavorite('drug', drug.id)
                setStarred(isNow)
                setToastMessage(isNow ? `${drug.name} saved to Clinical Favorites!` : `${drug.name} removed from favorites`)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                starred
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title={starred ? 'Starred in Favorites' : 'Add to Favorites'}
            >
              <span>{starred ? '★' : '☆'}</span>
              <span>{starred ? 'Starred' : 'Star'}</span>
            </button>

            <button
              onClick={handleCopyTitration}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#111827] hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/90 dark:border-slate-800/90 cursor-pointer shadow-xs"
              title="Copy titration schedule and warnings to clipboard"
            >
              <span>📋</span>
              <span>Copy Titration</span>
            </button>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
          {drug.name}
        </h1>

        {/* Archived Brand Names Collapsible */}
        {drug.brand && (
          <details className="group text-xs text-slate-400 dark:text-slate-500 mb-2 cursor-pointer">
            <summary className="inline-flex items-center gap-1.5 font-medium hover:text-slate-600 dark:hover:text-slate-300 list-none select-none">
              <span className="text-[9px] text-slate-400 group-open:rotate-90 transition-transform">▶</span>
              <span className="font-semibold text-slate-400 dark:text-slate-500">Archived Brand Names</span>
            </summary>
            <p className="mt-1 pl-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {drug.brand}
            </p>
          </details>
        )}

        {/* Compact Target Maintenance & Max Ceiling Cards */}
        {(drug.targetDose || drug.maxDose) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 mb-4">
            {drug.targetDose && (
              <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Target Maintenance Dose
                </span>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {drug.targetDose}
                </p>
              </div>
            )}

            {drug.maxDose && (
              <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Max Approved Ceiling
                </span>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {drug.maxDose}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Clinical Benchmark Metrics Grid */}
      {drug.benchmarkMetrics && drug.benchmarkMetrics.length > 0 && (
        <div id="benchmarks" className="mb-6">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Clinical Benchmark Metrics
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {drug.benchmarkMetrics.map((bm, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5 truncate">
                    {bm.label}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {bm.value}
                  </p>
                </div>
                {bm.detail && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 font-medium leading-tight">
                    {bm.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Molecular Receptor Binding Profile */}
      {drug.receptors && drug.receptors.length > 0 && (
        <div id="receptors" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Receptor Binding Profile & Occupancy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Molecular affinities (Ki) and target occupancies
              </p>
            </div>
            <button
              onClick={() => navigate('/receptors')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              Guide →
            </button>
          </div>

          <div className="space-y-1.5">
            {drug.receptors.map(r => {
              const receptorObj = data.receptors.find(rec => rec.id === r.receptor)
              const recColor = receptorObj?.color || '#4f46e5'
              const width = Math.min(Math.max(r.occupancy || 50, 12), 100)

              return (
                <div key={r.receptor} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/60 dark:border-slate-800/60">
                  {/* Receptor Symbol */}
                  <button
                    onClick={() => navigate(`/receptors/${r.receptor}`)}
                    className="flex items-center gap-1.5 flex-shrink-0 min-w-[60px] cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: recColor }} />
                    <span className="text-xs font-black" style={{ color: recColor }}>{r.receptor}</span>
                  </button>

                  {/* Occupancy Bar — compact */}
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: recColor,
                      }}
                    />
                  </div>

                  {/* Occupancy % */}
                  <span className="text-xs font-black w-9 text-right flex-shrink-0" style={{ color: recColor }}>
                    {r.occupancy}%
                  </span>

                  {/* Ki badge — compact */}
                  {r.ki && (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex-shrink-0 w-16 text-right truncate">
                      {r.ki}
                    </span>
                  )}

                  {/* Action badge — compact */}
                  {r.action && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0 hidden sm:block max-w-[80px] truncate">
                      {r.action}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Adverse Effect Risk Footprint (8 Domains with Tied Receptor Mechanisms) */}
      {drug.adverseFootprint && drug.adverseFootprint.length > 0 && (
        <div id="adverse" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <div className="mb-2.5">
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Adverse Effect Risk Footprint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standardized clinical risk profile tied to underlying receptor mechanisms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {drug.adverseFootprint.map((af, i) => {
              const badge = getSeverityBadge(af.severity)
              const tiedReceptors = getDomainReceptorTies(af.domain, drug.receptors)
              return (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">
                      {af.domain}
                    </span>
                    {tiedReceptors && tiedReceptors.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                          Via:
                        </span>
                        {tiedReceptors.map(tr => (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/receptors/${tr.id}`)
                            }}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded hover:opacity-80 transition-opacity cursor-pointer border"
                            style={{
                              backgroundColor: `${tr.color}15`,
                              color: tr.color,
                              borderColor: `${tr.color}35`,
                            }}
                            title={`Receptor ${tr.id}: ${tr.mechanism}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tr.color }} />
                            {tr.id}
                          </button>
                        ))}
                        {tiedReceptors[0]?.mechanism && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                            · {tiedReceptors[0].mechanism}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {af.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Indications & Clinical Utility */}
      {((drug.indications && drug.indications.length > 0) || (drug.offLabel && drug.offLabel.length > 0)) && (
        <div id="indications" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
            Indications & Clinical Utility
          </h2>

          {drug.indications && drug.indications.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                FDA Approved / Core Indications
              </p>
              <div className="space-y-1.5">
                {drug.indications.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {drug.offLabel && drug.offLabel.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Evidence-Based Off-Label Uses
              </p>
              <div className="space-y-1.5">
                {drug.offLabel.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-slate-400 mt-0.5">○</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FDA Boxed Warning / Critical Alerts */}
      {drug.blackBox && (
        <div id="warnings" className="bg-red-50/50 dark:bg-red-950/20 border-2 border-red-500/80 dark:border-red-500/60 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  FDA Boxed Warning
                </span>
                <h3 className="font-bold text-red-900 dark:text-red-200 text-xs sm:text-sm uppercase tracking-wide">
                  {drug.blackBox.title || 'CRITICAL CLINICAL ALERT'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                {drug.blackBox.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Food & Administration Mandate */}
      {drug.foodRequirement && (
        <div id="administration" className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 sm:p-4 mb-6 flex items-start gap-3 shadow-xs">
          <span className="text-lg flex-shrink-0 mt-0.5">🍽️</span>
          <div>
            <h3 className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-0.5">
              Food & Administration Requirements
            </h3>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
              {drug.foodRequirement}
            </p>
          </div>
        </div>
      )}

      {/* Compact Structured Titration Schedule */}
      {drug.titrationSchedule && drug.titrationSchedule.length > 0 && (
        <div id="titration" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Structured Titration Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phase-based dosing progression and titration directives
              </p>
            </div>
            <button
              onClick={handleCopyTitration}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Copy Protocol →
            </button>
          </div>

          <div className="space-y-2">
            {drug.titrationSchedule.map((step, idx) => {
              const stepName = (step.step || step.title || `STEP ${idx + 1}`).toUpperCase()
              const isReset = stepName.includes('RESET') || stepName.includes('RESTART')
              const isTarget = stepName.includes('TARGET') || stepName.includes('MAINTENANCE')

              const badgeStyle = isReset
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900'
                : isTarget
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'

              const cardBg = isReset
                ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-900/40'
                : isTarget
                ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-900/40'
                : 'bg-slate-50 dark:bg-[#0b0f19] border-slate-200/80 dark:border-slate-800/80'

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 border transition-all ${cardBg}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wide border flex-shrink-0 ${badgeStyle}`}>
                        {step.step || `STEP ${idx + 1}`}
                      </span>
                      <h3 className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {step.dose}
                      </h3>
                    </div>
                    {step.timing && (
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        ⏱️ {step.timing}
                      </span>
                    )}
                  </div>
                  {step.directive && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-0.5">
                      {step.directive}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Compact Special Populations & Organ Adjustments */}
      {drug.specialPopulations && (
        <div id="special" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <div className="mb-3">
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Special Populations & Organ Adjustments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {drug.specialPopulations.perinatal && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-pink-500">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🤰</span>
                  <span className="text-[11px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">
                    Perinatal & Pregnancy
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {drug.specialPopulations.perinatal}
                </p>
              </div>
            )}

            {drug.specialPopulations.pediatric && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🧒</span>
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Pediatric
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {drug.specialPopulations.pediatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.geriatric && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">👴</span>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Geriatric & Beers
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {drug.specialPopulations.geriatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.organImpairment && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">🩺</span>
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    Renal & Hepatic
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {drug.specialPopulations.organImpairment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* High-Yield Clinical Practice Pearls */}
      {drug.clinicalPearls && drug.clinicalPearls.length > 0 && (
        <div id="pearls" className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
            High-Yield Clinical Practice Pearls
          </h2>
          <div className="space-y-2">
            {drug.clinicalPearls.map((pearl, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 leading-relaxed font-normal">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-0.5">✓</span>
                <span>{pearl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Cross-Titration Protocols */}
      {relatedProtocols.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
            Module 12 Cross-Titration Protocols
          </span>
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1">
            Transition Protocols Involving {drug.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Switching to or from {drug.name}? View structured taper algorithms and receptor kinetics:
          </p>

          <div className="space-y-2">
            {relatedProtocols.map(proto => (
              <button
                key={proto.id}
                onClick={() => navigate(`/cross-titration/${proto.id}`)}
                className="w-full bg-slate-50 dark:bg-[#0b0f19] hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl p-3 text-left transition-all flex items-center justify-between text-sm border border-slate-200/80 dark:border-slate-800/80 group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Protocol #{proto.number}: {proto.title}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{proto.transitionTitle}</p>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs ml-2">
                  Launch →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bedside Tools & Clinical Calculators (Moved from top to bottom section) */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2.5">
          Point-of-Care Bedside Tools & Calculators
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {(drug.familyId === 'antipsychotics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('antipsychotic'))) && (
            <>
              <button
                onClick={() => navigate(`/tools?tab=cpz&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>🎭</span>
                <span>CPZ Equivalence</span>
              </button>
              <button
                onClick={() => navigate('/tools?tab=metabolic')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>📊</span>
                <span>Metabolic Monitoring</span>
              </button>
            </>
          )}

          {drug.name.toLowerCase().includes('clozapine') && (
            <button
              onClick={() => navigate('/tools?tab=clozapine')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-700 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>🩸</span>
              <span>REMS ANC Triage</span>
            </button>
          )}

          {drug.name.toLowerCase().includes('lithium') && (
            <button
              onClick={() => navigate('/tools?tab=lithium')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>🧪</span>
              <span>Lithium 12h TDM</span>
            </button>
          )}

          {(drug.familyId === 'anxiolytics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('benzodiazepine'))) && (
            <button
              onClick={() => navigate(`/tools?tab=bzd&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>⚖️</span>
              <span>Ashton Taper Calculator</span>
            </button>
          )}

          {/* Quick Screen for CYP450 & QTc */}
          <button
            onClick={() => navigate(`/tools?tab=cyp&drug=${encodeURIComponent(drug.id)}`)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0b0f19] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>⚡</span>
            <span>Check CYP & QTc</span>
          </button>

          {relatedProtocols.length > 0 && (
            <button
              onClick={() => navigate(`/cross-titration/${relatedProtocols[0].id}`)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>🔄</span>
              <span>Switch Protocol ({relatedProtocols.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* DataSource Footer */}
      <div className="mt-8 text-center pb-6">
        <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-500 dark:text-slate-400 font-medium shadow-2xs">
          Source: {drug.dataSource || '12-Module Master Psychopharmacology Reference Compendium'}
        </span>
      </div>
    </div>
  )
}
