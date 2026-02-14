import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const boot = async () => {
  let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

  if (typeof window !== 'undefined' && window.electronAPI?.getConfig) {
    try {
      const config = await window.electronAPI.getConfig()
      if (config?.isPackaged && config?.apiBaseUrl) {
        apiBaseUrl = config.apiBaseUrl
      }
    } catch (error) {
      console.error('Electron config load failed', error)
    }
  }

  if (apiBaseUrl) {
    axios.defaults.baseURL = apiBaseUrl
  }

  if (typeof window !== 'undefined') {
    window.__APP_BASE_URL__ = apiBaseUrl
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={clerkPublishableKey} telemetry={false}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}

boot()
