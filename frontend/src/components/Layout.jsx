import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">Previção de Crimes (foco em tráfico de drogas)</h1>
    
            </div>
            <div className="flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Visão Geral
              </Link>
              <Link
                to="/clustering"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/clustering') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Análise de Áreas
              </Link>
              <Link
                to="/prediction"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/prediction') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Previsão de Crimes
              </Link>
              <Link
                to="/map"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/map') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Mapa Interativo
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Crime Prediction System - Recife 2025</p>
          <p className="text-sm text-gray-400 mt-2">
            Sistema de previsao e analise de crimes baseado em Machine Learning
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
