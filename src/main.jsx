import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const apiBaseUrl = import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL : import.meta.env.VITE_API_BASE_URL || ''

if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} telemetry={false}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
