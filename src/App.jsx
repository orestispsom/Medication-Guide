import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import AllDrugsScreen from './screens/AllDrugsScreen'
import CrossTitrationScreen from './screens/CrossTitrationScreen'
import FamilyScreen from './screens/FamilyScreen'
import SubgroupScreen from './screens/SubgroupScreen'
import ComparisonTableScreen from './screens/ComparisonTableScreen'
import DrugDetailScreen from './screens/DrugDetailScreen'
import ReceptorListScreen from './screens/ReceptorListScreen'
import ReceptorDetailScreen from './screens/ReceptorDetailScreen'
import Navigation from './components/Navigation'
import QuickSearchModal from './components/QuickSearchModal'

function AppLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/all-drugs" element={<AllDrugsScreen />} />
          <Route path="/cross-titration" element={<CrossTitrationScreen />} />
          <Route path="/cross-titration/:protocolId" element={<CrossTitrationScreen />} />
          <Route path="/family/:familyId" element={<FamilyScreen />} />
          <Route path="/family/:familyId/comparison" element={<ComparisonTableScreen />} />
          <Route path="/comparison" element={<ComparisonTableScreen />} />
          <Route path="/subgroup/:subgroupId" element={<SubgroupScreen />} />
          <Route path="/drug/:drugId" element={<DrugDetailScreen />} />
          <Route path="/receptors" element={<ReceptorListScreen />} />
          <Route path="/receptors/:receptorId" element={<ReceptorDetailScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Persistent Bottom Navigation Bar */}
      <Navigation onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Spotlight Command Palette Search Modal (Ctrl+K or /) */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  )
}
