import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import Toast from '../components/Toast'
import PatientHandoutModal from '../components/PatientHandoutModal'
import { isFavorite, toggleFavorite } from '../utils/favorites'

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
  const [fromDrugFilter, setFromDrugFilter] = useState('')
  const [toDrugFilter, setToDrugFilter] = useState('')

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
    const fromQ = fromDrugFilter.trim().toLowerCase()
    const toQ = toDrugFilter.trim().toLowerCase()

    return protocols.filter(p => {
      if (selectedSwitchType !== 'ALL' && p.switchType !== selectedSwitchType) {
        return false
      }

      if (fromQ) {
        const titleMatch = p.transitionTitle && p.transitionTitle.toLowerCase().includes(fromQ)
        const nameMatch = p.title.toLowerCase().includes(fromQ)
        if (!titleMatch && !nameMatch) return false
      }

      if (toQ) {
        const titleMatch = p.transitionTitle && p.transitionTitle.toLowerCase().includes(toQ)
        const nameMatch = p.title.toLowerCase().includes(toQ)
        if (!titleMatch && !nameMatch) return false
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
  }, [protocols, searchQuery, selectedSwitchType, fromDrugFilter, toDrugFilter])

  // If a protocol is selected, render the full authoritative protocol view
  if (activeProtocol) {
    return <ProtocolDetailView protocol={activeProtocol} onBack={() => navigate('/cross-titration')} />
  }

  // Otherwise render the Master Protocol Catalog
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <BackButton />

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold mb-2">
          <span>🔄</span>
          <span>Module 12: Cross-Titration & Deprescribing Master Tool</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Transition & Deprescribing Protocols
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
          20 evidence-based switch algorithms with 4-phase timelines, receptor shift dynamics, risk stratification meters, and emergency rescue guides.
        </p>
      </div>

      {/* Quick Direct Switch Finder Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700/90 rounded-3xl p-5 mb-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🎯</span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Direct Switch Protocol Matcher
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase block mb-1.5">
              Switching From (Current Drug):
            </label>
            <input
              type="text"
              value={fromDrugFilter}
              onChange={e => setFromDrugFilter(e.target.value)}
              placeholder="e.g. Sertraline, Paroxetine, Olanzapine, BZD..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase block mb-1.5">
              Switching To (Target Drug):
            </label>
            <input
              type="text"
              value={toDrugFilter}
              onChange={e => setToDrugFilter(e.target.value)}
              placeholder="e.g. Venlafaxine, Aripiprazole, Clozapine..."
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            />
          </div>
        </div>
        {(fromDrugFilter || toDrugFilter) && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              Matched {filteredProtocols.length} protocol{filteredProtocols.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setFromDrugFilter('')
                setToDrugFilter('')
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold underline text-xs"
            >
              Clear Matcher
            </button>
          </div>
        )}
      </div>

      {/* Global Search Input */}
      <div className="relative mb-4">
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-4 top-4 pointer-events-none"
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
          placeholder="Filter by keyword (e.g. Ashton, MAOI, UGT, Clozapine, Akathisia)..."
          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl pl-12 pr-10 py-3.5 text-base font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              {st === 'ALL' ? `All Protocols (${protocols.length})` : st}
            </button>
          )
        })}
      </div>

      {/* Protocol Cards List */}
      {filteredProtocols.length > 0 ? (
        <div className="space-y-3">
          {filteredProtocols.map(proto => (
            <div
              key={proto.id}
              onClick={() => navigate(`/cross-titration/${proto.id}`)}
              className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200/90 dark:border-gray-700/90 shadow-xs hover:shadow-md hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    #{proto.number < 10 ? `0${proto.number}` : proto.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {proto.title}
                    </h3>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
                      {proto.transitionTitle}
                    </p>
                  </div>
                </div>

                <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-xl flex-shrink-0">
                  →
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {proto.classTransition}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                {proto.switchType && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                    {proto.switchType}
                  </span>
                )}
                {proto.duration && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                    ⏱️ {proto.duration}
                  </span>
                )}
                {proto.coreMandate && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 italic ml-auto truncate max-w-xs">
                    Mandate: {proto.coreMandate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xs">
          <p className="text-base font-bold text-gray-800 dark:text-white mb-1">No transition protocols found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try clearing your switch matcher inputs or adjusting search keywords.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFromDrugFilter('')
              setToDrugFilter('')
              setSelectedSwitchType('ALL')
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

function ProtocolDetailView({ protocol, onBack }) {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const [activePhaseIndex, setActivePhaseIndex] = useState(null) // null = all
  const [starred, setStarred] = useState(isFavorite('protocol', protocol.id))
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Start Date for Patient Schedule Calculator (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(todayStr)

  // Date calculation helper
  const calculatePhaseDates = (phaseIdx) => {
    try {
      const start = new Date(startDate + 'T00:00:00')
      let dayOffsetStart = 0
      let dayOffsetEnd = 6

      if (phaseIdx === 0) {
        dayOffsetStart = 0
        dayOffsetEnd = 6
      } else if (phaseIdx === 1) {
        dayOffsetStart = 7
        dayOffsetEnd = 13
      } else if (phaseIdx === 2) {
        dayOffsetStart = 14
        dayOffsetEnd = 20
      } else {
        dayOffsetStart = 21
        dayOffsetEnd = 27
      }

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

  // Pre-calculate phases with calendar date strings for modal
  const phasesWithDates = useMemo(() => {
    return (protocol.phases || []).map((ph, idx) => ({
      ...ph,
      calculatedDates: calculatePhaseDates(idx)
    }))
  }, [protocol.phases, startDate])

  // Copy switch protocol with dates to clipboard
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

  // Copy structured EHR Progress Note
  const handleCopyEhrNote = () => {
    const lines = [
      `=== MEDICATION CROSS-TITRATION / TRANSITION NOTE ===`,
      `Protocol: #${protocol.number} - ${protocol.title}`,
      `Transition: ${protocol.transitionTitle} (${protocol.switchType})`,
      `Target Duration: ${protocol.duration} | Initiation Date: ${startDate}`,
      `Core Mandate: ${protocol.coreMandate}`,
      '',
      `CLINICAL NEUROBIOLOGICAL RATIONALE:`,
      protocol.rationale || 'Cross-titration indicated per clinical psychopharmacology assessment.',
      '',
      `SCHEDULED PHASES & DOSING:`,
      ...(protocol.phases || []).map((ph, idx) =>
        `• Phase ${idx + 1} (${calculatePhaseDates(idx)}): ${ph.title} — ${ph.notes || ''}`
      ),
      '',
      protocol.alertBox ? `CRITICAL PRECAUTION: ${protocol.alertBox}` : '',
      protocol.emergencyRescue ? `EMERGENCY RESCUE INTERVENTION: ${protocol.emergencyRescue}` : '',
      '',
      `COUNSELING & MONITORING: Patient and caregiver counseled on scheduled stepped titration, potential discontinuation/rebound vs shift symptoms, and emergency red flags. Calendar-stamped patient handout provided in writing.`,
      `====================================================`,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(lines).then(() => {
      setToastMessage('EHR Clinical Progress Note copied to clipboard!')
    }).catch(() => {
      setToastMessage('Failed to copy to clipboard')
    })
  }

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
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Back Button & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors py-1.5 px-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>All 20 Protocols</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              const isNow = toggleFavorite('protocol', protocol.id)
              setStarred(isNow)
              setToastMessage(isNow ? `Protocol #${protocol.number} saved to Favorites!` : `Protocol #${protocol.number} removed from favorites`)
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              starred
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
            }`}
            title={starred ? 'Starred in Favorites' : 'Add to Favorites'}
          >
            <span>{starred ? '★' : '☆'}</span>
            <span>{starred ? 'Starred' : 'Star'}</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 shadow-2xs"
            title="Generate printable patient handout with calendar instructions"
          >
            <span>🖨️</span>
            <span>Patient Handout</span>
          </button>

          <button
            onClick={handleCopyEhrNote}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 shadow-2xs"
            title="Copy structured clinical note for EHR documentation"
          >
            <span>📋</span>
            <span>Copy EHR Note</span>
          </button>

          <button
            onClick={handleCopyProtocol}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all border border-gray-200 dark:border-gray-700"
            title="Copy raw schedule to clipboard"
          >
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Protocol Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold border border-gray-200 dark:border-gray-600">
            Protocol #{protocol.number < 10 ? `0${protocol.number}` : protocol.number}
          </span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Module 12 Compendium Reference
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1.5">
          {protocol.title}
        </h1>

        <p className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
          {protocol.transitionTitle}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {protocol.classTransition}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs">
          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider block mb-0.5">
              Switch Paradigm
            </span>
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
              {protocol.switchType}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider block mb-0.5">
              Standard Duration
            </span>
            <span className="font-bold text-amber-800 dark:text-amber-300 text-sm sm:text-base">
              ⏱️ {protocol.duration}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800">
            <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider block mb-0.5">
              Core Clinical Mandate
            </span>
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
              🎯 {protocol.coreMandate}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alert / Warning Callout if present */}
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

      {/* Patient Transition Schedule Date Picker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>🗓️</span>
            <span>Patient Transition Schedule Calculator</span>
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Select patient start date to generate exact calendar dates for each phase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Clinical Rationale */}
      {protocol.rationale && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🔬</span>
            <span>Clinical Neurobiological Rationale</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
            {protocol.rationale}
          </p>
        </div>
      )}

      {/* Pharmacokinetic Profile */}
      {protocol.kinetics && protocol.kinetics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>⏱️</span>
            <span>Pharmacokinetic Considerations & Elimination Kinetics</span>
          </h2>
          <div className="space-y-2">
            {protocol.kinetics.map((k, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 dark:text-gray-500 font-bold">•</span>
                <span className="font-medium leading-relaxed">{k}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Phase Execution Timeline with Interactive Tabs & Calculated Dates */}
      {protocol.phases && protocol.phases.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span>📅</span>
              <span>Structured 4-Phase Execution Schedule</span>
            </h2>

            <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActivePhaseIndex(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePhaseIndex === null ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                All
              </button>
              {protocol.phases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activePhaseIndex === idx ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Phase {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 pl-6 space-y-6">
            {protocol.phases
              .filter((_, idx) => activePhaseIndex === null || activePhaseIndex === idx)
              .map((ph, idx) => {
                const actualIndex = activePhaseIndex !== null ? activePhaseIndex : idx
                const calculatedDateRange = calculatePhaseDates(actualIndex)
                return (
                  <div key={actualIndex} className="relative group">
                    {/* Stepper Bullet */}
                    <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                      {actualIndex + 1}
                    </div>

                    <div className="bg-gray-50/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-gray-700/80 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {ph.phase || `PHASE ${actualIndex + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {calculatedDateRange && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                              🗓️ {calculatedDateRange}
                            </span>
                          )}
                          {ph.timing && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-xs">
                              {ph.timing}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 leading-snug">
                        {ph.title}
                      </h3>

                      {ph.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed bg-white dark:bg-gray-900/80 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700 font-normal">
                          {ph.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Receptor Shift Dynamics Table */}
      {protocol.receptorShiftDynamics && protocol.receptorShiftDynamics.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🧬</span>
            <span>Receptor Shift Dynamics & Vulnerability Windows</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Pharmacodynamic differential as drug concentrations cross during the transition timeline:
          </p>

          <div className="space-y-3">
            {protocol.receptorShiftDynamics.map((item, i) => {
              const riskInfo = getRiskColor(item.riskLevel)
              return (
                <div key={i} className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/80">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-extrabold text-base text-gray-900 dark:text-white">
                      {item.receptor}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
                      {item.riskLevel}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Transition Shift: {item.shift}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Clinical Impact:</span> {item.hazard}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Adverse Risk Stratification Meters */}
      {protocol.riskMeters && protocol.riskMeters.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>Adverse Risk Stratification Meters</span>
          </h2>

          <div className="space-y-4">
            {protocol.riskMeters.map((rm, i) => {
              const riskInfo = getRiskColor(rm.severity)
              return (
                <div key={i} className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {rm.domain}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
                      {rm.severity}
                    </span>
                  </div>

                  {/* Progress Bar Meter */}
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${riskInfo.bar}`} style={{ width: riskInfo.width }} />
                  </div>

                  {rm.notes && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
        <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-3xl p-5 sm:p-6 border border-rose-200 dark:border-rose-900/50 shadow-xs mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              🚨
            </span>
            <div>
              <h2 className="text-xs font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider">
                Emergency Rescue & Toxicity Intervention Guidelines
              </h2>
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Protocols for acute breakthrough symptoms, destabilization, or severe adverse events
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {protocol.emergencyRescue.map((rescue, i) => (
              <div key={i} className="bg-white dark:bg-gray-900/80 rounded-xl p-3.5 border border-rose-100 dark:border-rose-900/40 text-sm text-gray-800 dark:text-gray-200 shadow-2xs leading-relaxed font-medium">
                <span className="font-bold text-rose-700 dark:text-rose-400 mr-1.5">⚡</span>
                {rescue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Practice Pearls */}
      {protocol.clinicalPearls && protocol.clinicalPearls.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-6 border border-gray-200/90 dark:border-gray-700/90 shadow-xs mb-6">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>High-Yield Clinical Practice Pearls</span>
          </h2>
          <div className="space-y-2.5">
            {protocol.clinicalPearls.map((pearl, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3.5 border border-gray-200/80 dark:border-gray-700/80">
                <span className="text-gray-500 dark:text-gray-400 font-extrabold text-sm">✓</span>
                <span className="leading-relaxed font-normal">{pearl}</span>
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

      {/* Printable Patient Handout Modal */}
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
