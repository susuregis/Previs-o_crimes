import React, { useEffect, useState } from 'react'
import { clusteringAPI, supervisionadoAPI } from '../services/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

const Dashboard = () => {
  const [clusterInfo, setClusterInfo] = useState(null)
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Carregando dados do dashboard...')
      
      const [clusterResponse, rankingResponse] = await Promise.all([
        clusteringAPI.getClusterInfo(),
        clusteringAPI.getBairrosRanking()
      ])
      
      console.log('Cluster Response:', clusterResponse.data)
      console.log('Ranking Response:', rankingResponse.data)
      
      // Usar dados EXATOS da API - clusters é um array
      setClusterInfo(clusterResponse.data.clusters || [])
      
      // Usar ranking EXATO da API
      setRanking(rankingResponse.data.top_bairros || [])
      
      console.log('Dados carregados com sucesso!')
    } catch (error) {
      console.error('ERRO DETALHADO ao carregar dados:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response?.data)
      alert('Erro ao carregar dados do dashboard. Verifique se o backend está rodando na porta 8000.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Carregando dados do dashboard...</p>
      </div>
    )
  }

  // Usar dados EXATOS da API - clusterInfo já é um array
  const clusterData = Array.isArray(clusterInfo) ? clusterInfo.map(cluster => ({
    cluster: `Grupo ${cluster.cluster_id}`,
    bairros: cluster.total_bairros,
    media_suspeitos: cluster.estatisticas.media_suspeitos,
    percentual_arma: cluster.estatisticas.percentual_com_arma,
    nivel_risco: cluster.nivel_risco
  })) : []

  const topBairros = ranking.slice(0, 5).map(item => ({
    name: item.bairro,
    ocorrencias: item.total_ocorrencias || 0
  }))
  
  // Se não houver dados, mostrar mensagem
  if (!clusterInfo || (Array.isArray(clusterInfo) && clusterInfo.length === 0)) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Sem dados disponíveis</h3>
        <p className="text-yellow-700">
          Não foi possível carregar os dados. Verifique:
        </p>
        <ul className="list-disc list-inside mt-2 text-yellow-700">
          <li>Backend está rodando na porta 8000</li>
          <li>Abra o console (F12) para ver erros detalhados</li>
          <li>Teste a API: <a href="http://localhost:8000/clustering/" target="_blank" className="underline">http://localhost:8000/clustering/</a></li>
        </ul>
        <button 
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Segurança em Recife - Visão Geral</h2>
            <p className="text-gray-600">
              Análise inteligente de crimes de tráfico de drogas nos bairros de Recife
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="/logo-recife.png" 
              alt="Recife" 
              className="h-24 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Grupos de Risco</h3>
          <p className="text-4xl font-bold text-primary">{clusterData.length}</p>
          <p className="text-sm text-gray-500 mt-2">Áreas agrupadas por padrão de criminalidade</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bairros Analisados</h3>
          <p className="text-4xl font-bold text-secondary">{ranking.length}</p>
          <p className="text-sm text-gray-500 mt-2">Total de bairros monitorados</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Área de Maior Atenção</h3>
          <p className="text-2xl font-bold text-danger">{ranking[0]?.bairro || 'N/A'}</p>
          <p className="text-sm text-gray-500 mt-2">{ranking[0]?.total_ocorrencias || 0} ocorrências registradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Bairros por Grupo de Risco</h3>
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Bairros Mais Perigosos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topBairros}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="ocorrencias"
              >
                {topBairros.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ranking de Bairros - Casos de Tráfico</h3>
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
                    {item.posicao}
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
                      item.nivel_risco === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
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
    </div>
  )
}

export default Dashboard
