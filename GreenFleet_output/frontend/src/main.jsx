import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { QueryCacheProvider } from './context/QueryCache.jsx'
import 'leaflet/dist/leaflet.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <QueryCacheProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </QueryCacheProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
