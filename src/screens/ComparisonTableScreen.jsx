import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ComparisonTableScreen() {
  const { familyId: paramFamilyId } = useParams()
  const navigate = useNavigate()

  // Selected family (defaults to URL param or 'antipsychotics')
  const [selectedFamilyId, setSelectedFamilyId] = useState(
    paramFamilyId || data.families[0]?.id || 'antipsychotics'
  )
  const [selectedSubgroupId, setSelectedSubgroupId] = useState('all')
  const [comparisonMode, setComparisonMode] = useState('receptors') // 'receptors' | 'adverse' | 'head-to-head'
  const [drugFilter, setDrugFilter] = useState('')

  // Head-to-head pinned drug IDs (default to first 2-3 of the family)
  const [pinnedDrugIds, setPinnedDrugIds] = useState(['clozapine', 'olanzapine', 'aripiprazole'])

  const currentFamily = useMemo(() => {
    return data.families.find(f => f.id === selectedFamilyId) || data.families[0]
  }, [selectedFamilyId])

  const subgroupsInFamily = useMemo(() => {
    return data.subgroups.filter(s => s.familyId === selectedFamilyId)
  }, [selectedFamilyId])

  // Drugs in current family / subgroup
  const drugs = useMemo(() => {
    return data.drugs.filter(d => {
      if (d.familyId !== selectedFamilyId) return false
      if (selectedSubgroupId !== 'all' && d.subgroupId !== selectedSubgroupId) return false
      if (drugFilter.trim()) {
        const q = drugFilter.toLowerCase().trim()
        return d.name.toLowerCase().includes(q) || (d.brand && d.brand.toLowerCase().includes(q))
      }
      return true
    })
  }, [selectedFamilyId, selectedSubgroupId, drugFilter])

  // Pinned drugs objects for head-to-head
  const pinnedDrugs = useMemo(() => {
    return pinnedDrugIds.map(id => data.drugs.find(d => d.id === id)).filter(Boolean)
  }, [pinnedDrugIds])

  // Collect all receptors present in at least one drug of this family
  const receptorIds = useMemo(() => {
    const set = new Set()
    drugs.forEach(d => (d.receptors || []).forEach(r => set.add(r.receptor)))
    const canonicalOrder = data.receptors.map(r => r.id)
    return [...set].sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a)
      const idxB = canonicalOrder.indexOf(b)
      if (idxA === -1 && idxB === -1) return a.localeCompare(b)
      if (idxA === -1) return 1
      if (idxB === -1) return -1
      return idxA - idxB
    })
  }, [drugs])

  // Standard 8 adverse domains
  const standardAdverseDomains = [
    'Sedation & Somnolence',
    'Weight Gain & Metabolic Risk',
    'Anticholinergic Toxicity',
    'Orthostatic Dizziness',
    'Seizure Induction (Dose-Dependent)',
    'Cardiac QTc Prolongation',
    'Extrapyramidal Symptoms (EPS)',
    'Prolactin Elevation',
  ]

  const getBinding = (drug, receptorId) => {
    const r = (drug.receptors || []).find(rec => rec.receptor === receptorId)
    return r || null
  }

  const getAdverseSeverity = (drug, domain) => {
    const af = (drug.adverseFootprint || []).find(a =>
      a.domain.toLowerCase().includes(domain.toLowerCase().split(' ')[0]) ||
      domain.toLowerCase().includes(a.domain.toLowerCase().split(' ')[0])
    )
    return af ? af.severity : 'N/A'
  }

  const getSeverityStyle = (severity) => {
    const s = (severity || '').toLowerCase()
    if (s.includes('severe')) return 'bg-red-500 text-white font-black'
    if (s.includes('very high')) return 'bg-orange-500 text-white font-bold'
    if (s.includes('high')) return 'bg-amber-500 text-white font-bold'
    if (s.includes('mod')) return 'bg-yellow-400 text-gray-900 font-semibold'
    if (s.includes('low')) return 'bg-emerald-500 text-white font-medium'
    if (s.includes('near zero') || s.includes('sparing') || s.includes('minimal')) return 'bg-blue-400 text-white font-medium'
    return 'bg-gray-100 text-gray-400'
  }

  const togglePinDrug = (drugId) => {
    if (pinnedDrugIds.includes(drugId)) {
      if (pinnedDrugIds.length > 1) {
        setPinnedDrugIds(pinnedDrugIds.filter(id => id !== drugId))
      }
    } else {
      if (pinnedDrugIds.length < 4) {
        setPinnedDrugIds([...pinnedDrugIds, drugId])
      }
    }
  }

  return (
    <div className="max-w-full mx-auto px-4 py-6 pb-28">
      <div className="max-w-4xl mx-auto">
        <BackButton />

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Clinical Comparison Matrix
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Side-by-side pharmacodynamics & adverse risk stratification across {drugs.length} medications
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex-shrink-0 self-start sm:self-auto gap-0.5">
            <button
              onClick={() => setComparisonMode('receptors')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                comparisonMode === 'receptors'
                  ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🧬 Receptors
            </button>
            <button
              onClick={() => setComparisonMode('adverse')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                comparisonMode === 'adverse'
                  ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🛡️ Adverse
            </button>
            <button
              onClick={() => setComparisonMode('head-to-head')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                comparisonMode === 'head-to-head'
                  ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ⚖️ Head-to-Head ({pinnedDrugs.length})
            </button>
          </div>
        </div>

        {/* Family Tabs */}
        {comparisonMode !== 'head-to-head' && (
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-3">
            {data.families.map(fam => {
              const isSelected = selectedFamilyId === fam.id
              return (
                <button
                  key={fam.id}
                  onClick={() => {
                    setSelectedFamilyId(fam.id)
                    setSelectedSubgroupId('all')
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
                  style={{
                    backgroundColor: isSelected ? fam.color : fam.color + '10',
                    color: isSelected ? '#ffffff' : fam.color,
                    borderColor: isSelected ? fam.color : fam.color + '30',
                  }}
                >
                  {fam.shortName || fam.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        )}

        {/* Subgroup & Drug Search Row (in Matrix Modes) */}
        {comparisonMode !== 'head-to-head' && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {subgroupsInFamily.length > 1 && (
              <select
                value={selectedSubgroupId}
                onChange={e => setSelectedSubgroupId(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Subgroups ({subgroupsInFamily.length})</option>
                {subgroupsInFamily.map(sg => (
                  <option key={sg.id} value={sg.id}>
                    {sg.name}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={drugFilter}
              onChange={e => setDrugFilter(e.target.value)}
              placeholder="Filter drug columns..."
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 ml-auto placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        )}
      </div>

      {/* Mode 1 & 2: Full Matrix Table */}
      {comparisonMode !== 'head-to-head' ? (
        drugs.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs bg-white dark:bg-gray-900 mb-4">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 bg-gray-50 dark:bg-gray-800 z-20 px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 min-w-[140px] uppercase tracking-wider text-[10px]">
                    {comparisonMode === 'receptors' ? 'Receptor Target' : 'Adverse Domain'}
                  </th>
                  {drugs.map(drug => (
                    <th
                      key={drug.id}
                      onClick={() => navigate(`/drug/${drug.id}`)}
                      className="px-3 py-3 text-center font-extrabold text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-800 min-w-[100px] cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-gray-800/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <div className="text-xs font-black">{drug.name}</div>
                      {drug.targetDose && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-normal mt-0.5">
                          {drug.targetDose.split('·')[0]}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonMode === 'receptors' ? (
                  receptorIds.map(receptorId => {
                    const recObj = data.receptors.find(r => r.id === receptorId)
                    return (
                      <tr key={receptorId} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <td
                          onClick={() => navigate(`/receptors/${receptorId}`)}
                          className="sticky left-0 bg-white dark:bg-gray-900 z-10 px-4 py-2.5 font-bold border-r border-gray-100 dark:border-gray-800 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: recObj?.color || '#6366f1' }}
                            />
                            <span className="font-extrabold text-gray-900 dark:text-white">{receptorId}</span>
                          </div>
                        </td>

                        {drugs.map(drug => {
                          const b = getBinding(drug, receptorId)
                          return (
                            <td key={drug.id} className="px-3 py-2.5 text-center border-l border-gray-100 dark:border-gray-800">
                              {b ? (
                                <div className="flex flex-col items-center">
                                  <span
                                    className="text-[11px] font-black px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: (recObj?.color || '#6366f1') + '20',
                                      color: recObj?.color || '#6366f1',
                                    }}
                                  >
                                    {b.occupancy}%
                                  </span>
                                  {b.ki && (
                                    <span className="text-[9px] text-gray-400 font-medium mt-0.5">
                                      {b.ki}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300 font-medium">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                ) : (
                  standardAdverseDomains.map(domain => (
                    <tr key={domain} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <td className="sticky left-0 bg-white dark:bg-gray-900 z-10 px-4 py-2.5 font-bold text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-800 text-xs">
                        {domain}
                      </td>

                      {drugs.map(drug => {
                        const sev = getAdverseSeverity(drug, domain)
                        const badgeClass = getSeverityStyle(sev)
                        return (
                          <td key={drug.id} className="px-3 py-2.5 text-center border-l border-gray-100 dark:border-gray-800">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md inline-block whitespace-nowrap ${badgeClass}`}>
                              {sev}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No drugs matching filter criteria in this family.</p>
          </div>
        )
      ) : (
        /* Mode 3: Head-to-Head Side-by-Side View */
        <div className="max-w-4xl mx-auto">
          {/* Drug Selector Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-6 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select Up to 4 Drugs to Compare:
              </span>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                {pinnedDrugs.length} of 4 selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.drugs.slice(0, 16).map(d => {
                const isPinned = pinnedDrugIds.includes(d.id)
                return (
                  <button
                    key={d.id}
                    onClick={() => togglePinDrug(d.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-xl transition-all border ${
                      isPinned
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400'
                    }`}
                  >
                    {isPinned ? '✓ ' : '+ '}
                    {d.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Side-by-Side Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {pinnedDrugs.map(drug => {
              const family = data.families.find(f => f.id === drug.familyId)
              return (
                <div
                  key={drug.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (family?.color || '#6366f1') + '15',
                          color: family?.color || '#6366f1',
                        }}
                      >
                        {drug.subgroup}
                      </span>
                      <button
                        onClick={() => togglePinDrug(drug.id)}
                        className="text-xs text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold"
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                    </div>

                    <h3
                      onClick={() => navigate(`/drug/${drug.id}`)}
                      className="text-lg font-black text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors mb-1"
                    >
                      {drug.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{drug.brand?.split('·')[0]}</p>

                    {/* Dosing & Half Life */}
                    <div className="space-y-1.5 mb-4 text-xs bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Target Dose:</span>
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">{drug.targetDose || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block">Elimination t½:</span>
                        <span className="font-semibold text-amber-800 dark:text-amber-300">{drug.halfLife || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Adverse Footprint Mini Matrix */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">
                        Adverse Safety Footprint:
                      </span>
                      <div className="space-y-1">
                        {standardAdverseDomains.slice(0, 5).map(domain => {
                          const sev = getAdverseSeverity(drug, domain)
                          return (
                            <div key={domain} className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{domain.split('&')[0]}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${getSeverityStyle(sev)}`}>
                                {sev}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/drug/${drug.id}`)}
                    className="w-full mt-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition-colors text-center"
                  >
                    View Full Monograph →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend & Guide */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 pt-2 pb-6">
        {comparisonMode === 'receptors' ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Occupancy (%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-700">Ki</span>
              <span>Binding affinity (nM)</span>
            </span>
            <span className="text-gray-400">Click any column header to view full drug monograph</span>
          </>
        ) : (
          <>
            <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[10px]">Severe</span>
            <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">Very High</span>
            <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">High</span>
            <span className="px-2 py-0.5 rounded bg-yellow-400 text-gray-900 font-semibold text-[10px]">Moderate</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-medium text-[10px]">Low</span>
            <span className="px-2 py-0.5 rounded bg-blue-400 text-white font-medium text-[10px]">Near Zero / Sparing</span>
          </>
        )}
      </div>
    </div>
  )
}
