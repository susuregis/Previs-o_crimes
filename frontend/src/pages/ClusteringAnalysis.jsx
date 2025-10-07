import React, { useEffect, useState } from 'react'
import { clusteringAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const ClusteringAnalysis = () => {
  const [bairrosList, setBairrosList] = useState([])
  const [selectedBairro, setSelectedBairro] = useState('')
  const [prediction, setPrediction] = useState(null)
  const [clusterInfo, setClusterInfo] = useState(null)
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [bairrosResponse, clusterResponse, rankingResponse] = await Promise.all([
        clusteringAPI.getBairros(),
        clusteringAPI.getClusterInfo(),
        clusteringAPI.getBairrosRanking()
      ])
      
      // Extrair lista de bairros - API retorna array de objetos
      const bairrosData = bairrosResponse.data.bairros || []
      if (typeof bairrosData[0] === 'string') {
        setBairrosList(bairrosData)
      } else {
        setBairrosList(bairrosData.map(item => item.bairro))
      }
      
      // Usar clusters EXATO da API - já vem como array
      setClusterInfo(clusterResponse.data.clusters || [])
      
      // Usar ranking EXATO da API
      setRanking(rankingResponse.data.top_bairros || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados. Verifique se o backend está rodando.')
    }
  }

  const handlePredict = async () => {
    if (!selectedBairro) return
    
    try {
      setLoading(true)
      const response = await clusteringAPI.predictCluster(selectedBairro)
      setPrediction(response.data)
    } catch (error) {
      console.error('Erro ao fazer predicao:', error)
    } finally {
      setLoading(false)
    }
  }

  // clusterInfo já é um array da API - usar novos campos do TESTE
  const clusterData = Array.isArray(clusterInfo) ? clusterInfo.map(cluster => ({
    cluster: `Grupo ${cluster.cluster_id}`,
    bairros: cluster.total_bairros,
    media_suspeitos: cluster.estatisticas.media_suspeitos,
    percentual_arma: cluster.estatisticas.percentual_com_arma
  })) : []

  const radarData = Array.isArray(clusterInfo) ? clusterInfo.map(cluster => ({
    cluster: `G${cluster.cluster_id}`,
    quantidade: cluster.total_bairros,
    ocorrencias: cluster.estatisticas.total_ocorrencias
  })) : []

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Análise por Área</h2>
        <p className="text-gray-600">
          Classificação automática dos bairros de acordo com o padrão de criminalidade
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Consultar Situação do Bairro</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={selectedBairro}
            onChange={(e) => setSelectedBairro(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Selecione um bairro</option>
            {bairrosList.map((bairro, index) => (
              <option key={index} value={bairro}>{bairro}</option>
            ))}
          </select>
          <button
            onClick={handlePredict}
            disabled={!selectedBairro || loading}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Consultando...' : 'Consultar Bairro'}
          </button>
        </div>

        {prediction && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary p-6 rounded">
            <h4 className="font-semibold text-lg mb-4">Situação do Bairro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bairro Consultado</p>
                <p className="text-lg font-bold">{prediction.bairro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grupo de Risco</p>
                <p className="text-lg font-bold">Grupo {prediction.cluster}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nível de Atenção</p>
                <p className={`text-lg font-bold ${
                  prediction.nivel_risco === 'Alto' ? 'text-red-600' :
                  prediction.nivel_risco === 'Medio' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {prediction.nivel_risco}
                </p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-gray-600 mb-1">Descricao do Cluster</p>
                <p className="text-sm">{prediction.descricao_cluster}</p>
              </div>
              {prediction.estatisticas_bairro && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Ocorrências Registradas</p>
                    <p className="text-xl font-bold text-primary">{prediction.estatisticas_bairro.total_ocorrencias || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Média de Suspeitos</p>
                    <p className="text-xl font-bold">{prediction.estatisticas_bairro.media_suspeitos?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentual com Arma</p>
                    <p className="text-xl font-bold text-red-600">{prediction.estatisticas_bairro.percentual_com_arma?.toFixed(1) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Posição no Ranking</p>
                    <p className="text-xl font-bold">{prediction.estatisticas_bairro.posicao_no_ranking}º lugar</p>
                  </div>
                </>
              )}
              {prediction.estatisticas_cluster && (
                <div>
                  <p className="text-sm text-gray-600">Bairros com Perfil Similar</p>
                  <p className="text-xl font-bold">{prediction.estatisticas_cluster.total_bairros_cluster}</p>
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded">
                <p className="text-sm font-semibold text-gray-700 mb-1">Recomendação</p>
                <p className="text-sm text-gray-600">{prediction.recomendacao}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quantidade de Bairros por Grupo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clusterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cluster" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bairros" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Visão Comparativa dos Grupos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="cluster" />
              <PolarRadiusAxis />
              <Radar name="Quantidade de Bairros" dataKey="quantidade" stroke="#1e40af" fill="#1e40af" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Todos os Bairros - Ranking Completo</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bairro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocorrências
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média Suspeitos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível de Risco
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ranking.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.posicao || index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.bairro}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.total_ocorrencias || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.media_suspeitos?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.nivel_risco === 'Alto' ? 'bg-red-100 text-red-800' :
                      item.nivel_risco === 'Baixo' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.nivel_risco}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detalhes dos Grupos de Risco</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.isArray(clusterInfo) && clusterInfo.map((cluster) => {
            const isAltoRisco = cluster.descricao.includes('alta')
            const isBaixoRisco = cluster.descricao.includes('baixa')
            return (
              <div key={cluster.cluster_id} className="border-2 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">Grupo {cluster.cluster_id}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    cluster.nivel_risco === 'Alto' ? 'bg-red-100 text-red-800' :
                    cluster.nivel_risco === 'Baixo' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cluster.nivel_risco}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Bairros: <span className="font-semibold">{cluster.total_bairros}</span>
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Média de suspeitos: <span className="font-semibold">{cluster.estatisticas.media_suspeitos?.toFixed(2) || 'N/A'}</span>
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Percentual com arma: <span className="font-semibold text-red-600">{cluster.estatisticas.percentual_com_arma?.toFixed(1) || 0}%</span>
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Total ocorrências: <span className="font-semibold">{cluster.estatisticas.total_ocorrencias || 0}</span>
                </p>
                <p className="text-gray-500 text-xs mt-2">{cluster.descricao}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ClusteringAnalysis
