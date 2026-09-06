import { useNavigate } from 'react-router-dom'
import data from '../data.json'

const familyIcons = {
  antidepressants: '💊',
  antipsychotics: '🧠',
  'mood-stabilizers': '⚖️',
  anxiolytics: '🌿',
  adhd: '⚡',
  dementia: '🔬',
}

export default function FamilyCard({ family }) {
  const navigate = useNavigate()
  const drugCount = data.drugs.filter(d => d.familyId === family.id).length
  const subgroupCount = family.subgroups.length

  return (
    <button
      onClick={() => navigate(`/family/${family.id}`)}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 text-left border border-gray-100 group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{familyIcons[family.id]}</span>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: family.color + '20', color: family.color }}
        >
          {drugCount} drugs
        </span>
      </div>
      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-gray-700">
        {family.name}
      </h3>
      <p className="text-xs text-gray-400">
        {subgroupCount} subgroup{subgroupCount !== 1 ? 's' : ''}
      </p>
    </button>
  )
}
