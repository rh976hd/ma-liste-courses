import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Auto-update service worker silently
registerSW({
  onNeedRefresh() {
    // App will update automatically on next load
  },
  onOfflineReady() {
    console.log('App disponible hors-ligne ✓')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
