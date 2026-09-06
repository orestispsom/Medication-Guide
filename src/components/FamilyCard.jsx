import { useNavigate } from 'react-router-dom'
import data from '../data.json'

const familyIcons = {
  antidepressants: '💊',
  antipsychotics: '🧠',
  'mood-stabilizers': '⚖️',
  anxiolytics: '🌙',
  adhd: '⚡',
  'substance-use': '🛡️',
  neuropsychiatry: '🩺',
  neurology: '🔬',
  'antidotes-interventional': '🚨',
  dementia: '💡',
}

export default function FamilyCard({ family }) {
  const navigate = useNavigate()
  const drugCount = data.drugs.filter(d => d.familyId === family.id).length
  const subgroupCount = (data.subgroups || []).filter(s => s.familyId === family.id).length

  return (
    <button
      onClick={() => navigate(`/family/${family.id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all hover:-translate-y-1 text-left border border-gray-100 dark:border-gray-700 group relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: family.color }}
      />
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{familyIcons[family.id] || '💊'}</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: family.color + '18', color: family.color }}
        >
          {drugCount} drugs
        </span>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-200">
        {family.name}
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {subgroupCount} subgroup{subgroupCount !== 1 ? 's' : ''}
      </p>
    </button>
  )
}
