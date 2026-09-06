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

  // Extract concise clean names of key subgroups
  const previewSubgroups = subgroups
    .slice(0, 3)
    .map(s => s.name.replace(/(Antipsychotics|Antidepressants|Agents|Disorders|Medications)/gi, '').trim())
    .filter(Boolean)

  const accentColor = family.color || '#0284c7'

  return (
    <button
      onClick={() => navigate(`/family/${family.id}`)}
      className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.35)] hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between text-left group w-full cursor-pointer relative overflow-hidden"
    >
      {/* Top Row: Tinted Icon & Count Pill */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-2xs border transition-transform group-hover:scale-105 duration-200"
            style={{
              backgroundColor: `${accentColor}12`,
              borderColor: `${accentColor}28`,
            }}
          >
            <span>{familyIcons[family.id] || '💊'}</span>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            {drugCount} drugs · {subgroupCount} classes
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
          {family.name}
        </h3>

        {/* 1-Sentence Authoritative Clinical Description from Compendium */}
        {family.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {family.description}
          </p>
        )}
      </div>

      {/* Bottom Subgroup Chips & Arrow */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
          {previewSubgroups.map((name, idx) => (
            <span
              key={idx}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700/70 truncate max-w-[120px]"
            >
              {name}
            </span>
          ))}
          {subgroups.length > 3 && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              +{subgroups.length - 3}
            </span>
          )}
        </div>

        <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-200 text-sm font-bold flex-shrink-0">
          →
        </span>
      </div>
    </button>
  )
}
