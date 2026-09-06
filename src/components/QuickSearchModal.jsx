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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100">
          <span className="text-gray-400 text-lg mr-3">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search medications, switch protocols, receptors..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 font-medium text-gray-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1 rounded-full bg-gray-100"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-semibold text-gray-400 hover:text-gray-700 px-2 py-1"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 divide-y divide-gray-50">
          {query.trim() && !hasResults && (
            <div className="py-8 text-center text-xs text-gray-400">
              No results found for &quot;{query}&quot;.
            </div>
          )}

          {!query.trim() && (
            <div className="py-6 px-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Quick Jump Suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {['Clozapine', 'Lithium', 'Escitalopram', 'Cobenfy', 'Bupropion', 'Aripiprazole', '5-HT2A', 'D2'].map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
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
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>💊</span>
                <span>Medications</span>
              </p>
              <div className="space-y-1">
                {results.drugs.map(drug => (
                  <button
                    key={drug.id}
                    onClick={() => handleSelectDrug(drug.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">
                          {drug.name}
                        </span>
                        {drug.brand && (
                          <span className="text-[11px] text-gray-400">
                            ({drug.brand.replace('US:', '').split('·')[0].trim()})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">{drug.subgroup}</p>
                    </div>
                    {drug.targetDose && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
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
              <p className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>🔄</span>
                <span>Cross-Titration Protocols</span>
              </p>
              <div className="space-y-1">
                {results.protocols.map(proto => (
                  <button
                    key={proto.id}
                    onClick={() => handleSelectProtocol(proto.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-purple-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-purple-700">
                        #{proto.number} {proto.title}
                      </span>
                      <p className="text-[10px] text-purple-600 font-medium">
                        {proto.transitionTitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      {proto.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Receptors Category */}
          {results.receptors.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1">
                <span>🧬</span>
                <span>Receptor Targets</span>
              </p>
              <div className="space-y-1">
                {results.receptors.map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => handleSelectReceptor(rec.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rec.color }}
                      />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">
                        {rec.id}
                      </span>
                      <span className="text-[11px] text-gray-400 truncate max-w-xs">
                        {rec.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">Target →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
          <span>Press Esc to close</span>
          <span>Tip: Press Ctrl+K anytime</span>
        </div>
      </div>
    </div>
  )
}
