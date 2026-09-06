import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import data from '../data.json'
import Toast from '../components/Toast'
import { useTheme } from '../context/ThemeContext'

const CLINICAL_TOOLS = [
  { id: 'cpz', label: 'CPZ Equivalency', icon: '🎭', desc: 'Chlorpromazine dose converter' },
  { id: 'lithium', label: 'Lithium TDM', icon: '🧪', desc: '12h trough & Cockcroft-Gault' },
  { id: 'clozapine', label: 'Clozapine REMS', icon: '🩸', desc: 'ANC monitoring & neutropenia triage' },
  { id: 'cyp', label: 'CYP450 Checker', icon: '⚡', desc: 'Multi-drug metabolic collisions' },
  { id: 'qtc', label: 'QTc Stacker', icon: '❤️', desc: 'Cardiac repolarization risk' },
  { id: 'bzd', label: 'BZD / Ashton', icon: '⚖️', desc: 'Diazepam eq & taper schedules' },
  { id: 'metabolic', label: 'Metabolic Tracker', icon: '📊', desc: 'SGA glucose & lipid protocols' },
  { id: 'emergency', label: 'Emergency Playbook', icon: '🚨', desc: 'NMS, SS, Catatonia, Anticholinergic' },
  { id: 'renal', label: 'Organ Adjuster', icon: '🩺', desc: 'Hepatic & renal CrCl clearance' },
]

