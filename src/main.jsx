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

  if (!apiBaseUrl && import.meta.env.DEV) {
    apiBaseUrl = 'http://localhost:4000'
  }

  if (apiBaseUrl) {
    axios.defaults.baseURL = apiBaseUrl
  }

  if (typeof window !== 'undefined') {
    window.__APP_BASE_URL__ = apiBaseUrl
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        telemetry={false}
        appearance={{
          variables: {
            colorBackground: '#0f1115',
            colorText: '#e2e8f0',
            colorTextSecondary: '#94a3b8',
            colorInputBackground: '#1f232a',
            colorInputText: '#e2e8f0',
            colorPrimary: '#6366f1',
            colorDanger: '#ef4444',
          },
          elements: {
            card: 'bg-[#0f1115] text-slate-200 border border-[#1f232a]',
            navbar: 'bg-[#0f1115] border-r border-[#1f232a]',
            headerTitle: 'text-slate-100',
            headerSubtitle: 'text-slate-500',
            formButtonPrimary: 'bg-indigo-500 hover:bg-indigo-400 text-white',
            formFieldInput:
              'bg-[#1f232a] text-slate-200 border border-[#2b2f36] focus:border-slate-500 focus:ring-1 focus:ring-slate-500/40',
            formFieldLabel: 'text-slate-400',
            footerActionLink: 'text-indigo-300 hover:text-indigo-200',
          },
        }}
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}

boot()
