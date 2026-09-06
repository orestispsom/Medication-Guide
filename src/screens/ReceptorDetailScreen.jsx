import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'

export default function ReceptorDetailScreen() {
  const { receptorId } = useParams()
  const navigate = useNavigate()
  const receptor = data.receptors.find(r => r.id === receptorId)
  if (!receptor) return <div className="p-8 text-center text-gray-500">Receptor not found</div>

  // Get all drugs that bind this receptor, grouped by family
  const drugsWithBinding = data.drugs
    .filter(d => d.receptors.some(r => r.receptor === receptorId))
    .map(d => ({
      ...d,
      binding: d.receptors.find(r => r.receptor === receptorId),
    }))
    .sort((a, b) => b.binding.occupancy - a.binding.occupancy)

  const familyGroups = {}
  drugsWithBinding.forEach(d => {
    if (!familyGroups[d.family]) familyGroups[d.family] = []
    familyGroups[d.family].push(d)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BackButton />

      {/* Header */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: receptor.color + '15' }}>
        <div className="flex items-center gap-3 mb-3">
          <span
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: receptor.color }}
          />
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: receptor.color }}>
              {receptor.id}
            </h1>
            <p className="text-sm text-gray-600">{receptor.fullName}</p>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <InfoRow label="Mechanism" value={receptor.action} color={receptor.color} />
          <InfoRow label="Therapeutic Effect" value={receptor.therapeuticEffect} color={receptor.color} />
          <InfoRow label="Side Effects" value={receptor.sideEffects} color={receptor.color} />
        </div>

        <div className="mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 text-gray-500">
            Source: {receptor.dataSource}
          </span>
        </div>
      </div>

      {/* Drugs with affinity */}
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
        Drugs with {receptor.id} Affinity ({drugsWithBinding.length})
      </h2>

      {Object.entries(familyGroups).map(([familyName, drugs]) => (
        <div key={familyName} className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 mb-2">{familyName}</h3>
          <div className="space-y-1.5">
            {drugs.map(drug => (
              <button
                key={drug.id}
                onClick={() => navigate(`/drug/${drug.id}`)}
                className="w-full bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all text-left border border-gray-100 flex items-center gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {drug.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{drug.brand}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${drug.binding.occupancy}%`,
                        backgroundColor: receptor.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-8 text-right"
                    style={{ color: receptor.color }}
                  >
                    {drug.binding.occupancy}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, value, color }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>
        {label}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
    </div>
  )
}
