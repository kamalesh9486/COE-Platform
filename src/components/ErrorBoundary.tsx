import { Component, type ReactNode } from 'react'
import Icon from './Icon'

interface Props {
  children: ReactNode
  /** Optional custom fallback UI. Receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render errors in any child component tree and shows a recovery UI
 * instead of a blank white screen. Wrap page-level components in Layout.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset)
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 32px', gap: 16,
          fontFamily: "'Dubai', 'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#dc2626', fontSize: 24,
          }}>
            <Icon name="bi-exclamation-triangle-fill" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1e', marginBottom: 6 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 13, color: '#5a6672', maxWidth: 360 }}>
              {error.message || 'An unexpected error occurred rendering this page.'}
            </div>
          </div>
          <button
            onClick={this.reset}
            style={{
              padding: '8px 20px', borderRadius: 9, border: '1px solid rgba(0,117,96,0.3)',
              background: '#fff', color: '#007560', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            <Icon name="bi-arrow-clockwise" /> Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
