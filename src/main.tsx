import { Analytics } from '@vercel/analytics/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* Vercel Web Analytics — auto-tracks pageviews (including SPA route
        changes) and surfaces custom events fired via track() in src/lib/analytics.ts.
        Must be enabled in the Vercel dashboard for data to flow. */}
    <Analytics />
  </React.StrictMode>,
)
