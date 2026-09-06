import { useState } from 'react'

export default function PatientHandoutModal({
  isOpen,
  onClose,
  title,
  transitionTitle,
  startDate,
  duration,
  phases = [],
  warnings = '',
  emergency = '',
}) {
  const [patientName, setPatientName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [clinicPhone, setClinicPhone] = useState('')

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-handout-area, #printable-handout-area * {
            visibility: visible !important;
          }
          #printable-handout-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden my-6">
        {/* Modal Top Action Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0b0f19]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Patient Medication Transition Handout
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Formatted for print or PDF export to give directly to the patient
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>Print Handout</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Clinician Fill-in Inputs (hidden in print) */}
        <div className="no-print p-5 bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50">
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 block mb-2">
            Optional Header Customization:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Patient Name:</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Clinic / Prescriber:</label>
              <input
                type="text"
                placeholder="e.g. Dr. Smith / Outpatient Psych"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Clinic Phone:</label>
              <input
                type="text"
                placeholder="e.g. (555) 234-5678"
                value={clinicPhone}
                onChange={e => setClinicPhone(e.target.value)}
                className="w-full bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* PRINTABLE CONTENT AREA */}
        <div id="printable-handout-area" className="p-6 text-gray-900 bg-white max-h-[65vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="border-b-2 border-gray-900 pb-4 mb-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">
                  Medication Transition Instructions
                </h1>
                <p className="text-sm font-bold text-indigo-900 mt-0.5">
                  {transitionTitle || title}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-gray-500 block">Date Issued:</span>
                <span className="font-bold text-gray-900">
                  {startDate || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            {/* Patient & Clinic details */}
            {(patientName || clinicName || clinicPhone) && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap justify-between text-xs font-medium text-gray-700">
                {patientName && <div><span className="font-bold text-gray-900">Patient:</span> {patientName}</div>}
                {clinicName && <div><span className="font-bold text-gray-900">Prescriber:</span> {clinicName}</div>}
                {clinicPhone && <div><span className="font-bold text-gray-900">Phone:</span> {clinicPhone}</div>}
              </div>
            )}
          </div>

          {/* Introductory Explanation */}
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs mb-5 leading-relaxed">
            <strong className="text-gray-900 block mb-1">How to follow this transition schedule:</strong>
            Your doctor has prescribed a gradual transition plan over approximately <strong>{duration}</strong>.
            This schedule allows your body to safely adjust to your new medication while gradually stepping down your previous medication.
            Please take your doses exactly as outlined below. Do not stop either medication suddenly.
          </div>

          {/* Phase Table */}
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-2">
            Your Step-by-Step Schedule:
          </h2>
          <div className="space-y-3 mb-6">
            {phases.map((ph, idx) => (
              <div key={idx} className="border border-gray-300 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900 mb-1 border-b border-gray-100 pb-1">
                  <span className="text-indigo-950 font-black">
                    Step {idx + 1}: {ph.title}
                  </span>
                  {ph.calculatedDates && (
                    <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                      {ph.calculatedDates}
                    </span>
                  )}
                </div>
                <div className="text-gray-800 font-medium leading-relaxed mt-1">
                  {ph.notes || ph.description || 'Follow instructions as directed by your clinician.'}
                </div>
              </div>
            ))}
          </div>

          {/* Warnings & Emergency Contact Box */}
          <div className="border-2 border-red-200 bg-red-50/60 rounded-xl p-3.5 text-xs text-red-950 space-y-1.5 mb-5">
            <div className="font-black flex items-center gap-1 text-red-900 uppercase">
              <span>⚠️</span>
              <span>Important Warnings & When to Call Us:</span>
            </div>
            {warnings && <p className="font-medium">{warnings}</p>}
            <ul className="list-disc list-inside space-y-0.5 text-gray-800">
              <li>Call immediately if you experience severe dizziness, fainting, high fever, or severe muscle stiffness.</li>
              <li>Mild temporary nausea, sleep changes, or restlessness can occur during medication shifts; contact us if troublesome.</li>
              <li>If you miss a dose, take it as soon as you remember, unless it is almost time for your next scheduled dose. Never take a double dose.</li>
            </ul>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-gray-200 flex justify-between text-[10px] text-gray-500">
            <span>Psychiatric Medication Guide — Point of Care Reference</span>
            <span>Always consult your healthcare provider with questions</span>
          </div>
        </div>
      </div>
    </div>
  )
}
