import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ClusteringAnalysis from './pages/ClusteringAnalysis'
import PredictionAnalysis from './pages/PredictionAnalysis'
import MapView from './pages/MapView'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clustering" element={<ClusteringAnalysis />} />
          <Route path="/prediction" element={<PredictionAnalysis />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
