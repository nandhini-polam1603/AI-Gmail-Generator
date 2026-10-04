import React from 'react';
import { Mail, Sparkles, Zap } from './Icons';

export default function Header({ backendStatus, onRetryBackend }) {
  return (
    <header className="header-container">
      <div className="header-badge">
        <Sparkles size={14} className="badge-icon" />
        <span>Powered by Gemini AI</span>
      </div>
      <div className="header-title-row">
        <div className="logo-icon-wrapper">
          <Mail size={26} className="logo-icon" />
        </div>
        <h1 className="header-title">AI Gmail Generator</h1>
      </div>
      <p className="header-subtitle">Write better emails with AI</p>
      
      {backendStatus === 'error' && (
        <div className="status-banner error">
          <Zap size={15} />
          <span>Backend not connected. Make sure FastAPI server is running on port 8001.</span>
          {onRetryBackend && (
            <button 
              className="retry-btn" 
              onClick={onRetryBackend} 
              style={{ marginLeft: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: 'inherit', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Retry
            </button>
          )}
        </div>
      )}
      {backendStatus === 'no-key' && (
        <div className="status-banner warning">
          <Zap size={15} />
          <span>Gemini API Key missing in backend/.env. Configure your API key to generate emails.</span>
          {onRetryBackend && (
            <button 
              className="retry-btn" 
              onClick={onRetryBackend} 
              style={{ marginLeft: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.1)', color: 'inherit', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Re-check
            </button>
          )}
        </div>
      )}
    </header>
  );
}
