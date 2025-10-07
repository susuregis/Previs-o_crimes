import React from 'react'
import ReactDOM from 'react-dom/client'
import SimpleTest from './SimpleTest.jsx'

console.log('🚀 Iniciando aplicação React...')
console.log('📍 Root element:', document.getElementById('root'))

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  console.log('✅ Root criado com sucesso')
  
  root.render(
    <React.StrictMode>
      <SimpleTest />
    </React.StrictMode>
  )
  console.log('✅ Aplicação renderizada!')
} catch (error) {
  console.error('❌ Erro ao renderizar:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 50px; text-align: center; color: red;">
      <h1>❌ ERRO AO CARREGAR REACT</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
