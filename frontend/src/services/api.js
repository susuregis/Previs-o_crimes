import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Clustering endpoints
export const clusteringAPI = {
  getBairros: () => api.get('/clustering/'),
  predictCluster: (bairro) => api.post('/clustering/predict', { bairro }),
  getClusterInfo: () => api.get('/clustering/clusters/info'),
  getBairrosRanking: () => api.get('/clustering/bairros/ranking'),
}

// Supervised prediction endpoints
export const supervisionadoAPI = {
  getModelInfo: () => api.get('/predicao/'),
  predictSingle: (data) => api.post('/predicao/predict', data),
  predictMultiple: (dataList) => api.post('/predicao/predict/multiplos', { dados: dataList }),
  getHistorico: (bairro) => api.get(`/predicao/historico/${bairro}`),
}

// Health check
export const healthCheck = () => api.get('/')

export default api
