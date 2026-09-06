import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import FamilyCard from '../components/FamilyCard'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Psychiatric Medication Guide
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Clinical Practice & Examination Reference
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {data.families.map(family => (
          <FamilyCard key={family.id} family={family} />
        ))}
      </div>

      <button
        onClick={() => navigate('/receptors')}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 font-bold text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        Receptor Reference
      </button>

      <p className="text-center text-[10px] text-gray-300 mt-6">
        {data.drugs.length} medications · {data.receptors.length} receptors · {data.families.length} drug classes
      </p>
    </div>
  )
}
