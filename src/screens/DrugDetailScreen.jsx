import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import ReceptorTag from '../components/ReceptorTag'
import Toast from '../components/Toast'

import { isFavorite, toggleFavorite } from '../utils/favorites'

export default function DrugDetailScreen() {
  const { drugId } = useParams()
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

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

  // Scroll to section
  const scrollTo = (id) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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

      {/* Sticky Section Jump Bar */}
      <div className="sticky top-2 z-30 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-200/90 dark:border-slate-800/90 p-1.5 mb-6 flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'benchmarks', label: 'Benchmarks' },
          { id: 'receptors', label: 'Receptors' },
          { id: 'adverse', label: 'Adverse Footprint' },
          { id: 'indications', label: 'Indications' },
          { id: 'warnings', label: 'FDA / Safety' },
          { id: 'titration', label: 'Titration' },
          { id: 'special', label: 'Special Pop' },
          { id: 'pearls', label: 'High-Yield' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header & Taxonomy Badges */}
      <div id="overview" className="mb-6 scroll-mt-20">
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

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          {drug.name}
        </h1>

        {drug.brand && (
          <p className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4">
            {drug.brand}
          </p>
        )}

        {/* Streamlined Context-Aware Point-of-Care Clinical Action Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {(drug.familyId === 'antipsychotics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('antipsychotic'))) && (
            <>
              <button
                onClick={() => navigate(`/tools?tab=cpz&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
              >
                <span>🎭</span>
                <span>CPZ Equivalence</span>
              </button>
              <button
                onClick={() => navigate('/tools?tab=metabolic')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
              >
                <span>📊</span>
                <span>Metabolic Monitoring</span>
              </button>
            </>
          )}

          {drug.name.toLowerCase().includes('clozapine') && (
            <button
              onClick={() => navigate('/tools?tab=clozapine')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-rose-600 dark:hover:text-rose-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
            >
              <span>🩸</span>
              <span>REMS ANC Triage</span>
            </button>
          )}

          {drug.name.toLowerCase().includes('lithium') && (
            <button
              onClick={() => navigate('/tools?tab=lithium')}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
            >
              <span>🧪</span>
              <span>Lithium 12h TDM</span>
            </button>
          )}

          {(drug.familyId === 'anxiolytics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('benzodiazepine'))) && (
            <button
              onClick={() => navigate(`/tools?tab=bzd&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
            >
              <span>⚖️</span>
              <span>Ashton Taper Calculator</span>
            </button>
          )}

          {/* Quick Screen for CYP450 & QTc */}
          <button
            onClick={() => navigate(`/tools?tab=cyp&drug=${encodeURIComponent(drug.id)}`)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 transition-all inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            <span>⚡</span>
            <span>Check CYP & QTc</span>
          </button>

          {relatedProtocols.length > 0 && (
            <button
              onClick={() => navigate(`/cross-titration/${relatedProtocols[0].id}`)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors inline-flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
            >
              <span>🔄</span>
              <span>Switch Protocol ({relatedProtocols.length})</span>
            </button>
          )}
        </div>


        {/* Target Maintenance & Max Ceiling Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          {drug.targetDose && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Target Maintenance Dose
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {drug.targetDose}
              </p>
            </div>
          )}

          {drug.maxDose && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Max Approved Ceiling
              </span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {drug.maxDose}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4-Card Benchmark Metrics Grid */}
      {drug.benchmarkMetrics && drug.benchmarkMetrics.length > 0 && (
        <div id="benchmarks" className="mb-8 scroll-mt-20">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Clinical Benchmark Metrics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {drug.benchmarkMetrics.map((bm, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {bm.label}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {bm.value}
                  </p>
                </div>
                {bm.detail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 font-medium">
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
        <div id="receptors" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Receptor Binding Profile & Occupancy
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Molecular affinities (Ki) and therapeutic target occupancies
              </p>
            </div>
            <button
              onClick={() => navigate('/receptors')}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Receptor Guide →
            </button>
          </div>

          <div className="space-y-3.5">
            {drug.receptors.map(r => {
              const receptorObj = data.receptors.find(rec => rec.id === r.receptor)
              const recColor = receptorObj?.color || '#4f46e5'
              const width = Math.min(Math.max(r.occupancy || 50, 15), 100)

              return (
                <div key={r.receptor} className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ReceptorTag receptorId={r.receptor} />
                      {r.rawTarget && (
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {r.rawTarget}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {r.ki && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
                          Ki: {r.ki}
                        </span>
                      )}
                      {r.action && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {r.action}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                      style={{
                        width: `${width}%`,
                        backgroundColor: recColor,
                        minWidth: '2.5rem',
                      }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow-xs">
                        {r.occupancy}%
                      </span>
                    </div>
                  </div>

                  {/* Clinical Action explanation */}
                  {r.clinicalAction && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed mt-2">
                      <strong className="font-semibold text-slate-900 dark:text-white">Clinical Action:</strong> {r.clinicalAction}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Adverse Effect Risk Footprint (8 Domains) */}
      {drug.adverseFootprint && drug.adverseFootprint.length > 0 && (
        <div id="adverse" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            Adverse Effect Risk Footprint
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Standardized 8-domain clinical risk profile according to compendium pharmacology benchmarks:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {drug.adverseFootprint.map((af, i) => {
              const badge = getSeverityBadge(af.severity)
              return (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-2"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {af.domain}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 flex-shrink-0 ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    {af.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Indications & Clinical Utility */}
      <div id="indications" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
        <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
          Indications & Clinical Utility
        </h2>

        {drug.indications && drug.indications.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
              FDA Approved / Core Indications
            </p>
            <div className="space-y-2">
              {drug.indications.map((ind, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {drug.offLabel && drug.offLabel.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
              Evidence-Based Off-Label Uses
            </p>
            <div className="space-y-2">
              {drug.offLabel.map((ind, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="text-slate-400 mt-0.5">○</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FDA Boxed Warning / Critical Alerts (Dignified, Medical-Grade) */}
      {drug.blackBox && (
        <div id="warnings" className="bg-red-50/50 dark:bg-red-950/20 border-2 border-red-500/80 dark:border-red-500/60 rounded-2xl p-5 mb-8 shadow-xs scroll-mt-20">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-black uppercase tracking-wider">
                  FDA Boxed Warning
                </span>
                <h3 className="font-bold text-red-900 dark:text-red-200 text-xs sm:text-sm uppercase tracking-wide">
                  {drug.blackBox.title || 'CRITICAL CLINICAL ALERT'}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                {drug.blackBox.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Food & Administration Mandate */}
      {drug.foodRequirement && (
        <div id="administration" className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3 shadow-xs scroll-mt-20">
          <span className="text-xl flex-shrink-0 mt-0.5">🍽️</span>
          <div>
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1">
              Food & Administration Requirements
            </h3>
            <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
              {drug.foodRequirement}
            </p>
          </div>
        </div>
      )}

      {/* Structured 4-Step Titration Schedule */}
      {drug.titrationSchedule && drug.titrationSchedule.length > 0 && (
        <div id="titration" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Structured 4-Step Titration Schedule
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Phase-based dosing progression and titration directives
              </p>
            </div>
            <button
              onClick={handleCopyTitration}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Copy Protocol →
            </button>
          </div>

          <div className="space-y-3">
            {drug.titrationSchedule.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex-shrink-0 mt-0.5 shadow-2xs">
                    {step.step || `STEP ${idx + 1}`}
                  </span>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                      {step.dose}
                    </h3>
                    {step.timing && (
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        ⏱️ {step.timing}
                      </p>
                    )}
                    {step.directive && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-normal">
                        {step.directive}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Populations & Organ Adjustments (Simplified 2x2 Box) */}
      {drug.specialPopulations && (
        <div id="special" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            Special Populations & Organ Adjustments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Prescribing considerations across vulnerable demographics and clearance pathways
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {drug.specialPopulations.perinatal && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 border-t-2 border-t-pink-500 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">🤰</span>
                  <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">
                    Perinatal & Pregnancy
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {drug.specialPopulations.perinatal}
                </p>
              </div>
            )}

            {drug.specialPopulations.pediatric && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 border-t-2 border-t-blue-500 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">🧒</span>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    Pediatric Considerations
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {drug.specialPopulations.pediatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.geriatric && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 border-t-2 border-t-amber-500 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">👴</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Geriatric & Beers Criteria
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {drug.specialPopulations.geriatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.organImpairment && (
              <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 border-t-2 border-t-purple-500 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">🩺</span>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    Renal & Hepatic Clearance
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {drug.specialPopulations.organImpairment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* High-Yield Clinical Practice Pearls */}
      {drug.clinicalPearls && drug.clinicalPearls.length > 0 && (
        <div id="pearls" className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 scroll-mt-20">
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
            High-Yield Clinical Practice Pearls
          </h2>
          <div className="space-y-3">
            {drug.clinicalPearls.map((pearl, i) => (
              <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 leading-relaxed font-normal">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base mt-0.5">✓</span>
                <span>{pearl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Cross-Titration Protocols Link if applicable */}
      {relatedProtocols.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
            Module 12 Cross-Titration Protocols
          </span>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
            Transition Protocols Involving {drug.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Switching to or from {drug.name}? View structured taper algorithms and receptor kinetics:
          </p>

          <div className="space-y-2.5">
            {relatedProtocols.map(proto => (
              <button
                key={proto.id}
                onClick={() => navigate(`/cross-titration/${proto.id}`)}
                className="w-full bg-slate-50 dark:bg-[#0b0f19] hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl p-4 text-left transition-all flex items-center justify-between text-sm border border-slate-200/80 dark:border-slate-800/80 group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Protocol #{proto.number}: {proto.title}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{proto.transitionTitle}</p>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm ml-2">
                  Launch →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DataSource Footer */}
      <div className="mt-8 text-center pb-6">
        <span className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-500 dark:text-slate-400 font-medium shadow-2xs">
          Source: {drug.dataSource || '12-Module Master Psychopharmacology Reference Compendium'}
        </span>
      </div>
    </div>
  )
}
