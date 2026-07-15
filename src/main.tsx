import { Analytics } from '@vercel/analytics/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ServicePathProvider } from './lib/servicePath'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ServicePathProvider holds the Refit/Shipyard tab selection — it wraps
        the whole app so the header, hero, and landing panels stay in sync. */}
    <ServicePathProvider>
      <App />
    </ServicePathProvider>
    {/* Vercel Web Analytics — auto-tracks pageviews (including SPA route
        changes) and surfaces custom events fired via track() in src/lib/analytics.ts.
        Must be enabled in the Vercel dashboard for data to flow. */}
    <Analytics />
  </React.StrictMode>,
)
