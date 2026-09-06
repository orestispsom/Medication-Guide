import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ComparisonTableScreen() {
  const { familyId } = useParams()
  const navigate = useNavigate()
  const family = data.families.find(f => f.id === familyId)
  if (!family) return <div className="p-8 text-center text-gray-500">Family not found</div>

  const drugs = data.drugs.filter(d => d.familyId === familyId)

  // Collect all receptors present in at least one drug of this family
  const receptorIds = new Set()
  drugs.forEach(d => d.receptors.forEach(r => receptorIds.add(r.receptor)))

  // Sort receptors by canonical order
  const canonicalOrder = data.receptors.map(r => r.id)
  const sortedReceptorIds = [...receptorIds].sort(
    (a, b) => canonicalOrder.indexOf(a) - canonicalOrder.indexOf(b)
  )

  const getBinding = (drug, receptorId) => {
    const r = drug.receptors.find(rec => rec.receptor === receptorId)
    return r ? r.occupancy : null
  }

  const getReceptor = (id) => data.receptors.find(r => r.id === id)

  return (
    <div className="max-w-full mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <BackButton />
        <h1 className="text-xl font-extrabold text-gray-900 mb-1">{family.name}</h1>
        <p className="text-sm text-gray-500 mb-4">Receptor Binding Comparison</p>
      </div>

      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left font-semibold text-gray-500 border-b border-gray-200 min-w-[80px]">
                Receptor
              </th>
              {drugs.map(drug => (
                <th
                  key={drug.id}
                  className="px-2 py-2 text-center font-semibold text-gray-700 border-b border-gray-200 min-w-[70px] cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => navigate(`/drug/${drug.id}`)}
                >
                  <div className="text-[10px] leading-tight">{drug.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedReceptorIds.map(receptorId => {
              const receptor = getReceptor(receptorId)
              return (
                <tr key={receptorId} className="hover:bg-gray-50/50">
                  <td
                    className="sticky left-0 bg-white z-10 px-3 py-2 font-semibold border-b border-gray-100 cursor-pointer hover:underline"
                    style={{ color: receptor?.color }}
                    onClick={() => navigate(`/receptors/${receptorId}`)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: receptor?.color }}
                      />
                      {receptorId}
                    </div>
                  </td>
                  {drugs.map(drug => {
                    const occupancy = getBinding(drug, receptorId)
                    return (
                      <td key={drug.id} className="px-2 py-2 text-center border-b border-gray-100">
                        <BindingDot occupancy={occupancy} color={receptor?.color} />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="max-w-2xl mx-auto mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-600" /> &gt;60%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-600 opacity-50" /> 20–60%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-600 opacity-20" /> &lt;20%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border border-gray-300" /> none
        </span>
      </div>
    </div>
  )
}

function BindingDot({ occupancy, color }) {
  if (occupancy == null) {
    return (
      <span className="inline-block w-4 h-4 rounded-full border border-gray-200" />
    )
  }

  let opacity = 1
  if (occupancy < 20) opacity = 0.25
  else if (occupancy <= 60) opacity = 0.55

  return (
    <span
      className="inline-block w-4 h-4 rounded-full relative group cursor-default"
      style={{ backgroundColor: color || '#9ca3af', opacity }}
      title={`${occupancy}%`}
    >
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {occupancy}%
      </span>
    </span>
  )
}
