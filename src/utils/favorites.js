// LocalStorage-backed favorites management for clinical workflows

const STORAGE_KEY = 'med_guide_favorites_v1'

export function getFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { drugs: [], protocols: [] }
    return JSON.parse(raw)
  } catch {
    return { drugs: [], protocols: [] }
  }
}

export function isFavorite(type, id) {
  const favs = getFavorites()
  const list = type === 'drug' ? favs.drugs : favs.protocols
  return (list || []).includes(id)
}

export function toggleFavorite(type, id) {
  const favs = getFavorites()
  const listKey = type === 'drug' ? 'drugs' : 'protocols'
  const list = favs[listKey] || []

  const exists = list.includes(id)
  let updatedList
  if (exists) {
    updatedList = list.filter(item => item !== id)
  } else {
    updatedList = [...list, id]
  }

  const updatedFavs = {
    ...favs,
    [listKey]: updatedList,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavs))
  window.dispatchEvent(new Event('favorites-updated'))
  return !exists
}
