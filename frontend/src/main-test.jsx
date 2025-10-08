import React from 'react'
import ReactDOM from 'react-dom/client'

// Teste super simples
function TestApp() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'blue', fontSize: '40px' }}>
        REACT ESTÁ FUNCIONANDO!
      </h1>
      <p style={{ fontSize: '20px' }}>
        Se você está vendo isso, o React carregou corretamente.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f0f0' }}>
        <p>Teste: {new Date().toLocaleString()}</p>
        <p>Backend API: <a href="http://localhost:8000/docs">http://localhost:8000/docs</a></p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
)
