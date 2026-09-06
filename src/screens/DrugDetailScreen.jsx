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
        <h2 className="text-xl font-bold text-gray-800 mb-2">Medication Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The requested drug monograph does not exist in the compendium.</p>
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
      return { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-600' }
    }
    if (s.includes('very high')) {
      return { bg: 'bg-orange-100 text-orange-900 border-orange-200', dot: 'bg-orange-600' }
    }
    if (s.includes('high')) {
      return { bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-600' }
    }
    if (s.includes('mod')) {
      return { bg: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' }
    }
    if (s.includes('low')) {
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' }
    }
    if (s.includes('near zero') || s.includes('sparing') || s.includes('minimal')) {
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' }
    }
    return { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <BackButton title={drug.name} />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Sticky Section Jump Bar */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-gray-200/80 p-1.5 mb-5 flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'benchmarks', label: 'Benchmarks' },
          { id: 'receptors', label: 'Receptors' },
          { id: 'adverse', label: 'Adverse Footprint' },
          { id: 'titration', label: 'Titration' },
          { id: 'special', label: 'Special Pop' },
          { id: 'pearls', label: 'Pearls' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header & Taxonomy Badges */}
      <div id="overview" className="mb-5 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            {family && (
              <button
                onClick={() => navigate(`/family/${family.id}`)}
                className="text-xs font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80 border"
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
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                starred
                  ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:text-amber-600'
              }`}
              title={starred ? 'Starred in Favorites' : 'Add to Favorites'}
            >
              <span>{starred ? '★' : '☆'}</span>
              <span>{starred ? 'Starred' : 'Star'}</span>
            </button>

            <button
              onClick={handleCopyTitration}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 text-xs font-semibold transition-all border border-gray-200"
              title="Copy titration schedule and warnings to clipboard"
            >
              <span>📋</span>
              <span>Copy Titration</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
          {drug.name}
        </h1>

        {/* Context-Aware Point-of-Care Clinical Action Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {(drug.familyId === 'antipsychotics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('antipsychotic'))) && (
            <button
              onClick={() => navigate(`/tools?tab=cpz&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>🎭</span>
              <span>Convert CPZ Equivalents</span>
            </button>
          )}

          {(drug.familyId === 'antipsychotics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('antipsychotic'))) && (
            <button
              onClick={() => navigate('/tools?tab=metabolic')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>📊</span>
              <span>SGA Metabolic Protocol</span>
            </button>
          )}

          {drug.name.toLowerCase().includes('clozapine') && (
            <button
              onClick={() => navigate('/tools?tab=clozapine')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>🩸</span>
              <span>Clozapine REMS ANC Triage</span>
            </button>
          )}

          {drug.name.toLowerCase().includes('lithium') && (
            <button
              onClick={() => navigate('/tools?tab=lithium')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>🧪</span>
              <span>Lithium 12h Trough & TDM</span>
            </button>
          )}

          {(drug.familyId === 'anxiolytics' || (drug.subgroup && drug.subgroup.toLowerCase().includes('benzodiazepine'))) && (
            <button
              onClick={() => navigate(`/tools?tab=bzd&drug=${encodeURIComponent(drug.name.toLowerCase())}`)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>⚖️</span>
              <span>Diazepam Equivalents & Ashton Taper</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/tools?tab=cyp&drug=${encodeURIComponent(drug.id)}`)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
          >
            <span>⚡</span>
            <span>Screen CYP450 Collisions</span>
          </button>

          <button
            onClick={() => navigate(`/tools?tab=qtc&drug=${encodeURIComponent(drug.id)}`)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors inline-flex items-center gap-1 shadow-2xs"
          >
            <span>❤️</span>
            <span>Screen QTc Risk</span>
          </button>

          {relatedProtocols.length > 0 ? (
            <button
              onClick={() => navigate(`/cross-titration/${relatedProtocols[0].id}`)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700 hover:bg-purple-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>🔄</span>
              <span>Switch Protocol ({relatedProtocols.length} Available)</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/cross-titration')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Find Switch Protocol</span>
            </button>
          )}
        </div>

        {drug.brand && (
          <p className="text-sm font-medium text-gray-500 mb-3">
            {drug.brand}
          </p>
        )}

        {/* Target Maintenance & Max Ceiling Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
          {drug.targetDose && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                  Target Maintenance Dose
                </p>
                <p className="text-sm font-black text-indigo-950">
                  {drug.targetDose}
                </p>
              </div>
            </div>
          )}

          {drug.maxDose && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                ⚡
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                  Max Approved Ceiling
                </p>
                <p className="text-sm font-black text-purple-950 truncate">
                  {drug.maxDose}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4-Card Benchmark Metrics Grid */}
      {drug.benchmarkMetrics && drug.benchmarkMetrics.length > 0 && (
        <div id="benchmarks" className="mb-6 scroll-mt-20">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>📐</span>
            <span>Clinical Benchmark Metrics</span>
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {drug.benchmarkMetrics.map((bm, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-xs hover:border-gray-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">
                    {bm.label}
                  </span>
                  <p className="text-sm font-black text-gray-900 leading-snug">
                    {bm.value}
                  </p>
                </div>
                {bm.detail && (
                  <p className="text-[11px] font-medium text-indigo-600 mt-2 pt-2 border-t border-gray-50">
                    {bm.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Black Box Warning / Critical Alerts */}
      {drug.blackBox && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 mb-6 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  Boxed Warning
                </span>
                <h3 className="font-black text-rose-950 text-xs uppercase tracking-wide">
                  {drug.blackBox.title || 'CRITICAL CLINICAL ALERT'}
                </h3>
              </div>
              <p className="text-xs text-rose-950 leading-relaxed font-medium">
                {drug.blackBox.warning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Food & Administration Mandate */}
      {drug.foodRequirement && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-xs">
          <span className="text-xl flex-shrink-0">🍽️</span>
          <div>
            <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-0.5">
              Food & Administration Requirements
            </h3>
            <p className="text-xs text-amber-950 font-semibold leading-relaxed">
              {drug.foodRequirement}
            </p>
          </div>
        </div>
      )}

      {/* Molecular Receptor Binding Profile */}
      {drug.receptors && drug.receptors.length > 0 && (
        <div id="receptors" className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🧬</span>
              <span>Receptor Binding Profile & Occupancy</span>
            </h2>
            <button
              onClick={() => navigate('/receptors')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Receptor Guide →
            </button>
          </div>

          <div className="space-y-4">
            {drug.receptors.map(r => {
              const receptorObj = data.receptors.find(rec => rec.id === r.receptor)
              const recColor = receptorObj?.color || '#6366f1'
              const width = Math.min(Math.max(r.occupancy || 50, 15), 100)

              return (
                <div key={r.receptor} className="bg-gray-50/60 rounded-2xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <ReceptorTag receptorId={r.receptor} />
                      {r.rawTarget && (
                        <span className="text-xs font-semibold text-gray-700">
                          {r.rawTarget}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {r.ki && (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Ki: {r.ki}
                        </span>
                      )}
                      {r.action && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-800">
                          {r.action}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                      style={{
                        width: `${width}%`,
                        backgroundColor: recColor,
                        minWidth: '2rem',
                      }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-xs">
                        {r.occupancy}%
                      </span>
                    </div>
                  </div>

                  {/* Clinical Action explanation */}
                  {r.clinicalAction && (
                    <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1">
                      <span className="font-bold text-gray-800">Clinical Action:</span> {r.clinicalAction}
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
        <div id="adverse" className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6 scroll-mt-20">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Adverse Effect Risk Footprint</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Standardized 8-domain clinical risk profile according to compendium pharmacology benchmarks:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {drug.adverseFootprint.map((af, i) => {
              const badge = getSeverityBadge(af.severity)
              return (
                <div
                  key={i}
                  className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3 flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-bold text-gray-800">
                    {af.domain}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 flex-shrink-0 ${badge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {af.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Structured 4-Step Titration Schedule */}
      {drug.titrationSchedule && drug.titrationSchedule.length > 0 && (
        <div id="titration" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-6 scroll-mt-20">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span>📈</span>
              <span>Structured 4-Step Titration Schedule</span>
            </h2>
            <button
              onClick={handleCopyTitration}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Copy Protocol →
            </button>
          </div>

          <div className="space-y-3">
            {drug.titrationSchedule.map((step, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs flex-shrink-0 shadow-2xs">
                    {step.step || `STEP ${idx + 1}`}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      {step.dose}
                    </h3>
                    {step.timing && (
                      <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                        ⏱️ {step.timing}
                      </p>
                    )}
                    {step.directive && (
                      <p className="text-xs text-gray-600 mt-1">
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

      {/* Special Populations & Organ Impairment */}
      {drug.specialPopulations && (
        <div id="special" className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6 scroll-mt-20">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>👥</span>
            <span>Special Populations & Organ Adjustments</span>
          </h2>

          <div className="space-y-2.5">
            {drug.specialPopulations.perinatal && (
              <div className="bg-pink-50/40 rounded-2xl p-3 border border-pink-100">
                <span className="text-[10px] font-black text-pink-700 uppercase tracking-wider block mb-0.5">
                  Perinatal & Pregnancy
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {drug.specialPopulations.perinatal}
                </p>
              </div>
            )}

            {drug.specialPopulations.pediatric && (
              <div className="bg-blue-50/40 rounded-2xl p-3 border border-blue-100">
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block mb-0.5">
                  Pediatric Considerations
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {drug.specialPopulations.pediatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.geriatric && (
              <div className="bg-amber-50/40 rounded-2xl p-3 border border-amber-100">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block mb-0.5">
                  Geriatric & Beers Criteria
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {drug.specialPopulations.geriatric}
                </p>
              </div>
            )}

            {drug.specialPopulations.organImpairment && (
              <div className="bg-purple-50/40 rounded-2xl p-3 border border-purple-100">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block mb-0.5">
                  Renal & Hepatic Impairment
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {drug.specialPopulations.organImpairment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indications & Off-Label */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🎯</span>
          <span>Indications & Clinical Utility</span>
        </h2>

        {drug.indications && drug.indications.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              FDA Approved / Core Indications
            </p>
            <div className="space-y-1.5">
              {drug.indications.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-800">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="font-semibold">{ind}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {drug.offLabel && drug.offLabel.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Evidence-Based Off-Label Uses
            </p>
            <div className="space-y-1.5">
              {drug.offLabel.map((ind, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 mt-0.5">○</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Pearls */}
      {drug.clinicalPearls && drug.clinicalPearls.length > 0 && (
        <div id="pearls" className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs mb-6 scroll-mt-20">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>💡</span>
            <span>High-Yield Clinical Practice Pearls</span>
          </h2>
          <div className="space-y-2.5">
            {drug.clinicalPearls.map((pearl, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 bg-indigo-50/40 rounded-2xl p-3 border border-indigo-100/50">
                <span className="text-indigo-600 font-black text-sm">✓</span>
                <span className="leading-relaxed font-medium">{pearl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Cross-Titration Protocols Link if applicable */}
      {relatedProtocols.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-5 shadow-lg mb-6">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-700 text-purple-200">
            Module 12 Cross-Titration
          </span>
          <h3 className="font-extrabold text-base mt-2 mb-1">
            Transition Protocols Involving {drug.name}
          </h3>
          <p className="text-xs text-purple-200 mb-3">
            Switching to or from {drug.name}? View structured taper algorithms and receptor kinetics:
          </p>

          <div className="space-y-2">
            {relatedProtocols.map(proto => (
              <button
                key={proto.id}
                onClick={() => navigate(`/cross-titration/${proto.id}`)}
                className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-colors flex items-center justify-between text-xs backdrop-blur-xs group"
              >
                <div>
                  <span className="font-bold text-white group-hover:text-purple-200">
                    Protocol #{proto.number}: {proto.title}
                  </span>
                  <p className="text-[11px] text-purple-300 mt-0.5">{proto.transitionTitle}</p>
                </div>
                <span className="text-purple-300 group-hover:text-white font-bold ml-2">
                  Launch →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DataSource Footer */}
      <div className="mt-8 text-center pb-6">
        <span className="text-[11px] px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
          Source: {drug.dataSource || '12-Module Master Psychopharmacology Reference Compendium'}
        </span>
      </div>
    </div>
  )
}
