import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ThemeContext, useThemeProvider } from './hooks/use-theme'
import { LanguageContext, useLanguageProvider } from './hooks/use-language'
import { ToastProvider } from './components/Toast'
import './index.css'

import Landing from './pages/Landing'
import RoleSelection from './pages/RoleSelection'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import EventDetail from './pages/EventDetail'
import Ticket from './pages/Ticket'
import MyHistory from './pages/MyHistory'
import Analytics from './pages/Analytics'
import EditEvent from './pages/EditEvent'
import NotFound from './pages/NotFound'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.error("CRITICAL: VITE_CONVEX_URL is not defined. Please set this environment variable in your project settings (Vercel/Netlify) or .env file.");
}

const convex = new ConvexReactClient(convexUrl || "http://localhost:3000");

function App() {
  const theme = useThemeProvider()
  const language = useLanguageProvider()

  return (
    <ThemeContext.Provider value={theme}>
      <LanguageContext.Provider value={language}>
        <ConvexProvider client={convex}>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/event/:eventId" element={<EventDetail />} />
                <Route path="/ticket/:registrationId" element={<Ticket />} />
                <Route path="/my-history" element={<MyHistory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/edit-event/:eventId" element={<EditEvent />} />
                <Route path="/event/:eventId/edit" element={<EditEvent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ConvexProvider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
