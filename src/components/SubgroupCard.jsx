import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function SubgroupCard({ subgroup, familyColor }) {
  const navigate = useNavigate()
  const drugCount = data.drugs.filter(d => d.subgroupId === subgroup.id).length

  return (
    <button
      onClick={() => navigate(`/subgroup/${subgroup.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-gray-100 group w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700">
            {subgroup.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {drugCount} medication{drugCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: familyColor + '20', color: familyColor }}
          >
            {drugCount}
          </span>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
