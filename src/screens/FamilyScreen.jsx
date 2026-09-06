import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import SubgroupCard from '../components/SubgroupCard'

export default function FamilyScreen() {
  const { familyId } = useParams()
  const navigate = useNavigate()
  const family = data.families.find(f => f.id === familyId)
  if (!family) return <div className="p-8 text-center text-gray-500">Family not found</div>

  const subgroups = data.subgroups.filter(s => s.familyId === familyId)
  const drugCount = data.drugs.filter(d => d.familyId === familyId).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <BackButton />

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">{family.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{drugCount} medications across {subgroups.length} subgroups</p>
      </div>

      <button
        onClick={() => navigate(`/family/${familyId}/comparison`)}
        className="w-full mb-5 rounded-xl p-3.5 font-semibold text-sm border-2 transition-all hover:shadow-md flex items-center justify-center gap-2"
        style={{ borderColor: family.color, color: family.color, backgroundColor: family.color + '08' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
        </svg>
        Table Overview — Receptor Comparison
      </button>

      <div className="space-y-3">
        {subgroups.map(sg => (
          <SubgroupCard key={sg.id} subgroup={sg} familyColor={family.color} />
        ))}
      </div>
    </div>
  )
}
