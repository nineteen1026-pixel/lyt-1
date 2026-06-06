import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Demands from '@/pages/Demands'
import Quotes from '@/pages/Quotes'
import Suppliers from '@/pages/Suppliers'
import Approvals from '@/pages/Approvals'
import TransportDashboard from '@/pages/TransportDashboard'
import MockData from '@/pages/MockData'
import CostAnalysis from '@/pages/CostAnalysis'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/transport" replace />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/transport" element={<TransportDashboard />} />
          <Route path="/cost-analysis" element={<CostAnalysis />} />
          <Route path="/mock" element={<MockData />} />
        </Route>
      </Routes>
    </Router>
  )
}
