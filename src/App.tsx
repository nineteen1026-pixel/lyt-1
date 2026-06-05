import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Demands from '@/pages/Demands'
import Quotes from '@/pages/Quotes'
import Suppliers from '@/pages/Suppliers'
import Approvals from '@/pages/Approvals'
import MockData from '@/pages/MockData'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/demands" replace />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/mock" element={<MockData />} />
        </Route>
      </Routes>
    </Router>
  )
}
