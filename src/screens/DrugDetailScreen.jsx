import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import ReceptorTag from '../components/ReceptorTag'

export default function DrugDetailScreen() {
  const { drugId } = useParams()
  const navigate = useNavigate()
  const drug = data.drugs.find(d => d.id === drugId)
  if (!drug) return <div className="p-8 text-center text-gray-500">Drug not found</div>

  const family = data.families.find(f => f.id === drug.familyId)
  const maxOccupancy = Math.max(...drug.receptors.map(r => r.occupancy), 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BackButton />

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: family?.color }}>
          {drug.subgroup}
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900">{drug.name}</h1>
        <p className="text-sm text-gray-500">{drug.brand}</p>
      </div>

      {/* Half-life badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-center gap-3">
        <div className="bg-amber-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Half-life</p>
          <p className="text-sm font-bold text-amber-800">{drug.halfLife}</p>
        </div>
      </div>

      {/* Receptor Binding */}
      {drug.receptors.length > 0 && (
        <Section title="Receptor Binding Profile">
          <div className="space-y-2.5">
            {drug.receptors.map(r => {
              const receptor = data.receptors.find(rec => rec.id === r.receptor)
              const width = (r.occupancy / 100) * 100
              return (
                <div key={r.receptor} className="flex items-center gap-3">
                  <ReceptorTag receptorId={r.receptor} />
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                        style={{
                          width: `${width}%`,
                          backgroundColor: receptor?.color || '#9ca3af',
                          minWidth: '2rem',
                        }}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow-sm">{r.occupancy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {drug.receptors.map(r => (
              <span key={r.receptor} className="text-[10px] text-gray-500">
                {r.receptor}: {r.action}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Pharmacokinetics */}
      <Section title="Pharmacokinetics">
        <div className="space-y-2">
          <PkRow label="Half-life" value={drug.halfLife} />
          <PkRow label="Metabolism" value={drug.metabolism} />
          {drug.cyp450.substrate.length > 0 && (
            <PkRow label="CYP Substrate" value={drug.cyp450.substrate.join(', ')} />
          )}
          {drug.cyp450.inhibits.length > 0 && (
            <PkRow label="CYP Inhibitor" value={drug.cyp450.inhibits.join(', ')} />
          )}
        </div>
      </Section>

      {/* Indications */}
      <Section title="Indications">
        <div className="space-y-1">
          {drug.indications.map((ind, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 text-xs">●</span>
              <span className="text-sm text-gray-700">{ind}</span>
            </div>
          ))}
        </div>
        {drug.offLabel.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">Off-label</p>
            <div className="space-y-1">
              {drug.offLabel.map((ind, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5 text-xs">○</span>
                  <span className="text-sm text-gray-500">{ind}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* Side Effects */}
      <Section title="Key Side Effects">
        <div className="space-y-1">
          {drug.sideEffects.map((se, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 text-xs">▲</span>
              <span className="text-sm text-gray-700">{se}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Clinical Pearls */}
      <Section title="Clinical Pearls">
        <p className="text-sm text-gray-700 leading-relaxed">{drug.clinicalPearls}</p>
      </Section>

      {/* Dosing */}
      <Section title="Dosing">
        <div className="space-y-2">
          <PkRow label="Start" value={drug.dosing.start} />
          <PkRow label="Range" value={drug.dosing.range} />
          <PkRow label="Frequency" value={drug.dosing.frequency} />
        </div>
      </Section>

      {/* Pregnancy */}
      <Section title="Pregnancy">
        <p className="text-sm text-gray-700">{drug.pregnancy}</p>
      </Section>

      {/* Source badge */}
      <div className="mt-6 text-center">
        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400">
          Source: {drug.dataSource}
        </span>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
        {title}
      </h2>
      {children}
    </div>
  )
}

function PkRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-semibold text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  )
}
