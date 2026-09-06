import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function SubgroupCard({ subgroup, familyColor }) {
  const navigate = useNavigate()
  const drugsInSubgroup = data.drugs.filter(d => d.subgroupId === subgroup.id)
  const drugCount = drugsInSubgroup.length
  const previewDrugs = drugsInSubgroup.slice(0, 4).map(d => d.name).join(' · ')

  return (
    <button
      onClick={() => navigate(`/subgroup/${subgroup.id}`)}
      className="bg-white rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-gray-300 transition-all text-left border border-gray-100 group w-full"
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
          {subgroup.name}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-black px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: familyColor + '18', color: familyColor }}
          >
            {drugCount}
          </span>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {previewDrugs && (
        <p className="text-[11px] text-gray-400 truncate">
          {previewDrugs}
          {drugCount > 4 ? ` · +${drugCount - 4} more` : ''}
        </p>
      )}
    </button>
  )
}
