import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function SubgroupCard({ subgroup }) {
  const navigate = useNavigate()
  const drugsInSubgroup = data.drugs.filter(d => d.subgroupId === subgroup.id)
  const drugCount = drugsInSubgroup.length

  return (
    <button
      onClick={() => navigate(`/subgroup/${subgroup.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl px-4 py-3.5 sm:px-5 sm:py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 text-left border border-slate-200/90 dark:border-slate-800/90 group w-full cursor-pointer flex items-center justify-between gap-3"
    >
      <h3 className="font-display font-bold text-slate-900 dark:text-white text-[15px] sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
        {subgroup.name}
      </h3>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
          {drugCount} {drugCount === 1 ? 'drug' : 'drugs'}
        </span>
        <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
