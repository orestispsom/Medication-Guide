import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function DrugCard({ drug }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/drug/${drug.id}`)}
      className="bg-white dark:bg-gray-800/90 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all text-left border border-gray-200/90 dark:border-gray-700/90 group w-full cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {drug.name}
            </h3>
            {drug.blackBox && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60" title="FDA Boxed Warning">
                Boxed Warning
              </span>
            )}
            {drug.foodRequirement && drug.foodRequirement.toLowerCase().includes('meal') && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title={drug.foodRequirement}>
                With Food
              </span>
            )}
          </div>
          {drug.brand && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{drug.brand}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {drug.targetDose && (
            <span className="text-xs font-bold bg-gray-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-600/80 px-2.5 py-1 rounded-xl whitespace-nowrap">
              {drug.targetDose.split('·')[0]}
            </span>
          )}
          {drug.halfLife && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              t½: {drug.halfLife.split('(')[0].trim()}
            </span>
          )}
        </div>
      </div>

      {drug.indications && drug.indications.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-2.5 font-normal">
          {drug.indications.slice(0, 3).join(' • ')}
        </p>
      )}

      {drug.receptors && drug.receptors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60">
          {drug.receptors.slice(0, 4).map(r => (
            <span
              key={r.receptor}
              className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-600/60"
            >
              {r.receptor} {r.occupancy ? `${r.occupancy}%` : ''}
            </span>
          ))}
          {drug.receptors.length > 4 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 px-1 py-0.5 font-medium">
              +{drug.receptors.length - 4} more
            </span>
          )}
        </div>
      )}
    </button>
  )
}
