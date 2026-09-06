import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function CrossTitrationScreen() {
  const { protocolId } = useParams()
  const navigate = useNavigate()

  const protocols = data.protocols || []

  // Active protocol if protocolId is provided
  const activeProtocol = useMemo(() => {
    if (!protocolId) return null
    return protocols.find(p => p.id === protocolId) || null
  }, [protocolId, protocols])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSwitchType, setSelectedSwitchType] = useState('ALL')

  // Collect distinct switch types
  const switchTypes = useMemo(() => {
    const types = new Set()
    protocols.forEach(p => {
      if (p.switchType) types.add(p.switchType)
    })
    return ['ALL', ...Array.from(types)]
  }, [protocols])

  // Filter protocols for list view
  const filteredProtocols = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return protocols.filter(p => {
      if (selectedSwitchType !== 'ALL' && p.switchType !== selectedSwitchType) {
        return false
      }
      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q)
        const transMatch = p.transitionTitle && p.transitionTitle.toLowerCase().includes(q)
        const classMatch = p.classTransition && p.classTransition.toLowerCase().includes(q)
        const mandateMatch = p.coreMandate && p.coreMandate.toLowerCase().includes(q)
        const rationaleMatch = p.rationale && p.rationale.toLowerCase().includes(q)
        return titleMatch || transMatch || classMatch || mandateMatch || rationaleMatch
      }
      return true
    })
  }, [protocols, searchQuery, selectedSwitchType])

  // If a protocol is selected, render the full authoritative protocol view
  if (activeProtocol) {
    return <ProtocolDetailView protocol={activeProtocol} onBack={() => navigate('/cross-titration')} />
  }

  // Otherwise render the Master Protocol Catalog
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <BackButton />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold mb-2">
          <span>🔄</span>
          <span>Module 12: Cross-Titration & Deprescribing Master Tool</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Transition & Deprescribing Protocols
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          20 evidence-based switch algorithms with 4-phase timelines, receptor shift dynamics, risk stratification meters, and emergency rescue guides.
        </p>
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
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search switch by drug name (e.g. Venlafaxine, Clozapine, Lithium)..."
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-gray-400"
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

      {/* Switch Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
        {switchTypes.map(st => {
          const isSelected = selectedSwitchType === st
          return (
            <button
              key={st}
              onClick={() => setSelectedSwitchType(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
              }`}
            >
              {st === 'ALL' ? `All Protocols (${protocols.length})` : st}
            </button>
          )
        })}
      </div>

      {/* Protocol Cards List */}
      <div className="space-y-3">
        {filteredProtocols.map(proto => (
          <div
            key={proto.id}
            onClick={() => navigate(`/cross-titration/${proto.id}`)}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                  #{proto.number < 10 ? `0${proto.number}` : proto.number}
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 group-hover:text-purple-700 transition-colors">
                    {proto.title}
                  </h3>
                  <p className="text-xs font-semibold text-purple-600 mt-0.5">
                    {proto.transitionTitle}
                  </p>
                </div>
              </div>

              <span className="text-gray-300 group-hover:text-purple-600 transition-colors text-lg flex-shrink-0">
                →
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
              {proto.classTransition}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
              {proto.switchType && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                  {proto.switchType}
                </span>
              )}
              {proto.duration && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                  ⏱️ {proto.duration}
                </span>
              )}
              {proto.coreMandate && (
                <span className="text-[11px] text-gray-500 italic ml-auto truncate max-w-xs">
                  Mandate: {proto.coreMandate}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProtocolDetailView({ protocol, onBack }) {
  const navigate = useNavigate()

  // Risk meter severity color helper
  const getRiskColor = (severity) => {
    const s = (severity || '').toUpperCase()
    if (s.includes('SEVERE') || s.includes('VERY HIGH')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500', width: '90%' }
    if (s.includes('HIGH')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', width: '75%' }
    if (s.includes('MODERATE')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', width: '50%' }
    if (s.includes('LOW')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', width: '25%' }
    return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', bar: 'bg-gray-400', width: '15%' }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to All 20 Protocols
      </button>

      {/* Protocol Header Card */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
            Protocol #{protocol.number < 10 ? `0${protocol.number}` : protocol.number}
          </span>
          <span className="text-xs font-semibold text-purple-300">
            Module 12 Compendium Reference
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          {protocol.title}
        </h1>

        <p className="text-base font-bold text-purple-200 mb-2">
          {protocol.transitionTitle}
        </p>

        <p className="text-xs text-purple-300/80 mb-5">
          {protocol.classTransition}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-purple-800/60 text-xs">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block mb-0.5">
              Switch Paradigm
            </span>
            <span className="font-bold text-white text-xs">
              {protocol.switchType}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block mb-0.5">
              Standard Duration
            </span>
            <span className="font-bold text-amber-300 text-xs">
              ⏱️ {protocol.duration}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block mb-0.5">
              Core Clinical Mandate
            </span>
            <span className="font-bold text-emerald-300 text-xs">
              🎯 {protocol.coreMandate}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alert / Warning Callout if present */}
      {protocol.alertBox && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 mb-6 shadow-xs flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-black text-rose-900 text-xs uppercase tracking-wider mb-1">
              Critical Switch Precaution
            </h3>
            <p className="text-xs text-rose-950 font-medium leading-relaxed">
              {protocol.alertBox}
            </p>
          </div>
        </div>
      )}

      {/* Clinical Rationale */}
      {protocol.rationale && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🔬</span>
            <span>Clinical Neurobiological Rationale</span>
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed font-medium">
            {protocol.rationale}
          </p>
        </div>
      )}

      {/* Pharmacokinetic Profile */}
      {protocol.kinetics && protocol.kinetics.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Pharmacokinetic Considerations & Elimination Kinetics</span>
          </h2>
          <div className="space-y-2">
            {protocol.kinetics.map((k, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-gray-50 rounded-xl p-2.5">
                <span className="text-purple-600 font-bold">•</span>
                <span className="font-medium">{k}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Phase Execution Timeline */}
      {protocol.phases && protocol.phases.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📅</span>
            <span>Structured 4-Phase Execution Schedule</span>
          </h2>

          <div className="relative border-l-2 border-purple-200 ml-4 pl-6 space-y-6">
            {protocol.phases.map((ph, idx) => (
              <div key={idx} className="relative group">
                {/* Stepper Bullet */}
                <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                  {idx + 1}
                </div>

                <div className="bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-4 border border-purple-100 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-purple-900 uppercase tracking-wide">
                      {ph.phase || `PHASE ${idx + 1}`}
                    </span>
                    {ph.timing && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200 shadow-xs">
                        {ph.timing}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 mb-2 leading-snug">
                    {ph.title}
                  </h3>

                  {ph.notes && (
                    <p className="text-xs text-gray-600 leading-relaxed bg-white rounded-xl p-3 border border-purple-100/60">
                      {ph.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receptor Shift Dynamics Table */}
      {protocol.receptorShiftDynamics && protocol.receptorShiftDynamics.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🧬</span>
            <span>Receptor Shift Dynamics & Vulnerability Windows</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Pharmacodynamic differential as drug concentrations cross during the transition timeline:
          </p>

          <div className="space-y-3">
            {protocol.receptorShiftDynamics.map((item, i) => {
              const riskInfo = getRiskColor(item.riskLevel)
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-extrabold text-sm text-gray-900">
                      {item.receptor}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
                      {item.riskLevel}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-purple-700 mb-1">
                    Transition Shift: {item.shift}
                  </div>

                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Clinical Impact:</span> {item.hazard}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Adverse Risk Stratification Meters */}
      {protocol.riskMeters && protocol.riskMeters.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Adverse Risk Stratification Meters</span>
          </h2>

          <div className="space-y-4">
            {protocol.riskMeters.map((rm, i) => {
              const riskInfo = getRiskColor(rm.severity)
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-800">
                      {rm.domain}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
                      {rm.severity}
                    </span>
                  </div>

                  {/* Progress Bar Meter */}
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${riskInfo.bar}`} style={{ width: riskInfo.width }} />
                  </div>

                  {rm.notes && (
                    <p className="text-[11px] text-gray-600">
                      {rm.notes}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Emergency Rescue Actions */}
      {protocol.emergencyRescue && protocol.emergencyRescue.length > 0 && (
        <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              🚨
            </span>
            <div>
              <h2 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                Emergency Rescue & Toxicity Intervention Guidelines
              </h2>
              <p className="text-[11px] text-rose-800">
                Protocols for acute breakthrough symptoms, destabilization, or severe adverse events
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {protocol.emergencyRescue.map((rescue, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-rose-100 text-xs text-gray-800 shadow-2xs leading-relaxed">
                <span className="font-bold text-rose-700 mr-1.5">⚡</span>
                {rescue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Practice Pearls */}
      {protocol.clinicalPearls && protocol.clinicalPearls.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>High-Yield Clinical Practice Pearls</span>
          </h2>
          <div className="space-y-2.5">
            {protocol.clinicalPearls.map((pearl, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 bg-purple-50/40 rounded-xl p-3 border border-purple-100/50">
                <span className="text-purple-600 font-extrabold text-sm">✓</span>
                <span className="leading-relaxed font-medium">{pearl}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="text-center pt-4 pb-8">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          ← Return to All 20 Protocols
        </button>
      </div>
    </div>
  )
}
