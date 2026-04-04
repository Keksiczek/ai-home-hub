import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary">
          <div className="error-boundary-card glass-panel">
            <div className="error-icon-wrap">
              <AlertTriangle size={48} />
            </div>
            <h2>Něco se pokazilo</h2>
            <p className="error-message">
              {this.state.error?.message || 'Neočekávaná chyba aplikace'}
            </p>
            <div className="error-actions">
              <button className="error-btn primary" onClick={this.handleRetry}>
                <RefreshCw size={16} />
                Zkusit znovu
              </button>
              <button className="error-btn secondary" onClick={this.handleReload}>
                Reload stránky
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
