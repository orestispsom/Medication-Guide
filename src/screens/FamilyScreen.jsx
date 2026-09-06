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
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <BackButton title={family.name} />

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{family.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{drugCount} medications across {subgroups.length} subgroups</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
        <button
          onClick={() => navigate(`/family/${familyId}/comparison`)}
          className="rounded-2xl p-3.5 font-bold text-xs border transition-all hover:shadow-md flex items-center justify-center gap-2"
          style={{ borderColor: family.color + '40', color: family.color, backgroundColor: family.color + '15' }}
        >
          <span>🧬</span>
          <span>Receptor Comparison Table</span>
        </button>

        <button
          onClick={() => navigate(`/family/${familyId}/comparison`)}
          className="rounded-2xl p-3.5 font-bold text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-md flex items-center justify-center gap-2"
        >
          <span>🛡️</span>
          <span>Adverse Risk Matrix</span>
        </button>
      </div>

      <div className="space-y-3">
        {subgroups.map(sg => (
          <SubgroupCard key={sg.id} subgroup={sg} familyColor={family.color} />
        ))}
      </div>
    </div>
  )
}
