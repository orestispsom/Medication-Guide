import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ReceptorListScreen() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BackButton />
      <h1 className="text-xl font-extrabold text-gray-900 mb-1">Receptor Reference</h1>
      <p className="text-sm text-gray-500 mb-5">{data.receptors.length} receptors & enzyme targets</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.receptors.map(receptor => {
          const drugCount = data.drugs.filter(d =>
            d.receptors.some(r => r.receptor === receptor.id)
          ).length

          return (
            <button
              key={receptor.id}
              onClick={() => navigate(`/receptors/${receptor.id}`)}
              className="bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all text-left border border-gray-100 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: receptor.color }}
                />
                <span className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {receptor.id}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">
                {receptor.fullName}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">
                {drugCount} drug{drugCount !== 1 ? 's' : ''}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