export default function ClinicalToolsScreen() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'cpz'
  const initialDrug = searchParams.get('drug') || ''

  const [activeTab, setActiveTab] = useState(initialTab)
  const [toastMessage, setToastMessage] = useState('')
  const [showAllTools, setShowAllTools] = useState(false)
  const scrollContainerRef = useRef(null)

  // Sync tab with URL if user clicks
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  // Scroll active tab into view when activeTab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [activeTab])

  // Horizontal scroll buttons
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      {/* Top Bar with Home Button and Theme Switch */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400 transition-colors text-xs font-bold py-1.5 px-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer shadow-2xs"
          title="Return to Home Screen"
        >
          <span>🏠</span>
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 hidden sm:inline">
            Point of Care Decision Support
          </span>
          <button
            onClick={toggleTheme}
            className="p-1.5 px-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-yellow-400 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <span>🛠️</span>
            <span>Point-of-Care Clinical Tools</span>
          </div>

          <button
            onClick={() => setShowAllTools(!showAllTools)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span>{showAllTools ? '▤ Single Row Bar' : '⊞ View All 9 Tools'}</span>
          </button>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Clinical Tools & Calculators
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          CPZ & BZD equivalencies, Lithium TDM troughs, Clozapine REMS, CYP450 collisions, QTc stacker, and metabolic tracking
        </p>
      </div>

      {/* View All 9 Tools Grid (when toggled open) */}
      {showAllTools ? (
        <div className="bg-gray-100 dark:bg-gray-800/90 p-3 rounded-2xl mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              All 9 Clinical Engines (1-Click Access)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Active: {CLINICAL_TOOLS.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CLINICAL_TOOLS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  handleTabChange(tab.id)
                  setShowAllTools(false)
                }}
                className={`flex items-start gap-2 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span className="text-lg flex-shrink-0">{tab.icon}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold block leading-snug truncate">{tab.label}</span>
                  <span className={`text-[10px] block truncate ${activeTab === tab.id ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Segmented Tool Tabs with Scroll Controls & Mousewheel Support */
        <div className="relative mb-6 flex items-center gap-1.5">
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            className="hidden sm:flex items-center justify-center w-7 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black text-sm flex-shrink-0 cursor-pointer transition-colors shadow-2xs"
            title="Scroll left"
          >
            ‹
          </button>

          <div
            ref={scrollContainerRef}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.currentTarget.scrollLeft += e.deltaY
              }
            }}
            className="flex-1 flex items-center gap-1 bg-gray-100 dark:bg-gray-800/90 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar scroll-smooth"
          >
            {CLINICAL_TOOLS.map(tab => (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-700/40'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            className="hidden sm:flex items-center justify-center w-7 h-9 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black text-sm flex-shrink-0 cursor-pointer transition-colors shadow-2xs"
            title="Scroll right to see all tools"
          >
            ›
          </button>
        </div>
      )}

      {/* Active Tool View */}
      {activeTab === 'cpz' && (
        <CpzEquivalencyConverter
          navigate={navigate}
          initialDrug={initialDrug}
          showToast={setToastMessage}
        />
      )}
      {activeTab === 'lithium' && (
        <LithiumTdmTool
          navigate={navigate}
          showToast={setToastMessage}
        />
      )}
      {activeTab === 'clozapine' && (
        <ClozapineRemsTool
          navigate={navigate}
          showToast={setToastMessage}
        />
      )}
      {activeTab === 'cyp' && (
        <CypInteractionChecker
          initialDrug={initialDrug}
        />
      )}
      {activeTab === 'qtc' && (
        <QtcRiskStacker
          initialDrug={initialDrug}
        />
      )}
      {activeTab === 'bzd' && (
        <BzdEquivalencyCalculator
          navigate={navigate}
          initialDrug={initialDrug}
          showToast={setToastMessage}
        />
      )}
      {activeTab === 'metabolic' && (
        <MetabolicTrackerTool
          navigate={navigate}
          showToast={setToastMessage}
        />
      )}
      {activeTab === 'emergency' && (
        <EmergencyPlaybook
          navigate={navigate}
        />
      )}
      {activeTab === 'renal' && (
        <OrganAdjustmentTool />
      )}
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 1: Antipsychotic CPZ Equivalency & Cross-Switch Converter
// -------------------------------------------------------------
function CpzEquivalencyConverter({ navigate, initialDrug, showToast }) {
  const cpzCatalog = {
    chlorpromazine: { name: 'Chlorpromazine', brand: 'Thorazine', ratio: 100, class: 'FGA', typical: '200–800 mg/day' },
    haloperidol: { name: 'Haloperidol', brand: 'Haldol', ratio: 2, class: 'FGA', typical: '2–20 mg/day' },
    olanzapine: { name: 'Olanzapine', brand: 'Zyprexa', ratio: 5, class: 'SGA', typical: '10–20 mg/day' },
    risperidone: { name: 'Risperidone', brand: 'Risperdal', ratio: 2, class: 'SGA', typical: '2–6 mg/day' },
    aripiprazole: { name: 'Aripiprazole', brand: 'Abilify', ratio: 7.5, class: 'SGA (D2 Partial)', typical: '10–30 mg/day' },
    quetiapine: { name: 'Quetiapine', brand: 'Seroquel', ratio: 75, class: 'SGA', typical: '300–800 mg/day' },
    clozapine: { name: 'Clozapine', brand: 'Clozaril', ratio: 100, class: 'SGA', typical: '300–600 mg/day' },
    ziprasidone: { name: 'Ziprasidone', brand: 'Geodon', ratio: 40, class: 'SGA', typical: '80–160 mg/day' },
    paliperidone: { name: 'Paliperidone', brand: 'Invega', ratio: 2, class: 'SGA', typical: '3–12 mg/day' },
    lurasidone: { name: 'Lurasidone', brand: 'Latuda', ratio: 30, class: 'SGA', typical: '40–120 mg/day' },
    cariprazine: { name: 'Cariprazine', brand: 'Vraylar', ratio: 1.5, class: 'SGA (D3/D2 Partial)', typical: '1.5–6 mg/day' },
    brexpiprazole: { name: 'Brexpiprazole', brand: 'Rexulti', ratio: 1, class: 'SGA (D2 Partial)', typical: '2–4 mg/day' },
    fluphenazine: { name: 'Fluphenazine', brand: 'Prolixin', ratio: 2, class: 'FGA', typical: '2.5–20 mg/day' },
    perphenazine: { name: 'Perphenazine', brand: 'Trilafon', ratio: 8, class: 'FGA', typical: '8–32 mg/day' },
    asenapine: { name: 'Asenapine', brand: 'Saphris', ratio: 5, class: 'SGA', typical: '10–20 mg/day' },
    lumateperone: { name: 'Lumateperone', brand: 'Caplyta', ratio: 42, class: 'SGA', typical: '42 mg/day' },
  }

  const defaultSource = useMemo(() => {
    if (initialDrug) {
      const match = Object.keys(cpzCatalog).find(k => k.includes(initialDrug.toLowerCase()) || initialDrug.toLowerCase().includes(k))
      if (match) return match
    }
    return 'olanzapine'
  }, [initialDrug])

  const [sourceDrugKey, setSourceDrugKey] = useState(defaultSource)
  const [sourceDose, setSourceDose] = useState(20)
  const [targetDrugKey, setTargetDrugKey] = useState('aripiprazole')

  useEffect(() => {
    if (defaultSource) setSourceDrugKey(defaultSource)
  }, [defaultSource])

  const sourceDrug = cpzCatalog[sourceDrugKey] || cpzCatalog.olanzapine
  const targetDrug = cpzCatalog[targetDrugKey] || cpzCatalog.aripiprazole

  // CPZ Calculation
  const cpzEquivalent = useMemo(() => {
    const val = (parseFloat(sourceDose) || 0) * (100.0 / sourceDrug.ratio)
    return Math.round(val * 10) / 10
  }, [sourceDose, sourceDrug])

  // Target Drug Dose
  const targetEquivalentDose = useMemo(() => {
    const val = cpzEquivalent * (targetDrug.ratio / 100.0)
    return Math.round(val * 10) / 10
  }, [cpzEquivalent, targetDrug])

  // D2 Occupancy & Cumulative Burden Stratification
  const burdenStatus = useMemo(() => {
    if (cpzEquivalent < 200) {
      return {
        label: 'Low / Augmentation Dosing (<200 mg CPZ eq)',
        badge: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        note: 'Subtherapeutic for acute psychosis. Typical for adjunctive mood/anxiety augmentation or initial conservative titration.',
        meterColor: 'bg-blue-500',
        meterPercent: Math.min(100, Math.round((cpzEquivalent / 1200) * 100)),
      }
    }
    if (cpzEquivalent <= 600) {
      return {
        label: 'Standard Therapeutic Window (200–600 mg CPZ eq)',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        note: 'Corresponds to optimal 65%–80% striatal D2 receptor occupancy for antipsychotic efficacy with manageable motor liability.',
        meterColor: 'bg-emerald-500',
        meterPercent: Math.min(100, Math.round((cpzEquivalent / 1200) * 100)),
      }
    }
    if (cpzEquivalent <= 1000) {
      return {
        label: 'High-Dose Stratum (600–1000 mg CPZ eq)',
        badge: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        note: 'D2 occupancy often exceeds 80%. Heightened liability for extrapyramidal symptoms, akathisia, hyperprolactinemia, and sedation.',
        meterColor: 'bg-amber-500',
        meterPercent: Math.min(100, Math.round((cpzEquivalent / 1200) * 100)),
      }
    }
    return {
      label: 'Supratherapeutic Ceiling Alert (>1000 mg CPZ eq)',
      badge: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      note: 'High risk of tardive dyskinesia, cognitive blunting, secondary negative symptoms, and neuroleptic malignant syndrome. Consider gradual dose reduction or switching to Clozapine if refractory.',
      meterColor: 'bg-red-600',
      meterPercent: 100,
    }
  }, [cpzEquivalent])

  // Check if an authoritative switch protocol exists between source and target
  const switchProtocol = useMemo(() => {
    const sName = sourceDrug.name.toLowerCase()
    const tName = targetDrug.name.toLowerCase()
    return (data.protocols || []).find(p => {
      const title = (p.title || '').toLowerCase()
      const trans = (p.transitionTitle || '').toLowerCase()
      return (title.includes(sName) || trans.includes(sName)) && (title.includes(tName) || trans.includes(tName))
    })
  }, [sourceDrug, targetDrug])

  const copyDoseConversion = () => {
    const text = [
      `=== ANTIPSYCHOTIC DOSE CONVERSION NOTE ===`,
      `Source: ${sourceDrug.name} ${sourceDose} mg/day (${sourceDrug.class})`,
      `Chlorpromazine (CPZ) Equivalent: ${cpzEquivalent} mg/day`,
      `Target Equivalent: ${targetDrug.name} ~${targetEquivalentDose} mg/day (${targetDrug.class})`,
      `Burden Stratum: ${burdenStatus.label}`,
      `Clinical Note: ${burdenStatus.note}`,
      `Guideline References: Gardner et al. (2010), Leucht et al. (2016, 2020)`,
      `==========================================`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      showToast('CPZ conversion note copied to clipboard!')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>🎭</span>
            <span>Antipsychotic Chlorpromazine (CPZ) Converter</span>
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Gardner / Leucht Consensus
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Current Antipsychotic:
            </label>
            <select
              value={sourceDrugKey}
              onChange={e => setSourceDrugKey(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(cpzCatalog).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({v.brand})</option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
              Typical: {sourceDrug.typical}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Current Dose (mg/day):
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={sourceDose}
              onChange={e => setSourceDose(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
              100 mg CPZ = {sourceDrug.ratio} mg {sourceDrug.name}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Convert To (Target Drug):
            </label>
            <select
              value={targetDrugKey}
              onChange={e => setTargetDrugKey(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(cpzCatalog).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({v.brand})</option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
              Typical: {targetDrug.typical}
            </span>
          </div>
        </div>

        {/* Dual Conversion Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-5 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
              CPZ Equivalent Exposure
            </span>
            <div className="text-3xl font-black text-indigo-950 dark:text-indigo-100">
              {cpzEquivalent} mg
            </div>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium mt-1">
              Chlorpromazine Equivalent / day
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-5 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1">
              Target Dose Equivalent
            </span>
            <div className="text-3xl font-black text-purple-950 dark:text-purple-100">
              ~{targetEquivalentDose} mg
            </div>
            <p className="text-xs text-purple-800 dark:text-purple-300 font-medium mt-1">
              {targetDrug.name} daily dose
            </p>
          </div>
        </div>

        {/* Cumulative D2 Burden Meter */}
        <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Cumulative D2 Occupancy & Exposure Meter
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${burdenStatus.badge}`}>
              {burdenStatus.label}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${burdenStatus.meterColor}`}
              style={{ width: `${burdenStatus.meterPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {burdenStatus.note}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={copyDoseConversion}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>📋</span>
            <span>Copy CPZ Conversion Note</span>
          </button>

          {switchProtocol ? (
            <button
              onClick={() => navigate(`/cross-titration/${switchProtocol.id}`)}
              className="py-2.5 px-4 bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-purple-300 dark:border-purple-700"
            >
              <span>🔄</span>
              <span>Open Switch Protocol #{switchProtocol.number}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/cross-titration`)}
              className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>🔄</span>
              <span>View All 20 Cross-Titrations</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 2: Lithium Therapeutic Drug Monitoring (TDM) & 12h Trough
// -------------------------------------------------------------
function LithiumTdmTool({ navigate, showToast }) {
  const [doseTime, setDoseTime] = useState('21:00')
  const [drawTime, setDrawTime] = useState('09:00')
  const [currentDose, setCurrentDose] = useState(600)
  const [currentLevel, setCurrentLevel] = useState(0.5)
  const [customTarget, setCustomTarget] = useState(0.8)

  const [hasNsaid, setHasNsaid] = useState(false)
  const [hasThiazide, setHasThiazide] = useState(false)
  const [hasAceiArb, setHasAceiArb] = useState(false)
  const [hasDehydration, setHasDehydration] = useState(false)

  // Calculate elapsed hours between dose and draw
  const elapsedHours = useMemo(() => {
    if (!doseTime || !drawTime) return 12
    const [dH, dM] = doseTime.split(':').map(Number)
    const [bH, bM] = drawTime.split(':').map(Number)
    let doseMinutes = dH * 60 + dM
    let drawMinutes = bH * 60 + bM
    if (drawMinutes < doseMinutes) {
      drawMinutes += 24 * 60
    }
    const diff = (drawMinutes - doseMinutes) / 60
    return Math.round(diff * 10) / 10
  }, [doseTime, drawTime])

  // Evaluate timing validity
  const timingStatus = useMemo(() => {
    if (elapsedHours < 10) {
      return {
        valid: false,
        severity: 'PREMATURE',
        badge: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
        title: `Blood Drawn Too Early (${elapsedHours}h Post-Dose)`,
        directive: 'Lithium is still undergoing absorption and tissue distribution. Serum level will appear falsely elevated by 20%–40% compared to true 12-hour trough. DO NOT reduce dose based on this draw. Re-draw at exact 12-hour mark (10–14h window).',
      }
    }
    if (elapsedHours <= 14) {
      return {
        valid: true,
        severity: 'OPTIMAL',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        title: `Optimal 12-Hour Steady-State Trough (${elapsedHours}h Post-Dose)`,
        directive: 'Blood draw reflects the true standardized elimination trough. Highly reliable for proportional dose adjustment math.',
      }
    }
    return {
      valid: false,
      severity: 'DELAYED',
      badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      title: `Delayed Blood Draw (${elapsedHours}h Post-Dose)`,
      directive: 'Elimination clearance has progressed beyond standard 12-hour window. True trough is somewhat higher than measured. Dose adjustments should be conservative.',
    }
  }, [elapsedHours])

  // Linear Titration Math: New Dose = Current Dose * (Target / Current)
  const targetLevel = parseFloat(customTarget) || 0.8
  const predictedDose = useMemo(() => {
    const cDose = parseFloat(currentDose) || 0
    const cLevel = parseFloat(currentLevel) || 0
    if (cLevel <= 0 || cDose <= 0) return 0
    const val = cDose * (targetLevel / cLevel)
    return Math.round(val)
  }, [currentDose, currentLevel, targetLevel])

  const roundedDose = useMemo(() => {
    if (predictedDose <= 0) return 0
    return Math.round(predictedDose / 150) * 150
  }, [predictedDose])

  const toxicityAlert = useMemo(() => {
    const level = parseFloat(currentLevel) || 0
    if (level >= 4.0) {
      return {
        status: 'CRITICAL EMERGENCY',
        badge: 'bg-red-600 text-white',
        text: 'Mandatory Emergent Hemodialysis regardless of clinical symptoms. Acute permanent cerebellar and renal damage risk.',
      }
    }
    if (level >= 2.5) {
      return {
        status: 'SEVERE TOXICITY',
        badge: 'bg-red-500 text-white',
        text: 'Hemodialysis indicated if patient exhibits neurologic impairment (stupor, seizures, ataxia) or renal insufficiency. Intensive IV saline hydration.',
      }
    }
    if (level >= 1.5) {
      return {
        status: 'MODERATE TOXICITY',
        badge: 'bg-amber-500 text-white',
        text: 'Hold Lithium immediately. Check renal panel and electrolytes. Infuse IV isotonic saline to promote renal lithium clearance.',
      }
    }
    if (level < 0.6) {
      return {
        status: 'SUBTHERAPEUTIC',
        badge: 'bg-blue-500 text-white',
        text: 'Below standard bipolar maintenance target (0.6–0.8 mEq/L). May be adequate for frail elderly or adjunctive depression augmentation.',
      }
    }
    return {
      status: 'THERAPEUTIC',
      badge: 'bg-emerald-600 text-white',
      text: 'Within standard therapeutic reference window.',
    }
  }, [currentLevel])

  const copyLithiumTdm = () => {
    const text = [
      `=== LITHIUM THERAPEUTIC DRUG MONITORING (TDM) NOTE ===`,
      `Current Dose: ${currentDose} mg/day`,
      `Reported Serum Level: ${currentLevel} mEq/L (Drawn ${elapsedHours}h post-dose)`,
      `Trough Validity: ${timingStatus.title} - ${timingStatus.severity}`,
      `Desired Target Level: ${targetLevel} mEq/L`,
      `Linear Proportional Dose: ${predictedDose} mg/day (Suggested standard size: ${roundedDose} mg/day)`,
      `Toxicity / Window Status: ${toxicityAlert.status} (${toxicityAlert.text})`,
      hasNsaid || hasThiazide || hasAceiArb || hasDehydration ? 'Lethal Collision Warnings:' : '',
      hasThiazide ? '- THIAZIDE DIURETIC: Decreases clearance by 30%–50%; reduce dose by 50% and recheck level in 5 days.' : '',
      hasNsaid ? '- NSAID INTERACTION: Reduces renal prostaglandin synthesis, spiking levels by 30%–60%.' : '',
      hasAceiArb ? '- ACEi/ARB INTERACTION: Impairs GFR, causes delayed toxicity over 1–3 weeks.' : '',
      hasDehydration ? '- DEHYDRATION / SODIUM RESTRICTION: Triggers acute renal Lithium reabsorption.' : '',
      `======================================================`,
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(text).then(() => {
      showToast('Lithium TDM note copied to clipboard!')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>⏱️</span>
          <span>12-Hour Serum Trough Timing Validator</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Lithium trough must be drawn exactly 12 hours (± 2h) post-dose at steady state (≥ 5 days on stable dose).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Time of Evening Dose:
            </label>
            <input
              type="time"
              value={doseTime}
              onChange={e => setDoseTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Time of Morning Blood Draw:
            </label>
            <input
              type="time"
              value={drawTime}
              onChange={e => setDrawTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className={`rounded-2xl p-4 border text-xs leading-relaxed ${timingStatus.badge}`}>
          <div className="flex items-center justify-between font-black mb-1">
            <span>{timingStatus.title}</span>
            <span className="uppercase text-[10px]">{timingStatus.severity}</span>
          </div>
          <p className="font-medium">
            {timingStatus.directive}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>🧪</span>
            <span>Steady-State Linear Dose Titration Math</span>
          </h2>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${toxicityAlert.badge}`}>
            {toxicityAlert.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Current Daily Dose (mg):
            </label>
            <input
              type="number"
              step="150"
              value={currentDose}
              onChange={e => setCurrentDose(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Measured Level (mEq/L):
            </label>
            <input
              type="number"
              step="0.05"
              value={currentLevel}
              onChange={e => setCurrentLevel(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Desired Target (mEq/L):
            </label>
            <input
              type="number"
              step="0.05"
              value={customTarget}
              onChange={e => setCustomTarget(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Quick Clinical Target Presets */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mr-1">Targets:</span>
          {[
            { label: 'Geriatric (0.4–0.6)', val: 0.5 },
            { label: 'Depression Aug (0.6)', val: 0.6 },
            { label: 'Maintenance (0.7–0.8)', val: 0.8 },
            { label: 'Acute Mania (0.8–1.2)', val: 1.0 },
          ].map(p => (
            <button
              key={p.val}
              onClick={() => setCustomTarget(p.val)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                Math.abs(parseFloat(customTarget) - p.val) < 0.05
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Result Banner */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 border-2 border-indigo-200 dark:border-indigo-800 rounded-3xl p-5 text-center mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
            Calculated New Maintenance Dose
          </span>
          <div className="text-3xl font-black text-indigo-950 dark:text-indigo-100">
            {roundedDose} mg / day
          </div>
          <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium mt-1">
            Exact linear math: {predictedDose} mg/day (Adjust to nearest available 150 mg / 300 mg capsule)
          </p>
        </div>

        {/* Lethal Collision Checklist */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 mb-5">
          <h3 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Check Lethal Drug Collisions That Spike Lithium Levels</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { checked: hasNsaid, set: setHasNsaid, label: 'NSAIDs (Ibuprofen, Naproxen; +30–60%)' },
              { checked: hasThiazide, set: setHasThiazide, label: 'Thiazides (HCTZ, Chlorthalidone; +50%)' },
              { checked: hasAceiArb, set: setHasAceiArb, label: 'ACEi / ARBs (Lisinopril, Losartan; delayed)' },
              { checked: hasDehydration, set: setHasDehydration, label: 'Dehydration / Low-Sodium Diet' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.set(!item.checked)}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  item.checked
                    ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200 font-bold'
                    : 'bg-white dark:bg-gray-900 border-rose-200 dark:border-rose-900 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{item.label}</span>
                <span>{item.checked ? '☑' : '☐'}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={copyLithiumTdm}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>📋</span>
          <span>Copy Lithium TDM Note</span>
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 3: Clozapine REMS ANC & Missed Dose Triage
// -------------------------------------------------------------
function ClozapineRemsTool({ navigate, showToast }) {
  const [population, setPopulation] = useState('general')
  const [ancValue, setAncValue] = useState(1800)
  const [missedHours, setMissedHours] = useState(0)

  const triage = useMemo(() => {
    const val = parseFloat(ancValue) || 0
    const isBen = population === 'ben'
    const normalThreshold = isBen ? 1000 : 1500
    const severeThreshold = isBen ? 500 : 1000

    if (val >= normalThreshold) {
      return {
        zone: 'GREEN',
        title: 'Normal ANC (Acceptable for Clozapine)',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        directive: 'Continue Clozapine therapy. Maintain standard monitoring cadence: Weekly for Months 1–6, Every 2 Weeks for Months 7–12, and Monthly (Every 4 Weeks) indefinitely thereafter.',
      }
    }
    if (val >= severeThreshold) {
      return {
        zone: 'AMBER',
        title: 'Mild Neutropenia Detected',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        directive: 'Continue Clozapine therapy. Increase ANC monitoring frequency to 3 times weekly until ANC returns to ≥ 1500/µL (or BEN baseline ≥ 1000/µL). Coordinate with REMS and monitor closely for fever or mucosal infection.',
      }
    }
    return {
      zone: 'RED',
      title: 'Severe Neutropenia / Agranulocytosis Hazard',
      badge: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      directive: 'IMMEDIATELY INTERRUPT CLOZAPINE. Do NOT resume. Obtain daily complete blood counts with differential until resolved. Immediate infectious disease and hematology consultation. Protect patient in reverse isolation if ANC < 500/µL. Rechallenge is strictly prohibited without specialized REMS panel authorization.',
    }
  }, [ancValue, population])

  const missedDoseAlert = useMemo(() => {
    const hrs = parseFloat(missedHours) || 0
    if (hrs >= 48) {
      return {
        critical: true,
        title: 'CRITICAL: Tolerance Collapse (≥48 Hours Missed)',
        directive: 'Patient has lost tolerance to alpha-1 adrenergic and H1 receptor blockade. Resuming at previous maintenance dose risks severe orthostatic collapse, syncope, profound sedation, and cardiac arrest. MANDATORY: Restart titration from 12.5 mg or 25 mg daily and re-escalate conservatively.',
      }
    }
    if (hrs >= 24) {
      return {
        critical: false,
        title: 'Moderate Interruption (24–47 Hours Missed)',
        directive: 'May resume current dose if previously well tolerated, or administer half-dose for 24 hours before returning to full maintenance dose.',
      }
    }
    return null
  }, [missedHours])

  const copyRemsNote = () => {
    const text = [
      `=== CLOZAPINE REMS ANC & SAFETY TRIAGE ===`,
      `Population Category: ${population === 'ben' ? 'Benign Ethnic Neutropenia (BEN)' : 'General Population'}`,
      `Current ANC: ${ancValue} /µL`,
      `REMS Triage Status: ${triage.zone} - ${triage.title}`,
      `Clinical Directive: ${triage.directive}`,
      missedDoseAlert ? `Missed Dose Assessment (${missedHours} hours missed): ${missedDoseAlert.title} - ${missedDoseAlert.directive}` : '',
      `Bowel Motility Precaution: Clozapine slows GI transit via potent muscarinic (M3) antagonism. Monitor daily bowel habits; severe constipation and paralytic ileus carry high mortality.`,
      `==========================================`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      showToast('Clozapine REMS triage note copied to clipboard!')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>🩸</span>
            <span>Clozapine REMS Absolute Neutrophil Count (ANC) Triage</span>
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            FDA REMS Standard
          </span>
        </div>

        {/* Population Selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setPopulation('general')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              population === 'general'
                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="text-xs">General Population</div>
            <div className="text-[10px] opacity-75">Baseline ANC ≥ 1500 /µL</div>
          </button>

          <button
            onClick={() => setPopulation('ben')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              population === 'ben'
                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="text-xs">Benign Ethnic Neutropenia (BEN)</div>
            <div className="text-[10px] opacity-75">Baseline ANC ≥ 1000 /µL</div>
          </button>
        </div>

        {/* ANC Input */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Current Absolute Neutrophil Count (ANC in /µL):
          </label>
          <input
            type="number"
            step="50"
            value={ancValue}
            onChange={e => setAncValue(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 mt-1.5">
            {[2000, 1600, 1200, 900, 450].map(v => (
              <button
                key={v}
                onClick={() => setAncValue(v)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              >
                {v} /µL
              </button>
            ))}
          </div>
        </div>

        {/* Triage Decision Banner */}
        <div className={`rounded-2xl p-5 border mb-5 text-xs leading-relaxed ${triage.badge}`}>
          <div className="flex items-center justify-between font-black mb-1">
            <span className="text-sm">{triage.title}</span>
            <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40">
              Zone: {triage.zone}
            </span>
          </div>
          <p className="font-medium">
            {triage.directive}
          </p>
        </div>

        {/* Missed Dose Tolerance Rule */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Missed Dose Tolerance Rule (Crucial Safety Pearl)</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Hours Since Last Dose:
            </label>
            <input
              type="number"
              min="0"
              value={missedHours}
              onChange={e => setMissedHours(e.target.value)}
              className="w-24 bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-800 rounded-xl px-2.5 py-1 text-xs font-bold"
            />
            <span className="text-xs text-gray-500">hours</span>
          </div>

          {missedDoseAlert && (
            <div className={`rounded-xl p-3 text-xs leading-relaxed ${
              missedDoseAlert.critical
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 font-bold border border-rose-300 dark:border-rose-800'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-medium'
            }`}>
              <div className="font-black mb-0.5">{missedDoseAlert.title}</div>
              <div>{missedDoseAlert.directive}</div>
            </div>
          )}
        </div>

        <button
          onClick={copyRemsNote}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>📋</span>
          <span>Copy Clozapine REMS Note</span>
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 4: CYP450 Interaction & Co-Prescribing Checker
// -------------------------------------------------------------
function CypInteractionChecker({ initialDrug }) {
  const [selectedDrugIds, setSelectedDrugIds] = useState(() => {
    if (initialDrug) {
      const match = data.drugs.find(d => d.id === initialDrug || d.name.toLowerCase().includes(initialDrug.toLowerCase()))
      if (match) return [match.id]
    }
    return ['clozapine']
  })
  const [hasSmoking, setHasSmoking] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const availableDrugs = useMemo(() => {
    if (!searchQuery.trim()) return data.drugs.slice(0, 15)
    const q = searchQuery.toLowerCase().trim()
    return data.drugs.filter(d => d.name.toLowerCase().includes(q) || (d.brand && d.brand.toLowerCase().includes(q)))
  }, [searchQuery])

  const toggleDrug = (id) => {
    if (selectedDrugIds.includes(id)) {
      if (selectedDrugIds.length > 1) {
        setSelectedDrugIds(selectedDrugIds.filter(d => d !== id))
      }
    } else {
      if (selectedDrugIds.length < 5) {
        setSelectedDrugIds([...selectedDrugIds, id])
      }
    }
  }

  const detectedInteractions = useMemo(() => {
    const alerts = []
    const drugs = selectedDrugIds.map(id => data.drugs.find(d => d.id === id)).filter(Boolean)
    const names = drugs.map(d => d.name.toLowerCase())

    // 1. Smoking + Clozapine / Olanzapine
    if (hasSmoking) {
      if (names.some(n => n.includes('clozapine'))) {
        alerts.push({
          severity: 'CRITICAL',
          title: 'CYP1A2 Hydrocarbon Induction & Smoking Hazard with Clozapine',
          mechanism: 'Polycyclic aromatic hydrocarbons in tobacco smoke strongly induce hepatic CYP1A2 (~70% of Clozapine clearance).',
          directive: 'Smokers require ~50% higher doses. If patient stops smoking abruptly, Clozapine levels DOUBLE within 48–72 hours at the same dose, triggering toxic stupor, severe sedation, and grand mal seizures! Immediately decrease dose by 30%–50% upon cessation.',
        })
      }
      if (names.some(n => n.includes('olanzapine'))) {
        alerts.push({
          severity: 'MODERATE',
          title: 'CYP1A2 Smoking Induction with Olanzapine',
          mechanism: 'Cigarette smoking accelerates Olanzapine clearance via CYP1A2 induction.',
          directive: 'Smokers typically exhibit 30%–40% lower Olanzapine plasma levels. Moderate dose upward titration may be required during active smoking, or reduction upon smoking cessation.',
        })
      }
    }

    // 2. Potent CYP2D6 Inhibitors
    const has2D6Inhibitor = names.some(n => n.includes('fluoxetine') || n.includes('paroxetine') || n.includes('bupropion'))
    if (has2D6Inhibitor) {
      const substrates = []
      if (names.some(n => n.includes('aripiprazole'))) substrates.push('Aripiprazole (Requires 50% dose reduction per FDA label)')
      if (names.some(n => n.includes('risperidone'))) substrates.push('Risperidone (Elevates active moiety, surges EPS and prolactin)')
      if (names.some(n => n.includes('vortioxetine'))) substrates.push('Vortioxetine (Requires 50% dose cut)')
      if (names.some(n => n.includes('atomoxetine'))) substrates.push('Atomoxetine (Converts extensive metabolizer to poor metabolizer; 5x AUC surge)')
      if (names.some(n => n.includes('venlafaxine'))) substrates.push('Venlafaxine (Shifts metabolism from O-desmethyl to parent venlafaxine)')

      if (substrates.length > 0) {
        alerts.push({
          severity: 'HIGH',
          title: 'Potent CYP2D6 Metabolic Blockade',
          mechanism: 'Strong 2D6 inhibition markedly increases plasma concentrations of co-prescribed 2D6 substrates.',
          directive: `Impacted medications: ${substrates.join('; ')}. Proactively reduce substrate dose and monitor for acute toxicity.`,
        })
      }
    }

    // 3. Fluvoxamine
    if (names.some(n => n.includes('fluvoxamine'))) {
      if (names.some(n => n.includes('clozapine'))) {
        alerts.push({
          severity: 'CRITICAL',
          title: 'Extreme 5- to 10-Fold Clozapine Level Surge (Fluvoxamine + Clozapine)',
          mechanism: 'Fluvoxamine is an ultra-potent inhibitor of CYP1A2, 2C19, and moderate inhibitor of 3A4.',
          directive: 'Combining these medications leads to massive Clozapine toxicity. If intentionally co-prescribed to elevate levels in ultrarapid metabolizers, Clozapine dose must be reduced to 25%–30% of standard baseline with therapeutic drug monitoring (TDM).',
        })
      }
    }

    // 4. Valproate + Lamotrigine
    if (names.some(n => n.includes('valproat') || n.includes('divalproex')) && names.some(n => n.includes('lamotrigine'))) {
      alerts.push({
        severity: 'CRITICAL',
        title: 'UGT1A4 Glucuronidation Blockade & Stevens-Johnson Syndrome Risk',
        mechanism: 'Divalproex inhibits UGT1A4 glucuronidation of Lamotrigine, doubling its half-life (>60 hours) and doubling blood levels.',
        directive: 'Halve the standard Lamotrigine titration schedule (start at 25 mg EVERY OTHER DAY for weeks 1–2, then 25 mg daily for weeks 3–4). Fast titration risks fatal Stevens-Johnson Syndrome (SJS) and Toxic Epidermal Necrolysis (TEN).',
      })
    }

    // 5. Dual Anticholinergic Load
    const anticholinergicDrugs = drugs.filter(d => {
      const af = (d.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('anticholinergic'))
      return af && (af.severity.toLowerCase().includes('high') || af.severity.toLowerCase().includes('severe'))
    })
    if (anticholinergicDrugs.length >= 2) {
      alerts.push({
        severity: 'HIGH',
        title: 'Additive Anticholinergic Toxicity & Delirium Risk',
        mechanism: `Co-prescription of ${anticholinergicDrugs.map(d => d.name).join(' + ')} compounds central and peripheral muscarinic receptor blockade.`,
        directive: 'Substantially increases risk of urinary retention, acute paralytic ileus, narrow-angle glaucoma crisis, cognitive impairment, and anticholinergic delirium in elderly patients.',
      })
    }

    return alerts
  }, [selectedDrugIds, hasSmoking])

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Select Medications to Screen ({selectedDrugIds.length}/5)</span>
        </h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDrugIds.map(id => {
            const d = data.drugs.find(drug => drug.id === id)
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-xs font-bold"
              >
                <span>{d?.name || id}</span>
                <button
                  onClick={() => toggleDrug(id)}
                  className="hover:text-red-600 font-black ml-1 text-sm leading-none"
                >
                  ✕
                </button>
              </span>
            )
          })}
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚬</span>
            <div>
              <span className="text-xs font-bold text-amber-950 dark:text-amber-300 block">Tobacco / Cigarette Smoking Status</span>
              <span className="text-[10px] text-amber-800 dark:text-amber-400">Hydrocarbon inducer of CYP1A2 clearance</span>
            </div>
          </div>
          <button
            onClick={() => setHasSmoking(!hasSmoking)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              hasSmoking
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
            }`}
          >
            {hasSmoking ? 'Active Smoker' : 'Non-Smoker'}
          </button>
        </div>

        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medication to add..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {availableDrugs.map(d => {
            const isSelected = selectedDrugIds.includes(d.id)
            return (
              <button
                key={d.id}
                onClick={() => toggleDrug(d.id)}
                className={`text-xs px-2.5 py-1 rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 font-medium'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {d.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Pharmacokinetic Screening Results ({detectedInteractions.length} Flagged)
        </h3>

        {detectedInteractions.length > 0 ? (
          detectedInteractions.map((alert, i) => {
            const isCrit = alert.severity === 'CRITICAL'
            return (
              <div
                key={i}
                className={`rounded-3xl p-5 border-2 shadow-xs ${
                  isCrit ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isCrit ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {alert.severity} COLLISION
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-2">
                  <span className="font-bold text-gray-900 dark:text-white">Mechanism:</span> {alert.mechanism}
                </p>
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-3 border border-gray-200/60 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 font-semibold leading-relaxed">
                  <span className="font-black text-indigo-900 dark:text-indigo-400">Clinical Directive: </span>
                  {alert.directive}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 text-center">
            <span className="text-2xl block mb-1">✅</span>
            <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm mb-1">
              No Major CYP450 Collisions Detected
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-400">
              The selected combination does not exhibit catastrophic CYP1A2, 2D6, 3A4, or UGT metabolic antagonism based on compendium benchmarks.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 5: Additive QTc Cardiac Risk Stacker & Tisdale Framework
// -------------------------------------------------------------
function QtcRiskStacker({ initialDrug }) {
  const [selectedDrugIds, setSelectedDrugIds] = useState(() => {
    if (initialDrug) {
      const match = data.drugs.find(d => d.id === initialDrug || d.name.toLowerCase().includes(initialDrug.toLowerCase()))
      if (match) return [match.id, 'quetiapine']
    }
    return ['citalopram', 'quetiapine']
  })
  const [riskFactors, setRiskFactors] = useState({
    age65: false,
    female: true,
    hypokalemia: false,
    hypomagnesemia: false,
    baselineQtc: false,
    bradycardia: false,
  })

  const toggleFactor = (key) => {
    setRiskFactors(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const qtcAssessment = useMemo(() => {
    let score = 0
    if (riskFactors.age65) score += 1
    if (riskFactors.female) score += 1
    if (riskFactors.hypokalemia) score += 2
    if (riskFactors.hypomagnesemia) score += 1
    if (riskFactors.baselineQtc) score += 2
    if (riskFactors.bradycardia) score += 1

    const drugs = selectedDrugIds.map(id => data.drugs.find(d => d.id === id)).filter(Boolean)

    let highQtcDrugCount = 0
    const drugItems = drugs.map(d => {
      const qtcAf = (d.adverseFootprint || []).find(a => a.domain.toLowerCase().includes('qtc'))
      const sev = qtcAf ? qtcAf.severity : 'Low'
      if (sev.toLowerCase().includes('high') || sev.toLowerCase().includes('severe')) {
        highQtcDrugCount += 1
      }
      return { name: d.name, severity: sev }
    })

    if (highQtcDrugCount >= 1) score += 3
    if (highQtcDrugCount >= 2) score += 3

    let riskCategory = 'LOW RISK'
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
    let recommendation = 'Standard clinical vigilance. Baseline ECG recommended if prior cardiac history.'

    if (score >= 11) {
      riskCategory = 'HIGH RISK (Torsades Hazard)'
      badgeClass = 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
      recommendation = 'Mandatory baseline ECG and weekly telemetry/repeat ECG until steady state. Replete K+ ≥ 4.0 mEq/L and Mg2+ ≥ 2.0 mg/dL. Consider selecting non-prolonging psychotropic alternative (e.g. Aripiprazole, Lurasidone, Bupropion).'
    } else if (score >= 7) {
      riskCategory = 'MODERATE RISK'
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
      recommendation = 'Obtain baseline 12-lead ECG. Recheck electrolytes (potassium, magnesium). Repeat ECG 1–2 weeks post-titration.'
    }

    return { score, riskCategory, badgeClass, recommendation, drugItems }
  }, [selectedDrugIds, riskFactors])

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider block">
              Cumulative Tisdale QTc Stratification
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Total Score: {qtcAssessment.score} Points
            </h2>
          </div>
          <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${qtcAssessment.badgeClass}`}>
            {qtcAssessment.riskCategory}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed mb-4">
          <span className="font-bold text-indigo-900 dark:text-indigo-400">Clinical Protocol: </span>
          {qtcAssessment.recommendation}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase block">Target Potassium (K+):</span>
            <span className="font-black text-blue-950 dark:text-blue-100">≥ 4.0 mEq/L</span>
          </div>
          <div className="bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase block">Target Magnesium (Mg2+):</span>
            <span className="font-black text-purple-950 dark:text-purple-100">≥ 2.0 mg/dL</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>❤️</span>
          <span>Patient Risk Factor Multipliers</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { key: 'age65', label: 'Age ≥ 65 Years (+1 pt)' },
            { key: 'female', label: 'Female Sex (+1 pt)' },
            { key: 'hypokalemia', label: 'Hypokalemia K+ < 4.0 mEq/L (+2 pts)' },
            { key: 'hypomagnesemia', label: 'Hypomagnesemia Mg2+ < 2.0 (+1 pt)' },
            { key: 'baselineQtc', label: 'Baseline QTc ≥ 450 ms (+2 pts)' },
            { key: 'bradycardia', label: 'Sinus Bradycardia HR < 60 bpm (+1 pt)' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => toggleFactor(item.key)}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                riskFactors[item.key]
                  ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-bold'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium'
              }`}
            >
              <span>{item.label}</span>
              <span>{riskFactors[item.key] ? '☑' : '☐'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 6: Benzodiazepine Diazepam Milligram Equivalent (DME) & Ashton Taper
// -------------------------------------------------------------
function BzdEquivalencyCalculator({ navigate, initialDrug, showToast }) {
  const bzdData = {
    alprazolam: { name: 'Alprazolam (Xanax)', ratio: 0.5, halfLife: '12h (6–20h)', activeMetabolite: 'None' },
    clonazepam: { name: 'Clonazepam (Klonopin)', ratio: 0.5, halfLife: '30–40h', activeMetabolite: 'Inactive 7-amino' },
    lorazepam: { name: 'Lorazepam (Ativan)', ratio: 1.0, halfLife: '12–18h (Direct glucuronidation)', activeMetabolite: 'None' },
    diazepam: { name: 'Diazepam (Valium)', ratio: 10.0, halfLife: '20–50h (Nordiazepam: 100h)', activeMetabolite: 'Desmethyldiazepam' },
    chlordiazepoxide: { name: 'Chlordiazepoxide (Librium)', ratio: 25.0, halfLife: '24–48h', activeMetabolite: 'Demoxepam' },
    oxazepam: { name: 'Oxazepam (Serax)', ratio: 20.0, halfLife: '8–12h (Direct glucuronidation)', activeMetabolite: 'None' },
    temazepam: { name: 'Temazepam (Restoril)', ratio: 20.0, halfLife: '8–15h', activeMetabolite: 'None' },
  }

  const defaultBzd = useMemo(() => {
    if (initialDrug) {
      const match = Object.keys(bzdData).find(k => k.includes(initialDrug.toLowerCase()))
      if (match) return match
    }
    return 'lorazepam'
  }, [initialDrug])

  const [selectedBzd, setSelectedBzd] = useState(defaultBzd)
  const [dose, setDose] = useState(2)
  const [taperWeeks, setTaperWeeks] = useState(10)

  const currentBzd = bzdData[selectedBzd] || bzdData.lorazepam
  const diazepamEquiv = useMemo(() => {
    const val = (parseFloat(dose) || 0) * (10.0 / currentBzd.ratio)
    return Math.round(val * 10) / 10
  }, [dose, currentBzd])

  // Ashton Taper Step Calculator
  const taperSchedule = useMemo(() => {
    const totalDME = diazepamEquiv
    const weeks = parseInt(taperWeeks) || 10
    const steps = []
    const decrement = totalDME / weeks

    for (let w = 1; w <= weeks; w++) {
      const remaining = Math.max(0, totalDME - decrement * (w - 1))
      steps.push({
        week: w,
        diazepamDose: Math.round(remaining * 10) / 10,
        directive: w === 1
          ? `Initiate Diazepam switch: Substitute ${Math.round(totalDME/2)} mg Diazepam for half of current BZD`
          : w === 2
          ? `Complete switch to full Diazepam regimen (${Math.round(remaining)} mg/day in divided doses)`
          : w === weeks
          ? `Final cessation step: Stop Diazepam completely`
          : `Reduce daily Diazepam by ~${Math.round(decrement * 10)/10} mg`,
      })
    }
    return steps
  }, [diazepamEquiv, taperWeeks])

  const copyAshtonPlan = () => {
    const text = [
      `=== ASHTON BENZODIAZEPINE TAPERING PLAN ===`,
      `Current Regimen: ${currentBzd.name} ${dose} mg/day`,
      `Calculated Diazepam Milligram Equivalent: ${diazepamEquiv} mg/day`,
      `Planned Duration: ${taperWeeks} Weeks`,
      '',
      'WEEK-BY-WEEK TAPERING PROTOCOL:',
      ...taperSchedule.map(s => `Week ${s.week}: ${s.diazepamDose} mg Diazepam daily — ${s.directive}`),
      '',
      'SAFETY DIRECTIVES:',
      '- Patient-controlled pace: Hold dose at current step if withdrawal symptoms surge.',
      '- Avoid alcohol, sedating OTC antihistamines, and sudden cessation (seizure hazard).',
      '==========================================',
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      showToast('Ashton taper plan copied to clipboard!')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <span>⚖️</span>
          <span>Diazepam Milligram Equivalency & Ashton Taper</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Current Benzodiazepine:</label>
            <select
              value={selectedBzd}
              onChange={e => setSelectedBzd(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(bzdData).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Total Daily Dose (mg/day):</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={dose}
              onChange={e => setDose(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Result Banner */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border-2 border-purple-200 dark:border-purple-800 rounded-3xl p-5 text-center mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1">
            Calculated Diazepam Equivalent
          </span>
          <div className="text-3xl font-black text-purple-950 dark:text-purple-100">
            {diazepamEquiv} mg Diazepam / day
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300 font-medium mt-1">
            {dose} mg of {currentBzd.name} = {diazepamEquiv} mg Diazepam
          </p>
        </div>

        {/* Ashton Taper Generator Controls */}
        <div className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Target Taper Duration:
            </span>
            <div className="flex gap-1">
              {[8, 10, 12, 16].map(w => (
                <button
                  key={w}
                  onClick={() => setTaperWeeks(w)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                    taperWeeks === w
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                  }`}
                >
                  {w} Wks
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {taperSchedule.map(s => (
              <div key={s.week} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-xl text-xs border border-gray-100 dark:border-gray-700">
                <span className="font-bold text-purple-900 dark:text-purple-300 w-16">Week {s.week}:</span>
                <span className="font-extrabold text-gray-900 dark:text-white w-20">{s.diazepamDose} mg/d</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-1 truncate">{s.directive}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={copyAshtonPlan}
            className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>📋</span>
            <span>Copy Ashton Taper Plan</span>
          </button>
          <button
            onClick={() => navigate('/cross-titration/protocol-10-long-term-benzodiazepine-deprescribing-the-ashton-manual-paradigm')}
            className="py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-all"
          >
            Launch Full Protocol 10 →
          </button>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 7: Metabolic Syndrome & SGA Monitoring Tracker
// -------------------------------------------------------------
function MetabolicTrackerTool({ navigate, showToast }) {
  const sgaMetabolicTable = [
    { name: 'Clozapine', brand: 'Clozaril', risk: 'HIGH', weight: '+++++', glucose: '+++++', lipids: '+++++' },
    { name: 'Olanzapine', brand: 'Zyprexa', risk: 'HIGH', weight: '++++', glucose: '++++', lipids: '++++' },
    { name: 'Quetiapine', brand: 'Seroquel', risk: 'MODERATE', weight: '+++', glucose: '+++', lipids: '+++' },
    { name: 'Risperidone', brand: 'Risperdal', risk: 'MODERATE', weight: '++', glucose: '++', lipids: '++' },
    { name: 'Paliperidone', brand: 'Invega', risk: 'MODERATE', weight: '++', glucose: '++', lipids: '++' },
    { name: 'Iloperidone', brand: 'Fanapt', risk: 'MODERATE', weight: '++', glucose: '++', lipids: '++' },
    { name: 'Aripiprazole', brand: 'Abilify', risk: 'LOW / NEUTRAL', weight: '+/-', glucose: '+/-', lipids: '+/-' },
    { name: 'Ziprasidone', brand: 'Geodon', risk: 'LOW / NEUTRAL', weight: '+/-', glucose: '+/-', lipids: '+/-' },
    { name: 'Lurasidone', brand: 'Latuda', risk: 'LOW / NEUTRAL', weight: '+/-', glucose: '+/-', lipids: '+/-' },
    { name: 'Cariprazine', brand: 'Vraylar', risk: 'LOW / NEUTRAL', weight: '+/-', glucose: '+/-', lipids: '+/-' },
    { name: 'Brexpiprazole', brand: 'Rexulti', risk: 'LOW / NEUTRAL', weight: '+', glucose: '+/-', lipids: '+/-' },
    { name: 'Lumateperone', brand: 'Caplyta', risk: 'LOW / NEUTRAL', weight: '+/-', glucose: '+/-', lipids: '+/-' },
    { name: 'Cobenfy', brand: 'KarXT', risk: 'MINIMAL (Weight Loss Observed)', weight: '-', glucose: '+/-', lipids: '+/-' },
  ]

  const monitoringCadence = [
    { parameter: 'Personal & Family History', baseline: '✓', w4: '—', w8: '—', w12: '—', quarterly: '—', annually: '✓' },
    { parameter: 'Weight & BMI', baseline: '✓', w4: '✓', w8: '✓', w12: '✓', quarterly: '✓', annually: '✓' },
    { parameter: 'Waist Circumference', baseline: '✓', w4: '—', w8: '—', w12: '—', quarterly: '—', annually: '✓' },
    { parameter: 'Blood Pressure', baseline: '✓', w4: '—', w8: '—', w12: '✓', quarterly: '✓', annually: '✓' },
    { parameter: 'Fasting Blood Glucose / HbA1c', baseline: '✓', w4: '—', w8: '—', w12: '✓', quarterly: '—', annually: '✓' },
    { parameter: 'Fasting Lipid Profile', baseline: '✓', w4: '—', w8: '—', w12: '✓', quarterly: '—', annually: 'Every 5 yrs' },
  ]

  const copyMetabolicGuideline = () => {
    const text = [
      `=== ADA / APA METABOLIC MONITORING GUIDELINE ===`,
      `Monitoring Intervals:`,
      `- BMI: Baseline, 4w, 8w, 12w, Quarterly, Annually`,
      `- Fasting Glucose / HbA1c: Baseline, 12w, Annually`,
      `- Fasting Lipids: Baseline, 12w, Every 5 years`,
      '',
      `METFORMIN INTERVENTION THRESHOLD:`,
      `Initiate Metformin (start 500 mg daily with food -> 1000 mg BID) if:`,
      `1) Weight gain >= 5% within first 3 months of SGA initiation`,
      `2) Prediabetes diagnosed (Fasting glucose 100-125 mg/dL or HbA1c 5.7%-6.4%)`,
      `================================================`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      showToast('Metabolic monitoring protocol copied!')
    }).catch(() => {
      showToast('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>📊</span>
            <span>ADA / APA Consensus Metabolic Monitoring Protocol</span>
          </h2>
          <button
            onClick={copyMetabolicGuideline}
            className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
          >
            📋 Copy Protocol
          </button>
        </div>

        {/* Monitoring Timeline Table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="p-2 font-bold text-gray-700 dark:text-gray-300">Metric</th>
                <th className="p-2 font-bold text-center">Baseline</th>
                <th className="p-2 font-bold text-center">4 Wks</th>
                <th className="p-2 font-bold text-center">8 Wks</th>
                <th className="p-2 font-bold text-center">12 Wks</th>
                <th className="p-2 font-bold text-center">Quarterly</th>
                <th className="p-2 font-bold text-center">Annually</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {monitoringCadence.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                  <td className="p-2 font-semibold text-gray-800 dark:text-gray-200">{row.parameter}</td>
                  <td className="p-2 text-center font-black text-indigo-600">{row.baseline}</td>
                  <td className="p-2 text-center text-gray-600 dark:text-gray-400">{row.w4}</td>
                  <td className="p-2 text-center text-gray-600 dark:text-gray-400">{row.w8}</td>
                  <td className="p-2 text-center font-bold text-purple-600">{row.w12}</td>
                  <td className="p-2 text-center text-gray-600 dark:text-gray-400">{row.quarterly}</td>
                  <td className="p-2 text-center font-black text-emerald-600">{row.annually}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Metformin Augmentation Guideline Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💊</span>
            <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
              Metformin Augmentation Directive
            </h3>
          </div>
          <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed mb-2 font-medium">
            Initiate Metformin when a patient experiences <strong>≥ 5% weight gain</strong> within the first 3 months of SGA therapy or develops prediabetes (HbA1c 5.7%–6.4% / Fasting glucose 100–125 mg/dL).
          </p>
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl p-3 text-xs text-gray-800 dark:text-gray-200 font-semibold">
            Dosing: Start 500 mg daily with evening meal × 1 week, then increase to 500 mg BID, titrating to target 1000 mg BID with meals as tolerated to attenuate SGA-induced insulin resistance and hepatic lipogenesis. Verify eGFR ≥ 30 mL/min.
          </div>
        </div>

        {/* SGA Metabolic Liability Hierarchy */}
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
          Second-Generation Antipsychotic Metabolic Risk Spectrum
        </h3>
        <div className="space-y-2">
          {sgaMetabolicTable.map((s, idx) => {
            const isHigh = s.risk === 'HIGH'
            const isMod = s.risk === 'MODERATE'
            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs"
              >
                <div>
                  <span className="font-extrabold text-gray-900 dark:text-white mr-1.5">{s.name}</span>
                  <span className="text-gray-400 dark:text-gray-500">({s.brand})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Weight: {s.weight}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isHigh
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : isMod
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {s.risk}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 8: Emergency Toxidromes Differential & Antidotes Playbook
// -------------------------------------------------------------
function EmergencyPlaybook({ navigate }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>🚨</span>
          <span>Emergency Psych Toxidrome Differential</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Key features distinguishing acute life-threatening psychiatric emergencies:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="p-2 font-bold text-gray-700 dark:text-gray-300">Toxidrome</th>
                <th className="p-2 font-bold text-gray-700 dark:text-gray-300">Neuromuscular</th>
                <th className="p-2 font-bold text-gray-700 dark:text-gray-300">Pupils / Skin</th>
                <th className="p-2 font-bold text-gray-700 dark:text-gray-300">First-Line Antidote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="p-2 font-black text-rose-700 dark:text-rose-400">Serotonin Syndrome</td>
                <td className="p-2">Hyperreflexia, Spontaneous Clonus, Tremor</td>
                <td className="p-2">Mydriasis, Diaphoresis</td>
                <td className="p-2 font-semibold">Cyproheptadine 12 mg PO + Cooling</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-purple-700 dark:text-purple-400">NMS</td>
                <td className="p-2">&quot;Lead-pipe&quot; Rigidity, Hyporeflexia</td>
                <td className="p-2">Normal Pupils, Diaphoresis</td>
                <td className="p-2 font-semibold">Dantrolene + Bromocriptine</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-amber-700 dark:text-amber-400">Anticholinergic Crisis</td>
                <td className="p-2">Myoclonus, Choreoathetosis</td>
                <td className="p-2">Mydriasis, Bone Dry / Red Skin</td>
                <td className="p-2 font-semibold">Physostigmine 1–2 mg IV</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-blue-700 dark:text-blue-400">Acute Dystonia</td>
                <td className="p-2">Oculogyric crisis, Torticolis</td>
                <td className="p-2">Normal Autonomics</td>
                <td className="p-2 font-semibold">Benztropine 1–2 mg IM</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-indigo-700 dark:text-indigo-400">Malignant Catatonia</td>
                <td className="p-2">Waxy flexibility, Mutism, Negativism</td>
                <td className="p-2">Autonomic Instability</td>
                <td className="p-2 font-semibold">Lorazepam 2 mg IV Challenge or ECT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
          Standardized Antidote Dosing Directives
        </h3>

        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-rose-950 dark:text-rose-200">Cyproheptadine (Serotonin Antagonist)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">Hunter Positive</span>
          </div>
          <p className="text-xs text-rose-900 dark:text-rose-300 font-medium leading-relaxed mb-2">
            Initial loading dose: 12 mg orally (crushed via NG tube if intubated), followed by 2 mg every 2 hours until clinical improvement. Maintenance: 8 mg every 6 hours.
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-purple-950 dark:text-purple-200">Dantrolene + Bromocriptine (NMS Rescue)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">Hyperthermic NMS</span>
          </div>
          <p className="text-xs text-purple-900 dark:text-purple-300 font-medium leading-relaxed mb-2">
            Dantrolene: 1 to 2.5 mg/kg IV bolus (repeat up to 10 mg/kg max). Bromocriptine: 2.5 mg PO/NG TID, titrate up to 10 mg TID. Discontinue all dopamine antagonists immediately.
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">Lithium Toxicity Hemodialysis Criteria</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">Renal Clearance</span>
          </div>
          <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium leading-relaxed mb-2">
            Mandatory emergent hemodialysis if serum Lithium &gt; 4.0 mEq/L (regardless of symptoms), or &gt; 2.5 mEq/L in the presence of severe neurotoxicity (stupor, seizures, ataxia) or renal failure.
          </p>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 9: Organ Impairment Dose Adjuster (Renal & Hepatic)
// -------------------------------------------------------------
function OrganAdjustmentTool() {
  const [renalTier, setRenalTier] = useState('moderate')
  const [hepaticTier, setHepaticTier] = useState('mild')

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🩺</span>
          <span>Renal eGFR Impairment Tier</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { id: 'normal', label: 'eGFR ≥ 60', sub: 'Normal' },
            { id: 'moderate', label: 'eGFR 30–59', sub: 'Moderate' },
            { id: 'severe', label: 'eGFR 15–29', sub: 'Severe' },
            { id: 'esrd', label: 'eGFR < 15', sub: 'Dialysis' },
          ].map(tier => (
            <button
              key={tier.id}
              onClick={() => setRenalTier(tier.id)}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                renalTier === tier.id
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
              }`}
            >
              <div className="text-xs">{tier.label}</div>
              <div className="text-[10px] opacity-75">{tier.sub}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
          <div className="font-bold text-gray-900 dark:text-white">Key Renal Adjustments:</div>
          {renalTier === 'moderate' && (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Lithium:</strong> Reduce initial dose by 25%–50%; monitor serum trough levels frequently.</li>
              <li><strong>Gabapentin / Pregabalin:</strong> Cap maximum daily dose to 50% of standard ceiling.</li>
              <li><strong>Paliperidone:</strong> Reduce initial dose to 3 mg/day (max 6 mg/day).</li>
            </ul>
          )}
          {renalTier === 'severe' && (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Lithium:</strong> Strictly avoid unless no viable alternative exists (reduce by 50%–75%).</li>
              <li><strong>Duloxetine:</strong> Avoid use (increased plasma levels and metabolite accumulation).</li>
              <li><strong>Paliperidone:</strong> Reduce initial dose to 1.5 mg/day (max 3 mg/day).</li>
            </ul>
          )}
          {renalTier === 'esrd' && (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Lithium:</strong> Strictly contraindicated except post-dialysis dosing with intensive nephrology oversight.</li>
              <li><strong>Bupropion:</strong> Reduce dose and frequency (max 100–150 mg every other day) due to seizure surge.</li>
              <li><strong>Renally Cleared Non-Hepatic:</strong> Prefer hepatic-cleared SSRIs (Sertraline) or SGAs (Aripiprazole, Olanzapine).</li>
            </ul>
          )}
          {renalTier === 'normal' && (
            <p className="text-gray-600 dark:text-gray-400">Standard prescribing guidelines apply. Maintain standard baseline renal surveillance.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🧬</span>
          <span>Child-Pugh Hepatic Classification</span>
        </h2>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'mild', label: 'Class A (5–6)', sub: 'Mild' },
            { id: 'moderate', label: 'Class B (7–9)', sub: 'Moderate' },
            { id: 'severe', label: 'Class C (10–15)', sub: 'Severe' },
          ].map(tier => (
            <button
              key={tier.id}
              onClick={() => setHepaticTier(tier.id)}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                hepaticTier === tier.id
                  ? 'bg-purple-700 text-white border-purple-700 font-bold shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'
              }`}
            >
              <div className="text-xs">{tier.label}</div>
              <div className="text-[10px] opacity-75">{tier.sub}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
          <div className="font-bold text-gray-900 dark:text-white">Key Hepatic Adjustments:</div>
          {hepaticTier === 'severe' && (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Duloxetine:</strong> STRICTLY CONTRAINDICATED (severe hepatotoxicity risk).</li>
              <li><strong>Valproate / Divalproex:</strong> STRICTLY CONTRAINDICATED (hepatic necrosis and failure).</li>
              <li><strong>Benzodiazepines:</strong> Avoid oxidatively cleared agents (Diazepam, Chlordiazepoxide, Clonazepam); if required, use LOT (Lorazepam, Oxazepam, Temazepam) due to direct glucuronidation.</li>
            </ul>
          )}
          {hepaticTier === 'moderate' && (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li><strong>Clozapine:</strong> Start at 12.5 mg; monitor hepatic transaminases weekly.</li>
              <li><strong>Antipsychotics:</strong> Initiate at 50% of standard starting dose.</li>
            </ul>
          )}
          {hepaticTier === 'mild' && (
            <p className="text-gray-600 dark:text-gray-400">Standard starting doses with conservative escalation. Monitor transaminases with Valproate or Duloxetine.</p>
          )}
        </div>
      </div>
    </div>
  )
}
