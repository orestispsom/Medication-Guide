import { useNavigate } from 'react-router-dom'

export default function DrugCard({ drug }) {
  const navigate = useNavigate()

  const cleanBrand = drug.brand
    ? drug.brand.replace('US:', '').split('·')[0].trim()
    : ''

  return (
    <button
      onClick={() => navigate(`/drug/${drug.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 text-left border border-slate-200/90 dark:border-slate-800/90 group w-full cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {drug.name}
            </h3>
            {cleanBrand && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                ({cleanBrand})
              </span>
            )}
            {drug.blackBox && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50" title="FDA Boxed Warning">
                ⚠️ Boxed Warning
              </span>
            )}
            {drug.foodRequirement && drug.foodRequirement.toLowerCase().includes('meal') && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60" title={drug.foodRequirement}>
                🍽️ With food
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{drug.subgroup}</p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {drug.targetDose && (
            <span className="text-xs sm:text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-xl whitespace-nowrap">
              🎯 {drug.targetDose.split('·')[0].trim()}
            </span>
          )}
          {drug.halfLife && (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
              t½: {drug.halfLife.split('(')[0].trim()}
            </span>
          )}
        </div>
      </div>

      {drug.indications && drug.indications.length > 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 mt-2.5 leading-relaxed">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Indications: </span>
          {drug.indications.slice(0, 3).join(' · ')}
        </p>
      )}
    </button>
  )
}

