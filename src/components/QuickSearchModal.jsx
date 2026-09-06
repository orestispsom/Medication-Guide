import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function QuickSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      // Open with Ctrl+K or /
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else isOpen = true
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { drugs: [], protocols: [], receptors: [] }

    const drugs = data.drugs
      .filter(d => {
        const nameMatch = d.name.toLowerCase().includes(q)
        const brandMatch = d.brand && d.brand.toLowerCase().includes(q)
        const subgroupMatch = d.subgroup && d.subgroup.toLowerCase().includes(q)
        const indicationMatch = d.indications && d.indications.some(ind => ind.toLowerCase().includes(q))
        return nameMatch || brandMatch || subgroupMatch || indicationMatch
      })
      .slice(0, 5)

    const protocols = (data.protocols || [])
      .filter(p => {
        const titleMatch = p.title.toLowerCase().includes(q)
        const transMatch = p.transitionTitle && p.transitionTitle.toLowerCase().includes(q)
        return titleMatch || transMatch
      })
      .slice(0, 3)

    const receptors = data.receptors
      .filter(r => {
        const idMatch = r.id.toLowerCase().includes(q)
        const nameMatch = r.fullName.toLowerCase().includes(q)
        return idMatch || nameMatch
      })
      .slice(0, 3)

    return { drugs, protocols, receptors }
  }, [query])

  if (!isOpen) return null

  const handleSelectDrug = (id) => {
    onClose()
    navigate(`/drug/${id}`)
  }

  const handleSelectProtocol = (id) => {
    onClose()
    navigate(`/cross-titration/${id}`)
  }

  const handleSelectReceptor = (id) => {
    onClose()
    navigate(`/receptors/${id}`)
  }

  const hasResults =
    results.drugs.length > 0 || results.protocols.length > 0 || results.receptors.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/40 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-slate-400 dark:text-slate-500 text-lg mr-3">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search medications, switch protocols, receptors..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-900 dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
          {query.trim() && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No results found for &quot;{query}&quot;.
            </div>
          )}

          {!query.trim() && (
            <div className="py-6 px-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Quick Jump Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {['Clozapine', 'Lithium', 'Escitalopram', 'Cobenfy', 'Bupropion', 'Aripiprazole', '5-HT2A', 'D2'].map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-750 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drugs Category */}
          {results.drugs.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>💊</span>
                <span>Medications</span>
              </p>
              <div className="space-y-1">
                {results.drugs.map(drug => (
                  <button
                    key={drug.id}
                    onClick={() => handleSelectDrug(drug.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            ({drug.brand.replace('US:', '').split('·')[0].trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{drug.subgroup}</p>
                    </div>
                    {drug.targetDose && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {drug.targetDose.split('·')[0]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Protocols Category */}
          {results.protocols.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>🔄</span>
                <span>Cross-Titration Protocols</span>
              </p>
              <div className="space-y-1">
                {results.protocols.map(proto => (
                  <button
                    key={proto.id}
                    onClick={() => handleSelectProtocol(proto.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          #{proto.number} {proto.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{proto.transitionTitle}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {proto.switchType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Receptors Category */}
          {results.receptors.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>🧬</span>
                <span>Molecular Targets</span>
              </p>
              <div className="space-y-1">
                {results.receptors.map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => handleSelectReceptor(rec.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rec.color }}
                      />
                      <div>
                        <span className="font-display text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {rec.id}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1.5">
                          {rec.fullName}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Search across 80+ medications, 20 switch protocols & 44 receptors</span>
          <span className="text-[10px] bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  )
}
