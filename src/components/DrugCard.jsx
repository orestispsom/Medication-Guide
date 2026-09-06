import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function DrugCard({ drug }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/drug/${drug.id}`)}
      className="bg-white rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all text-left border border-gray-100 group w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
              {drug.name}
            </h3>
            {drug.blackBox && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Boxed Warning">
                ⚠️
              </span>
            )}
            {drug.foodRequirement && drug.foodRequirement.toLowerCase().includes('meal') && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100" title={drug.foodRequirement}>
                🍽️
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{drug.brand}</p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {drug.targetDose && (
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
              🎯 {drug.targetDose.split('·')[0]}
            </span>
          )}
          {drug.halfLife && (
            <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
              ⏱️ {drug.halfLife.split('(')[0].trim()}
            </span>
          )}
        </div>
      </div>

      {drug.receptors && drug.receptors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {drug.receptors.slice(0, 4).map(r => {
            const receptor = data.receptors.find(rec => rec.id === r.receptor)
            return (
              <span
                key={r.receptor}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: receptor ? receptor.color + '18' : '#f3f4f6',
                  color: receptor ? receptor.color : '#6b7280',
                }}
              >
                {r.receptor} {r.occupancy ? `${r.occupancy}%` : ''}
              </span>
            )
          })}
          {drug.receptors.length > 4 && (
            <span className="text-[10px] text-gray-400 px-1 py-0.5 font-medium">
              +{drug.receptors.length - 4}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
