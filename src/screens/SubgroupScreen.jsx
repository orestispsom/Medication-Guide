import { useParams } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import DrugCard from '../components/DrugCard'

export default function SubgroupScreen() {
  const { subgroupId } = useParams()
  const subgroup = data.subgroups.find(s => s.id === subgroupId)
  if (!subgroup) return <div className="p-8 text-center text-gray-500">Subgroup not found</div>

  const family = data.families.find(f => f.id === subgroup.familyId)
  const drugs = data.drugs.filter(d => d.subgroupId === subgroupId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <BackButton title={subgroup.name} />

      <div className="mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: family?.color }}>
          {family?.name}
        </p>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{subgroup.name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{drugs.length} medication{drugs.length !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {drugs.map(drug => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </div>
    </div>
  )
}
