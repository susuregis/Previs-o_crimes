import React, { useState, useEffect } from 'react'
import { supervisionadoAPI, clusteringAPI } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const PredictionAnalysis = () => {
  const [bairrosList, setBairrosList] = useState([])
  const [formData, setFormData] = useState({
    bairro: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    quantidade_vitimas: 1,
    quantidade_suspeitos: 1,
    arma_utilizada: 'Nenhum'
  })
  const [prediction, setPrediction] = useState(null)
  const [historico, setHistorico] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelInfo, setModelInfo] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [bairrosResponse, modelResponse] = await Promise.all([
        clusteringAPI.getBairros(),
        supervisionadoAPI.getModelInfo().catch(() => ({ data: null }))
      ])
      
      // Extrair lista de bairros do response
      const bairrosData = bairrosResponse.data.bairros
      if (Array.isArray(bairrosData)) {
        // Se já é um array de strings
        if (typeof bairrosData[0] === 'string') {
          setBairrosList(bairrosData)
        } else {
          // Se é um array de objetos com propriedade 'bairro'
          setBairrosList(bairrosData.map(item => item.bairro))
        }
      }
      
      setModelInfo(modelResponse.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      alert('Erro ao carregar dados. Verifique se o backend está rodando.')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['mes', 'ano', 'quantidade_vitimas', 'quantidade_suspeitos'].includes(name) ? parseInt(value) : value
    }))
  }

  const handlePredict = async () => {
    if (!formData.bairro) {
      alert('Por favor, selecione um bairro')
      return
    }
    
    try {
      setLoading(true)
      console.log('Enviando dados:', formData)
      const response = await supervisionadoAPI.predictSingle(formData)
      console.log('Resposta recebida:', response.data)
      setPrediction(response.data)
      
      // Carregar historico do bairro
      if (formData.bairro) {
        try {
          const historicoResponse = await supervisionadoAPI.getHistorico(formData.bairro)
          setHistorico(historicoResponse.data)
        } catch (err) {
          console.warn('Histórico não disponível:', err)
        }
      }
    } catch (error) {
      console.error('Erro completo:', error)
      console.error('Resposta do erro:', error.response?.data)
      const mensagem = error.response?.data?.detail || 'Erro ao fazer previsão. Verifique se o modelo foi treinado.'
      alert(mensagem)
    } finally {
      setLoading(false)
    }
  }

  const armas = ['Nenhum', 'Arma de fogo', 'Arma branca', 'Outras armas']

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Previsão de Crimes</h2>
        <p className="text-gray-600">
          Estime quantos crimes podem ocorrer em um bairro e período específico
        </p>
      </div>

      {modelInfo && (
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded">
          <h3 className="font-semibold text-lg mb-2">Como Funciona</h3>
          <p className="text-sm text-gray-600">
            O sistema analisa padrões históricos e características do local para estimar a quantidade de crimes que podem ocorrer.
            Quanto mais dados históricos disponíveis, mais precisa é a previsão.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Faça sua Consulta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <select
              name="bairro"
              value={formData.bairro}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Selecione um bairro</option>
              {bairrosList.map((bairro, index) => (
                <option key={index} value={bairro}>{bairro}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              name="mes"
              value={formData.mes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                <option key={mes} value={mes}>{mes}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano
            </label>
            <input
              type="number"
              name="ano"
              value={formData.ano}
              onChange={handleInputChange}
              min="2020"
              max="2030"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Vitimas
            </label>
            <input
              type="number"
              name="quantidade_vitimas"
              value={formData.quantidade_vitimas}
              onChange={handleInputChange}
              min="1"
              max="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Suspeitos
            </label>
            <input
              type="number"
              name="quantidade_suspeitos"
              value={formData.quantidade_suspeitos}
              onChange={handleInputChange}
              min="1"
              max="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arma Utilizada
            </label>
            <select
              name="arma_utilizada"
              value={formData.arma_utilizada}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {armas.map(arma => (
                <option key={arma} value={arma}>{arma}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={!formData.bairro || loading}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Calculando...' : 'Fazer Previsão'}
        </button>
      </div>

      {prediction && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultado da Previsão</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary p-6 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Local Consultado</p>
                <p className="text-2xl font-bold text-gray-800">{prediction.bairro}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimativa de Crimes</p>
                <p className="text-4xl font-bold text-primary">{prediction.previsao_crimes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nível de Alerta</p>
                <p className={`text-2xl font-bold ${
                  prediction.nivel_risco === 'Muito Alto' ? 'text-red-600' :
                  prediction.nivel_risco === 'Alto' ? 'text-orange-600' :
                  prediction.nivel_risco === 'Medio' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {prediction.nivel_risco}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Periodo</p>
                <p className="text-lg font-semibold text-gray-700">{prediction.periodo}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Recomendacao</p>
                <p className="text-sm text-gray-700">{prediction.recomendacao}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {historico && historico.historico && historico.historico.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Histórico do Bairro - {historico.bairro}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={historico.historico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="quantidade_crimes" 
                stroke="#1e40af" 
                fill="#1e40af" 
                fillOpacity={0.6}
                name="Quantidade de Crimes"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Meses analisados</p>
                <p className="text-lg font-semibold">{historico.total_registros}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Média mensal</p>
                <p className="text-lg font-semibold">{historico.estatisticas?.media}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mês com mais casos</p>
                <p className="text-lg font-semibold">{historico.estatisticas?.max}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tendência</p>
                <p className={`text-lg font-semibold ${
                  historico.estatisticas?.tendencia === 'crescente' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {historico.estatisticas?.tendencia}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionAnalysis
