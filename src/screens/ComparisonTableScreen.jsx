import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import { getReceptorColor } from '../utils/receptorFamily'

// Helper to parse numerical Ki in nM for tie-breaking
function parseKiValue(kiStr) {
  if (!kiStr || typeof kiStr !== 'string') return Infinity
  if (kiStr.includes('<1') || /sub-?nano/i.test(kiStr)) return 0.1
  const match = kiStr.match(/([0-9.]+)/)
  if (!match) return Infinity
  let val = parseFloat(match[1])
  if (isNaN(val)) return Infinity
  if (kiStr.includes('μ') || kiStr.includes('uM') || kiStr.includes('M') || kiStr.includes('um')) {
    val *= 1000
  }
  return val
}

// Severity ranking score for sorting adverse effect rows
const SEVERITY_SCORES = {
  extreme: 8,
  critical: 8,
  severe: 7,
  'very high': 6,
  high: 5,
  moderate: 4,
  mod: 4,
  low: 3,
  mild: 3,
  'near zero': 2,
  sparing: 2,
  minimal: 2,
  absent: 2,
  pristine: 2,
  'n/a': 0,
}

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
  const [headToHeadSearch, setHeadToHeadSearch] = useState('')

  // Active column sort in Matrix Mode: { type: 'receptor' | 'adverse', id: string } | null
  const [activeSort, setActiveSort] = useState(null)

  // Head-to-head pinned drug IDs (default to first 2-3 of the family)
  const [pinnedDrugIds, setPinnedDrugIds] = useState(['clozapine', 'olanzapine', 'aripiprazole'])

  const currentFamily = useMemo(() => {
    return data.families.find(f => f.id === selectedFamilyId) || data.families[0]
  }, [selectedFamilyId])

  const subgroupsInFamily = useMemo(() => {
    return data.subgroups.filter(s => s.familyId === selectedFamilyId)
  }, [selectedFamilyId])

  // Drugs in current family / subgroup
  const rawFamilyDrugs = useMemo(() => {
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
    const firstWord = domain.toLowerCase().split(' ')[0]
    const af = (drug.adverseFootprint || []).find(a =>
      a.domain.toLowerCase().includes(firstWord) ||
      domain.toLowerCase().includes(a.domain.toLowerCase().split(' ')[0])
    )
    return af ? af.severity : 'N/A'
  }

  const getSeverityScore = (drug, domain) => {
    const sev = getAdverseSeverity(drug, domain)
    if (!sev || sev === 'N/A') return 0
    const s = sev.toLowerCase()
    for (const [key, score] of Object.entries(SEVERITY_SCORES)) {
      if (s.includes(key)) return score
    }
    return 1
  }

  const cleanSeverity = (sev) => {
    if (!sev) return ''
    const match = sev.match(/^(Extreme|Severe|Very High|High|Moderate|Low|Near Zero|Sparing|Minimal|Absent|Pristine)\b/i)
    return match ? match[1] : sev.split('(')[0].trim()
  }

  const getSeverityStyle = (severity) => {
    const s = (severity || '').toLowerCase()
    if (s.includes('extreme') || s.includes('critical')) return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 font-bold'
    if (s.includes('severe')) return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/60 font-bold'
    if (s.includes('very high')) return 'bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/60 font-bold'
    if (s.includes('high')) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 font-bold'
    if (s.includes('mod')) return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200/80 dark:border-yellow-900/60 font-semibold'
    if (s.includes('low') || s.includes('mild')) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 font-medium'
    if (s.includes('near zero') || s.includes('sparing') || s.includes('minimal') || s.includes('pristine')) return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 font-medium'
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60'
  }

  // Rearrange matrix drug columns based on activeSort (strongest first)
  const displayDrugs = useMemo(() => {
    if (!activeSort) return rawFamilyDrugs

    if (activeSort.type === 'receptor') {
      const recId = activeSort.id
      return [...rawFamilyDrugs].sort((a, b) => {
        const bindA = getBinding(a, recId)
        const bindB = getBinding(b, recId)
        const occA = bindA?.occupancy ?? -1
        const occB = bindB?.occupancy ?? -1
        if (occA !== occB) return occB - occA // highest occupancy first
        const kiA = parseKiValue(bindA?.ki)
        const kiB = parseKiValue(bindB?.ki)
        if (kiA !== kiB) return kiA - kiB // lowest Ki (highest affinity) first
        return a.name.localeCompare(b.name)
      })
    }

    if (activeSort.type === 'adverse') {
      const domain = activeSort.id
      return [...rawFamilyDrugs].sort((a, b) => {
        const scoreA = getSeverityScore(a, domain)
        const scoreB = getSeverityScore(b, domain)
        if (scoreA !== scoreB) return scoreB - scoreA // highest adverse severity first
        return a.name.localeCompare(b.name)
      })
    }

    return rawFamilyDrugs
  }, [rawFamilyDrugs, activeSort])

  // Collect all receptors present in at least one drug of this family
  const receptorIds = useMemo(() => {
    const set = new Set()
    rawFamilyDrugs.forEach(d => (d.receptors || []).forEach(r => set.add(r.receptor)))
    const canonicalOrder = data.receptors.map(r => r.id)
    return [...set].sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a)
      const idxB = canonicalOrder.indexOf(b)
      if (idxA === -1 && idxB === -1) return a.localeCompare(b)
      if (idxA === -1) return 1
      if (idxB === -1) return -1
      return idxA - idxB
    })
  }, [rawFamilyDrugs])

  // Pinned drugs objects for head-to-head
  const pinnedDrugs = useMemo(() => {
    return pinnedDrugIds.map(id => data.drugs.find(d => d.id === id)).filter(Boolean)
  }, [pinnedDrugIds])

  // Receptors present across any of the pinned drugs in head-to-head
  const pinnedReceptorIds = useMemo(() => {
    const set = new Set()
    pinnedDrugs.forEach(d => (d.receptors || []).forEach(r => set.add(r.receptor)))
    const canonicalOrder = data.receptors.map(r => r.id)
    return [...set].sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a)
      const idxB = canonicalOrder.indexOf(b)
      if (idxA === -1 && idxB === -1) return a.localeCompare(b)
      if (idxA === -1) return 1
      if (idxB === -1) return -1
      return idxA - idxB
    })
  }, [pinnedDrugs])

  // Available drug options for the selector in Head-to-Head mode
  const availableSelectorDrugs = useMemo(() => {
    const q = headToHeadSearch.trim().toLowerCase()
    let pool = data.drugs
    if (!q) {
      pool = data.drugs.filter(d => d.familyId === selectedFamilyId)
    } else {
      pool = data.drugs.filter(d => d.name.toLowerCase().includes(q) || (d.inn && d.inn.toLowerCase().includes(q)))
    }
    // Deduplicate by canonical name
    const seen = new Set()
    const unique = []
    pool.forEach(d => {
      const key = d.name.trim().toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(d)
      }
    })
    return unique
  }, [selectedFamilyId, headToHeadSearch])

  const togglePinDrug = (drugId) => {
    if (pinnedDrugIds.includes(drugId)) {
      setPinnedDrugIds(pinnedDrugIds.filter(id => id !== drugId))
    } else {
      if (pinnedDrugIds.length < 4) {
        setPinnedDrugIds([...pinnedDrugIds, drugId])
      }
    }
  }

  // Matrix column sorting handlers
  const handleReceptorClick = (recId) => {
    setActiveSort(prev => (prev?.type === 'receptor' && prev?.id === recId ? null : { type: 'receptor', id: recId }))
  }

  const handleReceptorDoubleClick = (recId) => {
    navigate(`/receptors/${recId}`)
  }

  const handleAdverseClick = (domain) => {
    setActiveSort(prev => (prev?.type === 'adverse' && prev?.id === domain ? null : { type: 'adverse', id: domain }))
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <BackButton />

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Clinical Comparison Matrix
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Side-by-side pharmacodynamics & adverse risk stratification across medications
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 p-1 rounded-2xl flex-shrink-0 self-start sm:self-auto gap-1 shadow-2xs">
            <button
              onClick={() => {
                setComparisonMode('receptors')
                setActiveSort(null)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'receptors'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🧬 Receptors
            </button>
            <button
              onClick={() => {
                setComparisonMode('adverse')
                setActiveSort(null)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'adverse'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🛡️ Adverse
            </button>
            <button
              onClick={() => {
                setComparisonMode('head-to-head')
                setActiveSort(null)
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                comparisonMode === 'head-to-head'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚖️ Head-to-Head ({pinnedDrugs.length})
            </button>
          </div>
        </div>

        {/* Family Tabs Bar — Always visible across all comparison modes */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-3">
          {data.families.map(fam => {
            const isSelected = selectedFamilyId === fam.id
            return (
              <button
                key={fam.id}
                onClick={() => {
                  setSelectedFamilyId(fam.id)
                  setSelectedSubgroupId('all')
                  setActiveSort(null)
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer"
                style={{
                  backgroundColor: isSelected ? fam.color : `${fam.color}10`,
                  color: isSelected ? '#ffffff' : fam.color,
                  borderColor: isSelected ? fam.color : `${fam.color}30`,
                }}
              >
                {fam.shortName || fam.name.split(' ')[0]}
              </button>
            )
          })}
        </div>

        {/* Subgroup & Drug Search Row (in Matrix Modes) */}
        {comparisonMode !== 'head-to-head' && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {subgroupsInFamily.length > 1 && (
                <select
                  value={selectedSubgroupId}
                  onChange={e => {
                    setSelectedSubgroupId(e.target.value)
                    setActiveSort(null)
                  }}
                  className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Subgroups ({subgroupsInFamily.length})</option>
                  {subgroupsInFamily.map(sg => (
                    <option key={sg.id} value={sg.id}>
                      {sg.name}
                    </option>
                  ))}
                </select>
              )}

              {activeSort && (
                <button
                  onClick={() => setActiveSort(null)}
                  className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Reset Sort (Sorted by {activeSort.id})</span>
                  <span>✕</span>
                </button>
              )}
            </div>

            <input
              type="text"
              value={drugFilter}
              onChange={e => setDrugFilter(e.target.value)}
              placeholder="Filter drug columns..."
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        )}
      </div>

      {/* Mode 1 & 2: Full Matrix Table */}
      {comparisonMode !== 'head-to-head' ? (
        displayDrugs.length > 0 ? (
          <div
            className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0b0f19] mb-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <table className="min-w-max border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#111827]/90 border-b border-slate-200 dark:border-slate-700">
                  <th className="sticky left-0 bg-slate-50 dark:bg-[#111827] z-20 px-4 py-3 text-left font-bold text-slate-500 dark:text-slate-400 min-w-[170px] uppercase tracking-wider text-xs border-r border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-0.5">
                      <span>{comparisonMode === 'receptors' ? 'Receptor Target' : 'Adverse Domain'}</span>
                      <span className="text-[10px] normal-case font-normal text-slate-400 dark:text-slate-500">
                        Tap row to rank · Double-click target to view profile
                      </span>
                    </div>
                  </th>
                  {displayDrugs.map(drug => (
                    <th
                      key={drug.id}
                      onClick={() => navigate(`/drug/${drug.id}`)}
                      className="px-3.5 py-3 text-center font-bold text-slate-900 dark:text-white border-l border-slate-200/80 dark:border-slate-800 min-w-[110px] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={`View ${drug.name} monograph`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{drug.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonMode === 'receptors' ? (
                  receptorIds.map(receptorId => {
                    const recColor = getReceptorColor(receptorId)
                    const isSorted = activeSort?.type === 'receptor' && activeSort?.id === receptorId

                    return (
                      <tr
                        key={receptorId}
                        className={`border-b transition-colors ${
                          isSorted
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <td
                          onClick={() => handleReceptorClick(receptorId)}
                          onDoubleClick={() => handleReceptorDoubleClick(receptorId)}
                          className="sticky left-0 bg-white dark:bg-[#0b0f19] z-10 px-4 py-2.5 font-bold border-r border-slate-200/80 dark:border-slate-800 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none transition-colors"
                          title="Click to rank drugs by affinity (strongest first) · Double-click to view target profile"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: recColor }}
                              />
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{receptorId}</span>
                            </div>
                            {isSorted && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                                ↓ Ranked
                              </span>
                            )}
                          </div>
                        </td>

                        {displayDrugs.map(drug => {
                          const b = getBinding(drug, receptorId)
                          return (
                            <td key={drug.id} className="px-3 py-2.5 text-center border-l border-slate-100 dark:border-slate-800">
                              {b ? (
                                <div className="flex flex-col items-center">
                                  <span
                                    className="text-xs font-black px-2.5 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: `${recColor}20`,
                                      color: recColor,
                                    }}
                                  >
                                    {b.occupancy}%
                                  </span>
                                  {b.ki && (
                                    <span className="text-xs text-slate-500 font-medium mt-0.5">
                                      {b.ki.replace(/sub-?nanomolar/gi, '<1nM')}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-medium">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                ) : (
                  standardAdverseDomains.map(domain => {
                    const isSorted = activeSort?.type === 'adverse' && activeSort?.id === domain

                    return (
                      <tr
                        key={domain}
                        className={`border-b transition-colors ${
                          isSorted
                            ? 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <td
                          onClick={() => handleAdverseClick(domain)}
                          className="sticky left-0 bg-white dark:bg-[#0b0f19] z-10 px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800 text-xs cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 select-none transition-colors"
                          title="Click to rank drugs by severity (highest risk first)"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{domain}</span>
                            {isSorted && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-orange-600 text-white shadow-2xs">
                                ↓ Ranked
                              </span>
                            )}
                          </div>
                        </td>

                        {displayDrugs.map(drug => {
                          const sev = getAdverseSeverity(drug, domain)
                          const badgeClass = getSeverityStyle(sev)
                          return (
                            <td key={drug.id} className="px-3 py-2.5 text-center border-l border-slate-100 dark:border-slate-800">
                              {sev && sev !== 'N/A' ? (
                                <span className={`text-xs px-2.5 py-0.5 rounded-md inline-block whitespace-nowrap ${badgeClass}`} title={sev}>
                                  {cleanSeverity(sev)}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 font-medium">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">No drugs matching filter criteria in this family.</p>
          </div>
        )
      ) : (
        /* Mode 3: Head-to-Head Side-by-Side Synchronized Comparison Table */
        <div className="max-w-4xl mx-auto">
          {/* Drug Selector Bar */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Select Up to 4 Drugs to Compare:
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {pinnedDrugs.length} of 4 selected · Switch families above or search across all drugs
                </span>
              </div>

              <input
                type="text"
                value={headToHeadSearch}
                onChange={e => setHeadToHeadSearch(e.target.value)}
                placeholder="Search any medication..."
                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {availableSelectorDrugs.map(d => {
                const isPinned = pinnedDrugIds.includes(d.id)
                return (
                  <button
                    key={d.id}
                    onClick={() => togglePinDrug(d.id)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-all border cursor-pointer ${
                      isPinned
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-2xs font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {isPinned ? '✓ ' : '+ '}
                    {d.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Synchronized Side-by-Side Comparison Table */}
          {pinnedDrugs.length > 0 ? (
            <div
              className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0b0f19] mb-6"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 dark:bg-[#111827]/90 border-b border-slate-200 dark:border-slate-700">
                    <th className="sticky left-0 bg-slate-50 dark:bg-[#111827] z-20 px-4 py-3.5 text-left font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 min-w-[170px] w-[200px]">
                      Comparison Metric
                    </th>
                    {pinnedDrugs.map(drug => (
                      <th
                        key={drug.id}
                        className="px-4 py-3.5 text-center font-bold border-l border-slate-200/80 dark:border-slate-800 min-w-[180px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => navigate(`/drug/${drug.id}`)}
                            className="font-display font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors truncate"
                            title={`View ${drug.name} monograph`}
                          >
                            {drug.name}
                          </span>
                          {pinnedDrugs.length > 1 && (
                            <button
                              onClick={() => togglePinDrug(drug.id)}
                              className="w-5 h-5 rounded-full bg-slate-200/70 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                              title="Remove from comparison"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* 1. Elimination Half-Life (T1/2) — clean text, no box */}
                  <tr className="border-b border-slate-200/80 dark:border-slate-800">
                    <td className="sticky left-0 bg-white dark:bg-[#0b0f19] z-10 px-4 py-3 font-bold text-slate-900 dark:text-white border-r border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
                      Elimination t½
                    </td>
                    {pinnedDrugs.map(drug => (
                      <td
                        key={drug.id}
                        className="px-4 py-3 text-center border-l border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {drug.halfLife || '—'}
                      </td>
                    ))}
                  </tr>

                  {/* 2. Receptor Binding Profile Section */}
                  <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <td
                      colSpan={pinnedDrugs.length + 1}
                      className="px-4 py-2 text-left font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      🧬 Receptor Binding Profile
                    </td>
                  </tr>

                  {pinnedReceptorIds.length > 0 ? (
                    pinnedReceptorIds.map(receptorId => {
                      const recColor = getReceptorColor(receptorId)
                      return (
                        <tr
                          key={receptorId}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80"
                        >
                          <td
                            onDoubleClick={() => navigate(`/receptors/${receptorId}`)}
                            className="sticky left-0 bg-white dark:bg-[#0b0f19] z-10 px-4 py-2.5 font-bold border-r border-slate-200/80 dark:border-slate-800 text-xs cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 select-none"
                            title="Double-click to view target monograph"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: recColor }}
                              />
                              <span className="font-bold text-slate-900 dark:text-white">{receptorId}</span>
                            </div>
                          </td>

                          {pinnedDrugs.map(drug => {
                            const binding = (drug.receptors || []).find(r => r.receptor === receptorId)
                            return (
                              <td
                                key={drug.id}
                                className="px-4 py-2.5 text-center border-l border-slate-100 dark:border-slate-800"
                              >
                                {binding ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2 flex-wrap justify-center">
                                      <span
                                        className="text-xs font-black px-2 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: `${recColor}18`,
                                          color: recColor,
                                        }}
                                      >
                                        {binding.occupancy}%
                                      </span>
                                      {binding.ki && (
                                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                          Ki: {binding.ki.replace(/sub-?nanomolar/gi, '<1nM')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${Math.min(Math.max(binding.occupancy, 8), 100)}%`,
                                          backgroundColor: recColor,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  ) : (
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td
                        colSpan={pinnedDrugs.length + 1}
                        className="px-4 py-3 text-center text-slate-400"
                      >
                        No receptor binding affinities documented for these medications
                      </td>
                    </tr>
                  )}

                  {/* 3. Adverse Effect Footprint Section */}
                  <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <td
                      colSpan={pinnedDrugs.length + 1}
                      className="px-4 py-2 text-left font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      🛡️ Adverse Safety Footprint
                    </td>
                  </tr>

                  {standardAdverseDomains.map(domain => (
                    <tr
                      key={domain}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <td className="sticky left-0 bg-white dark:bg-[#0b0f19] z-10 px-4 py-2.5 font-bold text-xs text-slate-800 dark:text-slate-200 border-r border-slate-200/80 dark:border-slate-800">
                        {domain}
                      </td>

                      {pinnedDrugs.map(drug => {
                        const sev = getAdverseSeverity(drug, domain)
                        const badgeClass = getSeverityStyle(sev)
                        return (
                          <td
                            key={drug.id}
                            className="px-4 py-2.5 text-center border-l border-slate-100 dark:border-slate-800"
                          >
                            {sev && sev !== 'N/A' ? (
                              <span
                                className={`text-xs px-2.5 py-1 rounded-md inline-block font-bold whitespace-nowrap ${badgeClass}`}
                                title={sev}
                              >
                                {cleanSeverity(sev)}
                              </span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-700">
              <p className="text-base font-bold text-slate-800 dark:text-white mb-1">No Medications Selected</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select 2 to 4 medications from the selector chips above to view their synchronized side-by-side comparison.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legend & Guide */}
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 pb-6">
        {comparisonMode === 'receptors' ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>Occupancy (%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ki</span>
              <span>Binding affinity (nM)</span>
            </span>
            <span className="text-slate-400">Tap receptor row to rank strongest first · Double-click to view target profile</span>
          </>
        ) : comparisonMode === 'adverse' ? (
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 font-bold text-xs">Severe / Extreme</span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/60 font-bold text-xs">Very High</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 font-bold text-xs">High</span>
            <span className="px-2.5 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border border-yellow-200/80 dark:border-yellow-900/60 font-semibold text-xs">Moderate</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60 font-medium text-xs">Low</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 font-medium text-xs">Near Zero</span>
          </>
        ) : (
          <>
            <span className="text-slate-400">
              Synchronized side-by-side comparison across half-life, receptor profiles, and adverse effect footprints
            </span>
          </>
        )}
      </div>

    </div>
  )
}
