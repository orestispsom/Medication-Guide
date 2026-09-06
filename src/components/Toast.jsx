import { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-gray-700">
        <span className="text-emerald-400">✓</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
