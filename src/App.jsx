import { HashRouter, Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import FamilyScreen from './screens/FamilyScreen'
import SubgroupScreen from './screens/SubgroupScreen'
import ComparisonTableScreen from './screens/ComparisonTableScreen'
import DrugDetailScreen from './screens/DrugDetailScreen'
import ReceptorListScreen from './screens/ReceptorListScreen'
import ReceptorDetailScreen from './screens/ReceptorDetailScreen'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/family/:familyId" element={<FamilyScreen />} />
        <Route path="/family/:familyId/comparison" element={<ComparisonTableScreen />} />
        <Route path="/subgroup/:subgroupId" element={<SubgroupScreen />} />
        <Route path="/drug/:drugId" element={<DrugDetailScreen />} />
        <Route path="/receptors" element={<ReceptorListScreen />} />
        <Route path="/receptors/:receptorId" element={<ReceptorDetailScreen />} />
      </Routes>
    </HashRouter>
  )
}
