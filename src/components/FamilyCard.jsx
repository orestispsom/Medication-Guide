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
      className="bg-white dark:bg-gray-800/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all text-left border border-gray-200/90 dark:border-gray-700/90 hover:border-indigo-400/60 dark:hover:border-indigo-500/60 group relative cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{familyIcons[family.id] || '💊'}</span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-600/60">
          {drugCount} medications
        </span>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {family.name}
      </h3>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {subgroupCount} subgroup{subgroupCount !== 1 ? 's' : ''}
      </p>
    </button>
  )
}
