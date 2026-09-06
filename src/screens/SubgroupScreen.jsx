import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import DrugCard from '../components/DrugCard'

export default function SubgroupScreen() {
  const { subgroupId } = useParams()
  const navigate = useNavigate()
  const subgroup = data.subgroups.find(s => s.id === subgroupId)
  if (!subgroup) return <div className="p-8 text-center text-slate-500">Subgroup not found</div>

  const family = data.families.find(f => f.id === subgroup.familyId)
  const drugs = data.drugs.filter(d => d.subgroupId === subgroupId)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      <BackButton title={subgroup.name} />

      <div className="mb-6">
        {family && (
          <button
            onClick={() => navigate(`/family/${family.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              backgroundColor: (family.color || '#0284c7') + '12',
              borderColor: (family.color || '#0284c7') + '30',
              color: family.color || '#0284c7',
            }}
          >
            <span>{family.name}</span>
            <span className="text-xs opacity-70">↗</span>
          </button>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          {subgroup.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {drugs.length} medication{drugs.length !== 1 ? 's' : ''} in this clinical class
        </p>
      </div>

      <div className="space-y-3">
        {drugs.map(drug => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </div>
    </div>
  )
}
