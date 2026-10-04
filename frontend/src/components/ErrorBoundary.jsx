import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ai_email_history');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '500px',
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#ef4444' }}>Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              An unexpected display error occurred. You can click below to reset the view and try again.
            </p>
            <pre style={{
              background: '#f1f5f9',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#334155',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.6rem 1.25rem',
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset App & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
