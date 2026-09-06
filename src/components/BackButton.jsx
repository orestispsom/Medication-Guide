import { useNavigate } from 'react-router-dom'

export default function BackButton({ title }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition-colors text-xs font-bold py-1 px-2 rounded-lg hover:bg-gray-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      <div className="flex items-center gap-1">
        {title && (
          <span className="text-xs font-semibold text-gray-400 mr-2 max-w-[200px] truncate hidden sm:inline">
            {title}
          </span>
        )}
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-gray-100 transition-colors text-xs"
          title="Return to Home"
        >
          🏠
        </button>
      </div>
    </div>
  )
}
