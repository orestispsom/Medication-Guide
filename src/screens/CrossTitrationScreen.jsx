import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import Toast from '../components/Toast'
import PatientHandoutModal from '../components/PatientHandoutModal'
import DrugFamilySelect from '../components/DrugFamilySelect'
import { isFavorite, toggleFavorite } from '../utils/favorites'
import {
  getGroupedDrugs,
  generateSwitchProtocol,
  generateDeprescribingProtocol
} from '../utils/transitionEngine'

export default function CrossTitrationScreen() {
  const { protocolId } = useParams()
  const navigate = useNavigate()

  const protocols = data.protocols || []
  const groupedDrugs = useMemo(() => getGroupedDrugs(), [])

  // Active protocol if protocolId is provided via URL
  const activeProtocol = useMemo(() => {
    if (!protocolId) return null
    return protocols.find(p => p.id === protocolId) || null
  }, [protocolId, protocols])

  // Function 1: Switch Protocol State
  const [switchFromDrug, setSwitchFromDrug] = useState(null)
  const [switchToDrug, setSwitchToDrug] = useState(null)
  const [switchPace, setSwitchPace] = useState('mid') // 'slow' | 'mid' | 'fast'

  // Function 2: Deprescribing Protocol State
  const [deprescribeDrug, setDeprescribeDrug] = useState(null)
  const [deprescribePace, setDeprescribePace] = useState('mid') // 'slow' | 'mid' | 'fast'

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('')

  // Dynamically compute switch protocol answer
  const switchResult = useMemo(() => {
    if (!switchFromDrug || !switchToDrug) return null
    return generateSwitchProtocol(switchFromDrug, switchToDrug, switchPace)
  }, [switchFromDrug, switchToDrug, switchPace])

  // Dynamically compute deprescribing protocol answer
  const deprescribeResult = useMemo(() => {
    if (!deprescribeDrug) return null
    return generateDeprescribingProtocol(deprescribeDrug, deprescribePace)
  }, [deprescribeDrug, deprescribePace])

  // Copy EHR note for Switch Protocol
  const handleCopySwitchEhrNote = () => {
    if (!switchResult) return
    const lines = [
      `=== MEDICATION CROSS-TITRATION NOTE ===`,
      `Transition: ${switchResult.title}`,
      `Strategy: ${switchResult.switchType}`,
      `Pace: ${switchResult.pace.toUpperCase()} · Target Duration: ${switchResult.duration}`,
      `Core Mandate: ${switchResult.coreMandate || ''}`,
      '',
      switchResult.precaution ? `CRITICAL PRECAUTION: ${switchResult.precaution}\n` : '',
      'SCHEDULED PHASES:',
      ...(switchResult.phases || []).map(ph => `• [${ph.timing}] ${ph.title}: ${ph.notes || ''}`),
      '',
      'RECEPTOR DYNAMICS & VULNERABILITY:',
      ...(switchResult.receptorDynamics || []).map(rd => `• ${rd.receptor}: ${rd.shift} — ${rd.hazard}`),
      '',
      'CLINICAL RESCUE / PEARLS:',
      ...(switchResult.rescuePearls || []).map(rp => `• ${rp}`),
      '======================================='
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('Switch protocol EHR note copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

  // Copy EHR note for Deprescribing Protocol
  const handleCopyDeprescribeEhrNote = () => {
    if (!deprescribeResult) return
    const lines = [
      `=== MEDICATION DEPRESCRIBING & TAPER NOTE ===`,
      `Medication: ${deprescribeResult.drugName} (${deprescribeResult.subgroup || 'Psychotropic'})`,
      `Strategy: ${deprescribeResult.strategy}`,
      `Pace: ${deprescribeResult.pace.toUpperCase()} · Target Duration: ${deprescribeResult.duration}`,
      `Core Mandate: ${deprescribeResult.coreMandate || ''}`,
      '',
      deprescribeResult.precaution ? `CRITICAL PRECAUTION: ${deprescribeResult.precaution}\n` : '',
      `HYPERBOLIC PRINCIPLE: ${deprescribeResult.hyperbolicPrinciple || ''}`,
      '',
      'STEPPED TAPER SCHEDULE:',
      ...(deprescribeResult.phases || []).map(ph => `• [${ph.timing}] ${ph.phase} (${ph.targetDoseLevel}): ${ph.instructions}`),
      '',
      'WITHDRAWAL RISKS TO MONITOR:',
      ...(deprescribeResult.withdrawalRisks || []).map(wr => `• ${wr}`),
      '',
      'CLINICAL PEARLS & RESCUE:',
      ...(deprescribeResult.rescuePearls || []).map(rp => `• ${rp}`),
      '============================================'
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('Deprescribing protocol EHR note copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

  // If a specific protocolId is in the URL, render the full authoritative protocol view
  if (activeProtocol) {
    return <ProtocolDetailView protocol={activeProtocol} onBack={() => navigate('/cross-titration')} />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Simplified Header - subtitle removed */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Transition & Deprescribing Protocols
        </h1>
      </div>

      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* FUNCTION 1: SWITCH PROTOCOL (Direct Switch Protocol Matcher)        */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Switch Protocol
              </h2>
            </div>

            {(switchFromDrug || switchToDrug) && (
              <button
                onClick={() => {
                  setSwitchFromDrug(null)
                  setSwitchToDrug(null)
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Reset Switch
              </button>
            )}
          </div>

          {/* Two Drug Selectors Grouped by Family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <DrugFamilySelect
              label="Switching From (Current Drug):"
              selectedDrug={switchFromDrug}
              onSelect={setSwitchFromDrug}
              placeholder="Select current medication..."
              groupedFamilies={groupedDrugs}
            />

            <DrugFamilySelect
              label="Switching To (Target Drug):"
              selectedDrug={switchToDrug}
              onSelect={setSwitchToDrug}
              placeholder="Select target medication..."
              groupedFamilies={groupedDrugs}
            />
          </div>

          {/* Prompt when incomplete */}
          {(!switchFromDrug || !switchToDrug) && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-1">
              Select both current and target medications to generate the cross-titration protocol.
            </p>
          )}

          {/* Answer Dropdown / Panel Unfolds Underneath */}
          {switchResult && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
              {switchResult.sameDrug ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-medium text-center">
                  {switchResult.mandate}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Protocol Summary Header & Pace Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0b0f19] p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {switchResult.title}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                          {switchResult.switchType}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        ⏱️ Duration: {switchResult.duration}
                      </span>
                    </div>

                    {/* Pace Toggle: Slow / Mid / Fast */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSwitchPace('slow')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          switchPace === 'slow'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Conservative / High-Risk / Sensitive Taper"
                      >
                        🐢 Slow
                      </button>
                      <button
                        type="button"
                        onClick={() => setSwitchPace('mid')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          switchPace === 'mid'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Standard Clinical Guideline Pace"
                      >
                        ⚖️ Mid
                      </button>
                      <button
                        type="button"
                        onClick={() => setSwitchPace('fast')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          switchPace === 'fast'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="Rapid / Inpatient / Acute Switch"
                      >
                        ⚡ Fast
                      </button>
                    </div>
                  </div>

                  {/* Precaution / Red Flag Alert */}
                  {switchResult.precaution && (
                    <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                      <span className="text-base flex-shrink-0">⚠️</span>
                      <div>
                        <span className="font-bold block mb-0.5 text-rose-950 dark:text-rose-100 uppercase tracking-wide text-[10px]">
                          Clinical Precaution
                        </span>
                        {switchResult.precaution}
                      </div>
                    </div>
                  )}

                  {/* Core Mandate */}
                  {switchResult.coreMandate && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl p-3.5 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 mr-1.5 uppercase tracking-wide text-[10px] block mb-1">
                        🎯 Core Mandate:
                      </span>
                      {switchResult.coreMandate}
                    </div>
                  )}

                  {/* Phased Execution Timeline */}
                  {switchResult.phases && switchResult.phases.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        📅 Phased Execution Schedule:
                      </span>
                      <div className="space-y-2">
                        {switchResult.phases.map((ph, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-[10px] flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {ph.title}
                                </span>
                                {ph.notes && (
                                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                                    {ph.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap bg-white dark:bg-[#111827] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-[10px] self-start sm:self-auto">
                              {ph.timing}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Receptor Shift & Discontinuation Dynamics */}
                  {switchResult.receptorDynamics && switchResult.receptorDynamics.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        🧬 Receptor Dynamics & Vulnerability Windows:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {switchResult.receptorDynamics.map((rd, i) => (
                          <div
                            key={i}
                            className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-2.5 border border-slate-200/60 dark:border-slate-800/60 text-xs"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {rd.receptor}
                              </span>
                              {rd.riskLevel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                  {rd.riskLevel}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {rd.hazard}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Rescue / Clinical Pearls */}
                  {switchResult.rescuePearls && switchResult.rescuePearls.length > 0 && (
                    <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                        💡 Clinical Rescue & Pearls:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {switchResult.rescuePearls.slice(0, 3).map((pearl, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span className="text-[11px] leading-relaxed">{pearl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCopySwitchEhrNote}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📋</span>
                      <span>Copy EHR Note</span>
                    </button>

                    {switchResult.isCompendium && switchResult.compendiumId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/cross-titration/${switchResult.compendiumId}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs hover:opacity-90 cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <span>View Compendium Protocol #{switchResult.number} →</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* FUNCTION 2: DEPRESCRIBING PROTOCOL                                  */}
        {/* ==================================================================== */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📉</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Deprescribing Protocol
              </h2>
            </div>

            {deprescribeDrug && (
              <button
                onClick={() => setDeprescribeDrug(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Reset Deprescribing
              </button>
            )}
          </div>

          {/* Single Drug Selector Grouped by Family */}
          <div className="mb-4">
            <DrugFamilySelect
              label="Medication to Deprescribe:"
              selectedDrug={deprescribeDrug}
              onSelect={setDeprescribeDrug}
              placeholder="Select medication to taper / discontinue..."
              groupedFamilies={groupedDrugs}
            />
          </div>

          {/* Prompt when incomplete */}
          {!deprescribeDrug && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-1">
              Select a medication above to generate its tailored hyperbolic deprescribing and taper protocol.
            </p>
          )}

          {/* Answer Dropdown / Panel Unfolds Underneath */}
          {deprescribeResult && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200 space-y-4">
              {/* Header & Pace Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0b0f19] p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {deprescribeResult.drugName} Deprescribing
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      {deprescribeResult.strategy}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    ⏱️ Target Timeline: {deprescribeResult.duration}
                  </span>
                </div>

                {/* Pace Toggle: Slow / Mid / Fast */}
                <div className="flex items-center gap-1 bg-white dark:bg-[#111827] p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDeprescribePace('slow')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deprescribePace === 'slow'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Extended / Hyperbolic / Ashton Paradigm"
                  >
                    🐢 Slow
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeprescribePace('mid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deprescribePace === 'mid'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Standard Evidence-Based Guideline"
                  >
                    ⚖️ Mid
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeprescribePace('fast')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      deprescribePace === 'fast'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Rapid / Inpatient / Toxicity-Driven"
                  >
                    ⚡ Fast
                  </button>
                </div>
              </div>

              {/* Precaution Warning */}
              {deprescribeResult.precaution && (
                <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <div>
                    <span className="font-bold block mb-0.5 text-rose-950 dark:text-rose-100 uppercase tracking-wide text-[10px]">
                      Withdrawal Precaution
                    </span>
                    {deprescribeResult.precaution}
                  </div>
                </div>
              )}

              {/* Hyperbolic Rationale */}
              {deprescribeResult.hyperbolicPrinciple && (
                <div className="bg-slate-50 dark:bg-[#0b0f19] p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-[10px] block mb-1">
                    🔬 Hyperbolic Biological Taper Principle:
                  </span>
                  {deprescribeResult.hyperbolicPrinciple}
                </div>
              )}

              {/* Stepped Taper Phases */}
              {deprescribeResult.phases && deprescribeResult.phases.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    📅 Stepped De-escalation Schedule:
                  </span>
                  <div className="space-y-2">
                    {deprescribeResult.phases.map((ph, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {ph.phase} — {ph.targetDoseLevel}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                              {ph.instructions}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap bg-white dark:bg-[#111827] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80 text-[10px] self-start sm:self-auto">
                          {ph.timing}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Withdrawal Risks to Monitor */}
              {deprescribeResult.withdrawalRisks && deprescribeResult.withdrawalRisks.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    🛡️ Discontinuation Vulnerabilities to Monitor:
                  </span>
                  <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {deprescribeResult.withdrawalRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span className="text-[11px] leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tapering Pearls & Rescue */}
              {deprescribeResult.rescuePearls && deprescribeResult.rescuePearls.length > 0 && (
                <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/70 dark:border-slate-800/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    💡 Clinician Tapering Pearls & Rescue Strategies:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {deprescribeResult.rescuePearls.map((pearl, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span className="text-[11px] leading-relaxed">{pearl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyDeprescribeEhrNote}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📋</span>
                  <span>Copy EHR Deprescribing Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProtocolDetailView({ protocol, onBack }) {
  const [toastMessage, setToastMessage] = useState('')
  const [activePhaseIndex, setActivePhaseIndex] = useState(null)
  const [starred, setStarred] = useState(isFavorite('protocol', protocol.id))
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(todayStr)

  const calculatePhaseDates = (phaseIdx) => {
    try {
      const start = new Date(startDate + 'T00:00:00')
      let dayOffsetStart = phaseIdx * 7
      let dayOffsetEnd = phaseIdx * 7 + 6

      const dStart = new Date(start)
      dStart.setDate(dStart.getDate() + dayOffsetStart)

      const dEnd = new Date(start)
      dEnd.setDate(dEnd.getDate() + dayOffsetEnd)

      const opt = { month: 'short', day: 'numeric', weekday: 'short' }
      return `${dStart.toLocaleDateString(undefined, opt)} – ${dEnd.toLocaleDateString(undefined, opt)}`
    } catch {
      return ''
    }
  }

  const phasesWithDates = useMemo(() => {
    return (protocol.phases || []).map((ph, idx) => ({
      ...ph,
      calculatedDates: calculatePhaseDates(idx)
    }))
  }, [protocol.phases, startDate])

  const handleCopyProtocol = () => {
    const lines = [
      `=== MODULE 12: PROTOCOL #${protocol.number} - ${protocol.title.toUpperCase()} ===`,
      `Transition: ${protocol.transitionTitle}`,
      `Switch Paradigm: ${protocol.switchType} · Duration: ${protocol.duration}`,
      `Core Mandate: ${protocol.coreMandate}`,
      `Patient Start Date: ${startDate}`,
      '',
      `CLINICAL RATIONALE:`,
      protocol.rationale || '',
      '',
      'EXECUTION PHASES & DATES:',
      ...(protocol.phases || []).map((ph, idx) =>
        `[Phase ${idx + 1}: ${calculatePhaseDates(idx)}] ${ph.title} - ${ph.notes || ''}`
      ),
      '',
      protocol.alertBox ? `CRITICAL PRECAUTION: ${protocol.alertBox}` : '',
      '========================================================================'
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('Date-stamped patient schedule copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

  const handleCopyEhrNote = () => {
    const lines = [
      `=== MEDICATION CROSS-TITRATION / TRANSITION NOTE ===`,
      `Protocol: #${protocol.number} - ${protocol.title}`,
      `Transition: ${protocol.transitionTitle} (${protocol.switchType})`,
      `Target Duration: ${protocol.duration} | Initiation Date: ${startDate}`,
      `Core Mandate: ${protocol.coreMandate}`,
      '',
      `CLINICAL NEUROBIOLOGICAL RATIONALE:`,
      protocol.rationale || 'Cross-titration indicated per clinical assessment.',
      '',
      `SCHEDULED PHASES & DOSING:`,
      ...(protocol.phases || []).map((ph, idx) =>
        `• Phase ${idx + 1} (${calculatePhaseDates(idx)}): ${ph.title} — ${ph.notes || ''}`
      ),
      '',
      protocol.alertBox ? `CRITICAL PRECAUTION: ${protocol.alertBox}` : '',
      protocol.emergencyRescue ? `EMERGENCY RESCUE INTERVENTION: ${Array.isArray(protocol.emergencyRescue) ? protocol.emergencyRescue.join('; ') : protocol.emergencyRescue}` : '',
      '',
      `COUNSELING & MONITORING: Patient counseled on scheduled stepped titration and red flags.`,
      `====================================================`,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('EHR Clinical Progress Note copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

  const getRiskColor = (severity) => {
    const s = (severity || '').toUpperCase()
    if (s.includes('SEVERE') || s.includes('VERY HIGH')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500', width: '90%' }
    if (s.includes('HIGH')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', width: '75%' }
    if (s.includes('MODERATE')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', width: '50%' }
    if (s.includes('LOW')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', width: '25%' }
    return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', bar: 'bg-slate-400', width: '15%' }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Back Button & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Return to Protocols</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              const isNow = toggleFavorite('protocol', protocol.id)
              setStarred(isNow)
              setToastMessage(isNow ? `Protocol #${protocol.number} saved to Favorites!` : `Protocol #${protocol.number} removed from favorites`)
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              starred
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800/90 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <span>{starred ? '★' : '☆'}</span>
            <span>{starred ? 'Starred' : 'Star'}</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            <span>🖨️</span>
            <span>Patient Handout</span>
          </button>

          <button
            onClick={handleCopyEhrNote}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            <span>📋</span>
            <span>Copy EHR Note</span>
          </button>

          <button
            onClick={handleCopyProtocol}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Protocol Header Card */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700">
            Protocol #{protocol.number < 10 ? `0${protocol.number}` : protocol.number}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Module 12 Compendium Reference
          </span>
        </div>

        <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
          {protocol.title}
        </h1>

        <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">
          {protocol.transitionTitle}
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {protocol.classTransition}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">
              Switch Paradigm
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {protocol.switchType}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">
              Standard Duration
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
              ⏱️ {protocol.duration}
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-0.5">
              Core Clinical Mandate
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              🎯 {protocol.coreMandate}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Precaution Alert */}
      {protocol.alertBox && (
        <div className="bg-red-50/80 dark:bg-red-950/40 border-2 border-red-500/80 dark:border-red-800 rounded-2xl p-4 mb-6 shadow-xs flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-300 text-xs uppercase tracking-wider mb-1">
              Critical Switch Precaution
            </h3>
            <p className="text-sm text-red-950 dark:text-red-200 font-medium leading-relaxed">
              {protocol.alertBox}
            </p>
          </div>
        </div>
      )}

      {/* Date Picker for Schedule Calculator */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/90 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>🗓️</span>
            <span>Patient Transition Schedule Calculator</span>
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select patient start date to generate exact calendar dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 4-Phase Execution Schedule */}
      {protocol.phases && protocol.phases.length > 0 && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/90 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>📅</span>
              <span>4-Phase Execution Schedule</span>
            </h2>

            <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActivePhaseIndex(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePhaseIndex === null ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                All
              </button>
              {protocol.phases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activePhaseIndex === idx ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Phase {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {protocol.phases
              .filter((_, idx) => activePhaseIndex === null || activePhaseIndex === idx)
              .map((ph, idx) => {
                const actualIndex = activePhaseIndex !== null ? activePhaseIndex : idx
                const calculatedDateRange = calculatePhaseDates(actualIndex)
                return (
                  <div key={actualIndex} className="bg-slate-50 dark:bg-[#0b0f19] rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Phase {actualIndex + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {calculatedDateRange && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            🗓️ {calculatedDateRange}
                          </span>
                        )}
                        {ph.timing && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {ph.timing}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {ph.title}
                    </h3>
                    {ph.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ph.notes}
                      </p>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Emergency Rescue Guidelines */}
      {protocol.emergencyRescue && (
        <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/50 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚨</span>
            <h3 className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider">
              Emergency Rescue & Discontinuation Management
            </h3>
          </div>
          <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
            {Array.isArray(protocol.emergencyRescue) ? (
              protocol.emergencyRescue.map((rescue, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{rescue}</span>
                </div>
              ))
            ) : (
              <p>{protocol.emergencyRescue}</p>
            )}
          </div>
        </div>
      )}

      {/* Printable Handout Modal */}
      <PatientHandoutModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={protocol.title}
        transitionTitle={protocol.transitionTitle}
        startDate={startDate}
        duration={protocol.duration}
        phases={phasesWithDates}
        warnings={protocol.alertBox}
        emergency={Array.isArray(protocol.emergencyRescue) ? protocol.emergencyRescue.join(' ') : protocol.emergencyRescue}
      />
    </div>
  )
}
