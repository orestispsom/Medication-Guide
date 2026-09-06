import { useNavigate } from 'react-router-dom'
import data from '../data.json'

const familyIcons = {
  antipsychotics: '🧠',
  antidepressants: '💊',
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
  const drugs = data.drugs.filter(d => d.familyId === family.id)
  const subgroups = (data.subgroups || []).filter(s => s.familyId === family.id)
  const drugCount = drugs.length
  const subgroupCount = subgroups.length

  const accentColor = family.color || '#0284c7'

  return (
    <button
      onClick={() => navigate(`/family/${family.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between text-left group w-full cursor-pointer relative"
    >
      <div>
        {/* Top Row: Tinted Icon & Count Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-transform group-hover:scale-105 duration-200"
            style={{
              backgroundColor: `${accentColor}12`,
              borderColor: `${accentColor}28`,
            }}
          >
            <span>{familyIcons[family.id] || '💊'}</span>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
            {drugCount} medications · {subgroupCount} {subgroupCount === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {family.name}
          </h3>
          <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all text-sm font-bold flex-shrink-0">
            →
          </span>
        </div>

        {/* 1-Sentence Authoritative Clinical Description from Compendium */}
        {family.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {family.description}
          </p>
        )}
      </div>
    </button>
  )
}

