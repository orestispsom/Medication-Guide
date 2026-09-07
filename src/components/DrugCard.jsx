import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import { getReceptorColor } from '../utils/receptorFamily'

export default function DrugCard({ drug }) {
  const navigate = useNavigate()

  const handleReceptorClick = (e, receptorId) => {
    e.stopPropagation()
    navigate(`/receptors/${receptorId}`)
  }

  return (
    <button
      onClick={() => navigate(`/drug/${drug.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl p-3.5 sm:px-4.5 sm:py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 text-left border border-slate-200/90 dark:border-slate-800/90 group w-full cursor-pointer relative"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
          {drug.name}
        </h3>

        {drug.halfLife && (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap flex-shrink-0">
            t½: {drug.halfLife.split('(')[0].trim()}
          </span>
        )}
      </div>

      {/* Molecular Receptor Targets - Clickable, All Receptors, No Percentages */}
      {drug.receptors && drug.receptors.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-0.5">
            Targets:
          </span>
          {drug.receptors.map(r => {
            const receptorObj = (data.receptors || []).find(rec => rec.id === r.receptor)
            const color = receptorObj?.color || getReceptorColor(r.receptor)
            return (
              <span
                key={r.receptor}
                onClick={(e) => handleReceptorClick(e, r.receptor)}
                title={`View all drugs with ${r.receptor} affinity`}
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg transition-transform hover:scale-105 border cursor-pointer"
                style={{
                  backgroundColor: `${color}14`,
                  color: color,
                  borderColor: `${color}35`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{r.receptor}</span>
              </span>
            )
          })}
        </div>
      )}
    </button>
  )
}


