import { useNavigate } from 'react-router-dom'
import data from '../data.json'

export default function ReceptorTag({ receptorId, occupancy, onClick }) {
  const navigate = useNavigate()
  const receptor = data.receptors.find(r => r.id === receptorId)
  if (!receptor) return null

  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) onClick()
    else navigate(`/receptors/${receptorId}`)
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 hover:shadow-md cursor-pointer border"
      style={{
        backgroundColor: receptor.color + '18',
        borderColor: receptor.color + '40',
        color: receptor.color,
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: receptor.color }}
      />
      {receptorId}
      {occupancy != null && (
        <span className="opacity-75">{occupancy}%</span>
      )}
    </button>
  )
}
