import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function DrugCard({ drug }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/drug/${drug.id}`)}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-gray-100 group w-full"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
            {drug.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{drug.brand}</p>
        </div>
        <span className="ml-3 flex-shrink-0 text-xs font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg whitespace-nowrap">
          t½ {drug.halfLife.split('(')[0].trim()}
        </span>
      </div>
      {drug.receptors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {drug.receptors.slice(0, 4).map(r => {
            const receptor = data.receptors.find(rec => rec.id === r.receptor)
            return (
              <span
                key={r.receptor}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: receptor ? receptor.color + '18' : '#f3f4f6',
                  color: receptor ? receptor.color : '#6b7280',
                }}
              >
                {r.receptor}
              </span>
            )
          })}
          {drug.receptors.length > 4 && (
            <span className="text-[10px] text-gray-400 px-1 py-0.5">
              +{drug.receptors.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
