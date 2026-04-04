import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppWebSocketProvider } from './context/AppWebSocketContext'
import { ToastProvider } from './context/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import './index.css'
import './Chat.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppWebSocketProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppWebSocketProvider>
    </ErrorBoundary>
  </StrictMode>,
)
