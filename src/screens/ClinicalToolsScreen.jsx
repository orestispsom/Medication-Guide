import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ClinicalToolsScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('cyp') // 'cyp' | 'qtc' | 'bzd' | 'emergency' | 'renal'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <BackButton title="Clinical Decision Tools" />

      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <span>🛠️</span>
          <span>Point-of-Care Clinical Decision Support</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Clinical Tools & Calculators
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Pharmacokinetic collision checks, cardiac risk stackers, equivalency converters, and emergency playbooks
        </p>
      </div>

      {/* Segmented Tool Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto hide-scrollbar">
        {[
          { id: 'cyp', label: 'CYP450 Checker', icon: '⚡' },
          { id: 'qtc', label: 'QTc Risk Stacker', icon: '❤️' },
          { id: 'bzd', label: 'BZD Equivalency', icon: '⚖️' },
          { id: 'emergency', label: 'Emergency Playbook', icon: '🚨' },
          { id: 'renal', label: 'Organ Adjuster', icon: '🩺' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tool View */}
      {activeTab === 'cyp' && <CypInteractionChecker />}
      {activeTab === 'qtc' && <QtcRiskStacker />}
      {activeTab === 'bzd' && <BzdEquivalencyCalculator navigate={navigate} />}
      {activeTab === 'emergency' && <EmergencyPlaybook navigate={navigate} />}
      {activeTab === 'renal' && <OrganAdjustmentTool />}
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 1: CYP450 Interaction & Co-Prescribing Checker
// -------------------------------------------------------------
function CypInteractionChecker() {
  const [selectedDrugIds, setSelectedDrugIds] = useState(['clozapine'])
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

  // Detect specific high-yield clinical collisions
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

    // 2. Potent CYP2D6 Inhibitors (Fluoxetine, Paroxetine, Bupropion)
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

    // 3. Fluvoxamine (1A2 + 2C19 + 3A4)
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

    // 4. Valproate + Lamotrigine (UGT1A4)
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
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Select Medications to Screen ({selectedDrugIds.length}/5)</span>
        </h2>

        {/* Selected Medication Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedDrugIds.map(id => {
            const d = data.drugs.find(drug => drug.id === id)
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold"
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

        {/* Tobacco Smoking Modifier */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚬</span>
            <div>
              <span className="text-xs font-bold text-amber-950 block">Tobacco / Cigarette Smoking Status</span>
              <span className="text-[10px] text-amber-800">Hydrocarbon inducer of CYP1A2 clearance</span>
            </div>
          </div>
          <button
            onClick={() => setHasSmoking(!hasSmoking)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              hasSmoking
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-amber-400'
            }`}
          >
            {hasSmoking ? 'Active Smoker' : 'Non-Smoker'}
          </button>
        </div>

        {/* Search / Add Drug Input */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search medication to add..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Drug Selection Pills */}
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
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 font-medium'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {d.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Detected Interaction Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Pharmacokinetic Screening Results ({detectedInteractions.length} Flagged)
        </h3>

        {detectedInteractions.length > 0 ? (
          detectedInteractions.map((alert, i) => {
            const isCrit = alert.severity === 'CRITICAL'
            return (
              <div
                key={i}
                className={`rounded-3xl p-5 border-2 shadow-xs ${
                  isCrit ? 'bg-rose-50 border-rose-300' : 'bg-amber-50/80 border-amber-200'
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
                  <h4 className="font-extrabold text-sm text-gray-900">
                    {alert.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-700 font-medium mb-2">
                  <span className="font-bold text-gray-900">Mechanism:</span> {alert.mechanism}
                </p>
                <div className="bg-white/80 rounded-2xl p-3 border border-gray-200/60 text-xs text-gray-900 font-semibold leading-relaxed">
                  <span className="font-black text-indigo-900">Clinical Directive: </span>
                  {alert.directive}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center">
            <span className="text-2xl block mb-1">✅</span>
            <h4 className="font-extrabold text-emerald-900 text-sm mb-1">
              No Major CYP450 Collisions Detected
            </h4>
            <p className="text-xs text-emerald-800">
              The selected combination does not exhibit catastrophic CYP1A2, 2D6, 3A4, or UGT metabolic antagonism based on compendium benchmarks. Always verify patient-specific organ function and clinical tolerability.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 2: Additive QTc Cardiac Risk Stacker & Tisdale Framework
// -------------------------------------------------------------
function QtcRiskStacker() {
  const [selectedDrugIds, setSelectedDrugIds] = useState(['citalopram', 'quetiapine'])
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

  // Calculate Tisdale score and medication QTc burden
  const qtcAssessment = useMemo(() => {
    let score = 0
    if (riskFactors.age65) score += 1
    if (riskFactors.female) score += 1
    if (riskFactors.hypokalemia) score += 2
    if (riskFactors.hypomagnesemia) score += 1
    if (riskFactors.baselineQtc) score += 2
    if (riskFactors.bradycardia) score += 1

    const drugs = selectedDrugIds.map(id => data.drugs.find(d => d.id === id)).filter(Boolean)

    // Analyze QTc footprint for each drug
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
    let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200'
    let recommendation = 'Standard clinical vigilance. Baseline ECG recommended if prior cardiac history.'

    if (score >= 11) {
      riskCategory = 'HIGH RISK (Torsades Hazard)'
      badgeClass = 'bg-red-100 text-red-900 border-red-300'
      recommendation = 'Mandatory baseline ECG and weekly telemetry/repeat ECG until steady state. Replete K+ ≥ 4.0 mEq/L and Mg2+ ≥ 2.0 mg/dL. Consider selecting non-prolonging psychotropic alternative (e.g. Aripiprazole, Lurasidone, Bupropion).'
    } else if (score >= 7) {
      riskCategory = 'MODERATE RISK'
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-200'
      recommendation = 'Obtain baseline 12-lead ECG. Recheck electrolytes (potassium, magnesium). Repeat ECG 1–2 weeks post-titration.'
    }

    return { score, riskCategory, badgeClass, recommendation, drugItems }
  }, [selectedDrugIds, riskFactors])

  return (
    <div className="space-y-6">
      {/* Risk Score Summary Banner */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
              Cumulative Tisdale QTc Stratification
            </span>
            <h2 className="text-xl font-black text-gray-900">
              Total Score: {qtcAssessment.score} Points
            </h2>
          </div>
          <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${qtcAssessment.badgeClass}`}>
            {qtcAssessment.riskCategory}
          </span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 text-xs text-gray-800 font-medium leading-relaxed mb-4">
          <span className="font-bold text-indigo-900">Clinical Protocol: </span>
          {qtcAssessment.recommendation}
        </div>

        {/* Electrolyte Targets */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-blue-900 uppercase block">Target Potassium (K+):</span>
            <span className="font-black text-blue-950">≥ 4.0 mEq/L</span>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-2.5">
            <span className="text-[10px] font-bold text-purple-900 uppercase block">Target Magnesium (Mg2+):</span>
            <span className="font-black text-purple-950">≥ 2.0 mg/dL</span>
          </div>
        </div>
      </div>

      {/* Patient Risk Factor Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                  : 'bg-gray-50 border-gray-200 text-gray-600 font-medium'
              }`}
            >
              <span>{item.label}</span>
              <span>{riskFactors[item.key] ? '☑' : '☐'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Monitored Medications List */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Medications in Current Regimen
        </h3>
        <div className="space-y-2">
          {qtcAssessment.drugItems.map((d, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
              <span className="font-extrabold text-gray-900">{d.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border text-gray-700">
                QTc Liability: {d.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 3: Benzodiazepine Diazepam Milligram Equivalent (DME)
// -------------------------------------------------------------
function BzdEquivalencyCalculator({ navigate }) {
  const [selectedBzd, setSelectedBzd] = useState('lorazepam')
  const [dose, setDose] = useState(2)

  // Standard equianalgesic ratios to 10 mg Diazepam
  const bzdData = {
    alprazolam: { name: 'Alprazolam (Xanax)', ratio: 0.5, halfLife: '12h (6–20h)', activeMetabolite: 'None' },
    clonazepam: { name: 'Clonazepam (Klonopin)', ratio: 0.5, halfLife: '30–40h', activeMetabolite: 'Inactive 7-amino' },
    lorazepam: { name: 'Lorazepam (Ativan)', ratio: 1.0, halfLife: '12–18h (Direct glucuronidation)', activeMetabolite: 'None' },
    diazepam: { name: 'Diazepam (Valium)', ratio: 10.0, halfLife: '20–50h (Nordiazepam: 100h)', activeMetabolite: 'Desmethyldiazepam' },
    chlordiazepoxide: { name: 'Chlordiazepoxide (Librium)', ratio: 25.0, halfLife: '24–48h', activeMetabolite: 'Demoxepam' },
    oxazepam: { name: 'Oxazepam (Serax)', ratio: 20.0, halfLife: '8–12h (Direct glucuronidation)', activeMetabolite: 'None' },
    temazepam: { name: 'Temazepam (Restoril)', ratio: 20.0, halfLife: '8–15h', activeMetabolite: 'None' },
  }

  const currentBzd = bzdData[selectedBzd]
  const diazepamEquiv = useMemo(() => {
    const val = (parseFloat(dose) || 0) * (10.0 / currentBzd.ratio)
    return Math.round(val * 10) / 10
  }, [dose, currentBzd])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <span>⚖️</span>
          <span>Diazepam Milligram Equivalency (The Ashton Paradigm)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Current Benzodiazepine:</label>
            <select
              value={selectedBzd}
              onChange={e => setSelectedBzd(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(bzdData).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Total Daily Dose (mg/day):</label>
            <input
              type="number"
              step="0.25"
              min="0"
              value={dose}
              onChange={e => setDose(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Calculation Result Display */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-3xl p-5 text-center mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">
            Calculated Diazepam Equivalent
          </span>
          <div className="text-3xl font-black text-purple-950">
            {diazepamEquiv} mg Diazepam / day
          </div>
          <p className="text-xs text-purple-800 font-medium mt-1">
            {dose} mg of {currentBzd.name} = {diazepamEquiv} mg Diazepam
          </p>
        </div>

        {/* Pharmacokinetic Notes */}
        <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-5">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Elimination Half-Life:</span>
            <span className="font-bold text-gray-900">{currentBzd.halfLife}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Active Metabolite:</span>
            <span className="font-bold text-gray-900">{currentBzd.activeMetabolite}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Hepatic Metabolism:</span>
            <span className="font-bold text-gray-900">
              {['lorazepam', 'oxazepam', 'temazepam'].includes(selectedBzd)
                ? 'LOT: Direct Glucuronidation (Safer in liver disease)'
                : 'CYP3A4 / CYP2C19 Phase I Oxidation'}
            </span>
          </div>
        </div>

        {/* Launch Protocol 15 Button */}
        <button
          onClick={() => navigate('/cross-titration/protocol-10-long-term-benzodiazepine-deprescribing-the-ashton-manual-paradigm')}
          className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all text-center"
        >
          Launch Ashton Manual Deprescribing Protocol →
        </button>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 4: Emergency Toxidromes Differential & Antidotes Playbook
// -------------------------------------------------------------
function EmergencyPlaybook({ navigate }) {
  return (
    <div className="space-y-6">
      {/* Differential Table */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>🚨</span>
          <span>Emergency Psych Toxidrome Differential</span>
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Key features distinguishing acute life-threatening psychiatric emergencies:
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-2 font-bold text-gray-700">Toxidrome</th>
                <th className="p-2 font-bold text-gray-700">Neuromuscular</th>
                <th className="p-2 font-bold text-gray-700">Pupils / Skin</th>
                <th className="p-2 font-bold text-gray-700">First-Line Antidote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-2 font-black text-rose-700">Serotonin Syndrome</td>
                <td className="p-2">Hyperreflexia, Spontaneous Clonus, Tremor</td>
                <td className="p-2">Mydriasis, Diaphoresis</td>
                <td className="p-2 font-semibold">Cyproheptadine 12 mg PO + Cooling</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-purple-700">NMS</td>
                <td className="p-2">&quot;Lead-pipe&quot; Rigidity, Hyporeflexia</td>
                <td className="p-2">Normal Pupils, Diaphoresis</td>
                <td className="p-2 font-semibold">Dantrolene + Bromocriptine</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-amber-700">Anticholinergic Crisis</td>
                <td className="p-2">Myoclonus, Choreoathetosis</td>
                <td className="p-2">Mydriasis, Bone Dry / Red Skin</td>
                <td className="p-2 font-semibold">Physostigmine 1–2 mg IV</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-blue-700">Acute Dystonia</td>
                <td className="p-2">Oculogyric crisis, Torticolis</td>
                <td className="p-2">Normal Autonomics</td>
                <td className="p-2 font-semibold">Benztropine 1–2 mg IM</td>
              </tr>
              <tr>
                <td className="p-2 font-black text-indigo-700">Malignant Catatonia</td>
                <td className="p-2">Waxy flexibility, Mutism, Negativism</td>
                <td className="p-2">Autonomic Instability</td>
                <td className="p-2 font-semibold">Lorazepam 2 mg IV Challenge or ECT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Yield Antidote Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Standardized Antidote Dosing Directives
        </h3>

        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-rose-950">Cyproheptadine (Serotonin Antagonist)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">Hunter Positive</span>
          </div>
          <p className="text-xs text-rose-900 font-medium leading-relaxed mb-2">
            Initial loading dose: 12 mg orally (crushed via NG tube if intubated), followed by 2 mg every 2 hours until clinical improvement. Maintenance: 8 mg every 6 hours.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-purple-950">Dantrolene + Bromocriptine (NMS Rescue)</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">Hyperthermic NMS</span>
          </div>
          <p className="text-xs text-purple-900 font-medium leading-relaxed mb-2">
            Dantrolene: 1 to 2.5 mg/kg IV bolus (repeat up to 10 mg/kg max). Bromocriptine: 2.5 mg PO/NG TID, titrate up to 10 mg TID. Discontinue all dopamine antagonists immediately.
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-extrabold text-sm text-indigo-950">Lithium Toxicity Hemodialysis Criteria</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">Renal Clearance</span>
          </div>
          <p className="text-xs text-indigo-900 font-medium leading-relaxed mb-2">
            Mandatory emergent hemodialysis if serum Lithium &gt; 4.0 mEq/L (regardless of symptoms), or &gt; 2.5 mEq/L in the presence of severe neurotoxicity (stupor, seizures, ataxia) or renal failure.
          </p>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TOOL 5: Organ Impairment Dose Adjuster (Renal & Hepatic)
// -------------------------------------------------------------
function OrganAdjustmentTool() {
  const [renalTier, setRenalTier] = useState('moderate') // 'normal' | 'moderate' | 'severe' | 'esrd'
  const [hepaticTier, setHepaticTier] = useState('mild') // 'mild' | 'moderate' | 'severe'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300'
              }`}
            >
              <div className="text-xs">{tier.label}</div>
              <div className="text-[10px] opacity-75">{tier.sub}</div>
            </button>
          ))}
        </div>

        {/* Renal Directives */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
          <div className="font-bold text-gray-900">Key Renal Adjustments:</div>
          {renalTier === 'moderate' && (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Lithium:</strong> Reduce initial dose by 25%–50%; monitor serum trough levels frequently.</li>
              <li><strong>Gabapentin / Pregabalin:</strong> Cap maximum daily dose to 50% of standard ceiling.</li>
              <li><strong>Paliperidone:</strong> Reduce initial dose to 3 mg/day (max 6 mg/day).</li>
            </ul>
          )}
          {renalTier === 'severe' && (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Lithium:</strong> Strictly avoid unless no viable alternative exists (reduce by 50%–75%).</li>
              <li><strong>Duloxetine:</strong> Avoid use (increased plasma levels and metabolite accumulation).</li>
              <li><strong>Paliperidone:</strong> Reduce initial dose to 1.5 mg/day (max 3 mg/day).</li>
            </ul>
          )}
          {renalTier === 'esrd' && (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Lithium:</strong> Strictly contraindicated except post-dialysis dosing with intensive nephrology oversight.</li>
              <li><strong>Bupropion:</strong> Reduce dose and frequency (max 100–150 mg every other day) due to seizure surge.</li>
              <li><strong>Renally Cleared Non-Hepatic:</strong> Prefer hepatic-cleared SSRIs (Sertraline) or SGAs (Aripiprazole, Olanzapine).</li>
            </ul>
          )}
          {renalTier === 'normal' && (
            <p className="text-gray-600">Standard prescribing guidelines apply. Maintain standard baseline renal surveillance.</p>
          )}
        </div>
      </div>

      {/* Hepatic Impairment */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="text-xs">{tier.label}</div>
              <div className="text-[10px] opacity-75">{tier.sub}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
          <div className="font-bold text-gray-900">Key Hepatic Adjustments:</div>
          {hepaticTier === 'severe' && (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Duloxetine:</strong> STRICTLY CONTRAINDICATED (severe hepatotoxicity risk).</li>
              <li><strong>Valproate / Divalproex:</strong> STRICTLY CONTRAINDICATED (hepatic necrosis and failure).</li>
              <li><strong>Benzodiazepines:</strong> Avoid oxidatively cleared agents (Diazepam, Chlordiazepoxide, Clonazepam); if required, use LOT (Lorazepam, Oxazepam, Temazepam) due to direct glucuronidation.</li>
            </ul>
          )}
          {hepaticTier === 'moderate' && (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Clozapine:</strong> Start at 12.5 mg; monitor hepatic transaminases weekly.</li>
              <li><strong>Antipsychotics:</strong> Initiate at 50% of standard starting dose.</li>
            </ul>
          )}
          {hepaticTier === 'mild' && (
            <p className="text-gray-600">Standard starting doses with conservative escalation. Monitor transaminases with Valproate or Duloxetine.</p>
          )}
        </div>
      </div>
    </div>
  )
}
