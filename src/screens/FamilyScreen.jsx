import { useParams, useNavigate } from 'react-router-dom'
import data from '../data.json'
import BackButton from '../components/BackButton'
import SubgroupCard from '../components/SubgroupCard'

export default function FamilyScreen() {
  const { familyId } = useParams()
  const navigate = useNavigate()
  const family = data.families.find(f => f.id === familyId)
  if (!family) return <div className="p-8 text-center text-slate-500">Family not found</div>


  const subgroups = data.subgroups.filter(s => s.familyId === familyId)
  const drugCount = data.drugs.filter(d => d.familyId === familyId).length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
      <BackButton title={family.name} />

      <div className="mb-5">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {family.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {drugCount} medications across {subgroups.length} clinical subgroups
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {subgroups.map(sg => (
          <SubgroupCard key={sg.id} subgroup={sg} familyColor={family.color} />
        ))}
      </div>

      {/* Quick Access: Receptor Comparison & Adverse Risk Matrix — placed at bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate(`/family/${familyId}/comparison`)}
          className="bg-white dark:bg-[#111827] rounded-2xl p-4 font-bold text-xs border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="text-base">🧬</span>
          <span>Receptor Comparison Table</span>
        </button>

        <button
          onClick={() => navigate(`/family/${familyId}/comparison`)}
          className="bg-white dark:bg-[#111827] rounded-2xl p-4 font-bold text-xs border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="text-base">🛡️</span>
          <span>Adverse Risk Matrix</span>
        </button>
      </div>
    </div>
  )
}
