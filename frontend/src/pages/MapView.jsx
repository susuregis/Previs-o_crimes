import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { clusteringAPI } from '../services/api'

// Coordenadas aproximadas dos bairros de Recife
const bairroCoords = {
  'BOA VIAGEM': [-8.113, -34.898],
  'PINA': [-8.093, -34.882],
  'PIEDADE': [-8.055, -34.889],
  'CASA AMARELA': [-8.025, -34.915],
  'TORRE': [-8.048, -34.901],
  'ESPINHEIRO': [-8.041, -34.892],
  'AFOGADOS': [-8.051, -34.936],
  'RECIFE': [-8.063, -34.871],
  'SANTO AMARO': [-8.054, -34.881],
  'BOA VISTA': [-8.059, -34.889],
  'SANTO ANTONIO': [-8.062, -34.877],
  'SAO JOSE': [-8.070, -34.880],
  'ILHA DO LEITE': [-8.053, -34.893],
  'PARNAMIRIM': [-8.039, -34.900],
  'MADALENA': [-8.044, -34.907],
  'ZUMBI': [-8.038, -34.909],
  'PRADO': [-8.041, -34.911],
  'ILHA DO RETIRO': [-8.051, -34.911],
  'ENCRUZILHADA': [-8.055, -34.905],
  'AGUA FRIA': [-8.032, -34.921],
  'TORREAO': [-8.026, -34.919],
  'FUNDAO': [-8.028, -34.925],
  'POCO': [-8.022, -34.912],
  'ARRUDA': [-8.040, -34.920],
  'CAMPO GRANDE': [-8.046, -34.915]
}

const MapView = () => {
  const [bairros, setBairros] = useState([])
  const [clusterInfo, setClusterInfo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [bairrosResponse, clusterResponse] = await Promise.all([
        clusteringAPI.getBairrosRanking(),
        clusteringAPI.getClusterInfo()
      ])
      setBairros(bairrosResponse.data.top_bairros || [])
      setClusterInfo(clusterResponse.data.clusters || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados do mapa. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const getClusterColor = (clusterId, nivelRisco) => {
    // Usar nivel_risco se disponível, senão usar cluster_id
    if (nivelRisco) {
      if (nivelRisco === 'Alto') return '#dc2626' // Vermelho
      if (nivelRisco === 'Médio') return '#f59e0b' // Amarelo
      if (nivelRisco === 'Baixo') return '#10b981' // Verde
    }
    
    // Fallback usando cluster_id
    const colors = {
      0: '#f59e0b', // Amarelo - Médio risco
      1: '#10b981', // Verde - Baixo risco
      2: '#10b981', // Verde - Baixo risco
      3: '#f59e0b'  // Amarelo - Médio risco
    }
    return colors[clusterId] || '#6b7280'
  }

  const getClusterRadius = (nivelRisco, clusterId) => {
    // Usar nivel_risco se disponível
    if (nivelRisco) {
      if (nivelRisco === 'Alto') return 15 // Maior para alto risco
      if (nivelRisco === 'Médio') return 12 // Médio
      if (nivelRisco === 'Baixo') return 9 // Menor
    }
    
    // Fallback usando cluster_id
    const sizes = {
      0: 12, // Médio
      1: 9,  // Baixo
      2: 9,  // Baixo
      3: 12  // Médio
    }
    return sizes[clusterId] || 8
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mapa de Risco - Bairros de Recife</h2>
        <p className="text-gray-600">
          Visualizacao geografica dos niveis de risco por bairro baseado em clustering
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-6 mb-4">
          <h3 className="font-semibold text-gray-700">Legenda:</h3>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#f59e0b'}}></div>
            <span className="text-sm">Médio Risco (Grupos 0, 3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{backgroundColor: '#10b981'}}></div>
            <span className="text-sm">Baixo Risco (Grupos 1, 2)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={[-8.055, -34.895]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {bairros.map((bairro, index) => {
              const coords = bairroCoords[bairro.bairro.toUpperCase()]
              if (!coords) return null

              const cor = getClusterColor(bairro.cluster_id, bairro.nivel_risco)
              const raio = getClusterRadius(bairro.nivel_risco, bairro.cluster_id)

              return (
                <CircleMarker
                  key={index}
                  center={coords}
                  radius={raio}
                  fillColor={cor}
                  color="#fff"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg">{bairro.bairro}</h3>
                      <p className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          bairro.nivel_risco === 'Alto' ? 'bg-red-100 text-red-800' :
                          bairro.nivel_risco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {bairro.nivel_risco}
                        </span>
                      </p>
                      <p className="text-sm mt-1">Grupo: {bairro.cluster_id}</p>
                      <p className="text-sm">Ocorrências: {bairro.total_ocorrencias}</p>
                      <p className="text-sm">Média Suspeitos: {bairro.media_suspeitos?.toFixed(2)}</p>
                      <p className="text-sm">% Com Arma: {bairro.percentual_com_arma?.toFixed(1)}%</p>
                    </div>
                  </Popup>
                  <Tooltip>{bairro.bairro}</Tooltip>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas por Grupo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusterInfo.map((cluster) => {
            const cor = getClusterColor(cluster.cluster_id, cluster.nivel_risco)
            return (
              <div key={cluster.cluster_id} className="border-2 rounded-lg p-4" style={{ borderColor: cor }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: cor }}
                    ></div>
                    <h4 className="font-semibold">Grupo {cluster.cluster_id}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    cluster.nivel_risco === 'Alto' ? 'bg-red-100 text-red-800' :
                    cluster.nivel_risco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {cluster.nivel_risco}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Bairros: <span className="font-semibold">{cluster.total_bairros}</span></p>
                <p className="text-sm text-gray-600">
                  Média Suspeitos: <span className="font-semibold">{cluster.estatisticas.media_suspeitos?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  % Com Arma: <span className="font-semibold text-red-600">{cluster.estatisticas.percentual_com_arma?.toFixed(1)}%</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MapView
