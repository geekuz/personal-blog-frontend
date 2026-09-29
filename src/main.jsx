import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { analyticsBeforeSend } from './lib/analytics'

// BrowserRouter turns on client-side routing for everything inside it. It reads
// the browser's URL and lets <Routes> (defined in App) decide what to render.
// StrictMode is a dev-only helper that surfaces sloppy patterns early.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Analytics beforeSend={analyticsBeforeSend} />
    </BrowserRouter>
  </StrictMode>,
)
