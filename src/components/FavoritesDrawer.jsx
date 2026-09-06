import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import data from '../data.json'
import { getFavorites, toggleFavorite } from '../utils/favorites'

export default function FavoritesDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(getFavorites())

  const refreshFavorites = () => {
    setFavorites(getFavorites())
  }

  useEffect(() => {
    window.addEventListener('favorites-updated', refreshFavorites)
    return () => window.removeEventListener('favorites-updated', refreshFavorites)
  }, [])

  useEffect(() => {
    if (isOpen) {
      refreshFavorites()
    }
  }, [isOpen])

  if (!isOpen) return null

  const starredDrugs = (favorites.drugs || [])
    .map(id => data.drugs.find(d => d.id === id))
    .filter(Boolean)

  const starredProtocols = (favorites.protocols || [])
    .map(id => (data.protocols || []).find(p => p.id === id))
    .filter(Boolean)

  const handleNavigate = (path) => {
    onClose()
    navigate(path)
  }

  const handleRemove = (e, type, id) => {
    e.stopPropagation()
    toggleFavorite(type, id)
    refreshFavorites()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-2xl z-10 flex flex-col justify-between border-l border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐️</span>
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-sm">Clinical Favorites</h2>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {starredDrugs.length + starredProtocols.length} saved item{starredDrugs.length + starredProtocols.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {starredDrugs.length === 0 && starredProtocols.length === 0 && (
            <div className="py-16 text-center">
              <span className="text-3xl block mb-2">⭐</span>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">No Saved Favorites</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px] mx-auto leading-relaxed">
                Tap the star icon on any drug monograph or switch protocol to bookmark it for fast bedside access.
              </p>
            </div>
          )}

          {/* Starred Drugs */}
          {starredDrugs.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                <span>💊</span>
                <span>Medications ({starredDrugs.length})</span>
              </p>
              <div className="space-y-2">
                {starredDrugs.map(drug => (
                  <div
                    key={drug.id}
                    onClick={() => handleNavigate(`/drug/${drug.id}`)}
                    className="p-3 bg-gray-50/80 dark:bg-gray-800/80 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {drug.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                        {drug.subgroup}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleRemove(e, 'drug', drug.id)}
                      className="text-amber-500 hover:text-gray-300 dark:hover:text-gray-600 text-sm p-1"
                      title="Remove from favorites"
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Starred Protocols */}
          {starredProtocols.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-1">
                <span>🔄</span>
                <span>Switch Protocols ({starredProtocols.length})</span>
              </p>
              <div className="space-y-2">
                {starredProtocols.map(proto => (
                  <div
                    key={proto.id}
                    onClick={() => handleNavigate(`/cross-titration/${proto.id}`)}
                    className="p-3 bg-purple-50/40 dark:bg-purple-950/30 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-2xl border border-purple-100 dark:border-purple-900/40 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                        #{proto.number} {proto.title}
                      </h4>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate max-w-[200px]">
                        {proto.transitionTitle}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleRemove(e, 'protocol', proto.id)}
                      className="text-amber-500 hover:text-gray-300 dark:hover:text-gray-600 text-sm p-1"
                      title="Remove from favorites"
                    >
                      ★
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            Stored locally on your device for fast offline rounds
          </p>
        </div>
      </div>
    </div>
  )
}
