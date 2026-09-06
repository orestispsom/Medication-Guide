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
  const [comparisonMode, setComparisonMode] = useState('receptors') // 'receptors' | 'adverse'
  const [drugFilter, setDrugFilter] = useState('')

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

  return (
    <div className="max-w-full mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Clinical Comparison Matrix
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Side-by-side pharmacodynamics & adverse risk stratification across {drugs.length} medications
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl flex-shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setComparisonMode('receptors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'receptors'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🧬 Receptors & Ki
            </button>
            <button
              onClick={() => setComparisonMode('adverse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                comparisonMode === 'adverse'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🛡️ Adverse Footprint
            </button>
          </div>
        </div>

        {/* Family Tabs */}
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

        {/* Subgroup & Drug Search Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {subgroupsInFamily.length > 1 && (
            <select
              value={selectedSubgroupId}
              onChange={e => setSelectedSubgroupId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 ml-auto"
          />
        </div>
      </div>

      {/* Comparison Table */}
      {drugs.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xs bg-white mb-4">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/90 border-b border-gray-200">
                <th className="sticky left-0 bg-gray-50 z-20 px-4 py-3 text-left font-black text-gray-600 min-w-[140px] uppercase tracking-wider text-[10px]">
                  {comparisonMode === 'receptors' ? 'Receptor Target' : 'Adverse Domain'}
                </th>
                {drugs.map(drug => (
                  <th
                    key={drug.id}
                    onClick={() => navigate(`/drug/${drug.id}`)}
                    className="px-3 py-3 text-center font-extrabold text-gray-900 border-l border-gray-100 min-w-[100px] cursor-pointer hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                  >
                    <div className="text-xs font-black">{drug.name}</div>
                    {drug.targetDose && (
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">
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
                    <tr key={receptorId} className="hover:bg-gray-50/60 border-b border-gray-100">
                      <td
                        onClick={() => navigate(`/receptors/${receptorId}`)}
                        className="sticky left-0 bg-white z-10 px-4 py-2.5 font-bold border-r border-gray-100 cursor-pointer hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: recObj?.color || '#6366f1' }}
                          />
                          <span className="font-extrabold text-gray-900">{receptorId}</span>
                        </div>
                      </td>

                      {drugs.map(drug => {
                        const b = getBinding(drug, receptorId)
                        return (
                          <td key={drug.id} className="px-3 py-2.5 text-center border-l border-gray-100">
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
                  <tr key={domain} className="hover:bg-gray-50/60 border-b border-gray-100">
                    <td className="sticky left-0 bg-white z-10 px-4 py-2.5 font-bold text-gray-800 border-r border-gray-100 text-xs">
                      {domain}
                    </td>

                    {drugs.map(drug => {
                      const sev = getAdverseSeverity(drug, domain)
                      const badgeClass = getSeverityStyle(sev)
                      return (
                        <td key={drug.id} className="px-3 py-2.5 text-center border-l border-gray-100">
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
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <p className="text-sm text-gray-500">No drugs matching filter criteria in this family.</p>
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
