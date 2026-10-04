import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmailForm from './components/EmailForm';
import EmailPreview from './components/EmailPreview';
import HistoryList from './components/HistoryList';
import { AlertCircle, RotateCw } from './components/Icons';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export default function App() {
  const [formData, setFormData] = useState({
    recipient: '',
    purpose: 'Leave Request',
    situation: '',
    tone: 'Professional',
    length: 'Medium',
  });

  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [currentEmailId, setCurrentEmailId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTransientError, setIsTransientError] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'no-key' | 'error' | 'checking'
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_email_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_email_history', JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        if (data.api_key_configured) {
          setBackendStatus('healthy');
        } else {
          setBackendStatus('no-key');
        }
      } else {
        setBackendStatus('error');
      }
    } catch {
      setBackendStatus('error');
    }
  };

  const handleGenerate = async (simulateError = false) => {
    if (isLoading) return; // Prevent duplicate concurrent requests

    setIsLoading(true);
    setError(null);
    setIsTransientError(false);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (simulateError) {
        headers['X-Simulate-Error'] = '503';
      }

      const response = await fetch(`${API_BASE_URL}/generate-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const is503 = response.status === 503 || response.status === 429 || data.detail?.includes('503') || data.detail?.includes('busy');
        if (is503) {
          setIsTransientError(true);
        }
        throw new Error(data.detail || 'Failed to generate email. Please try again.');
      }

      const newId = Date.now();
      const emailObj = {
        id: newId,
        subject: data.subject,
        body: data.body,
        recipient: formData.recipient,
        purpose: formData.purpose,
        situation: formData.situation,
        tone: formData.tone,
        length: formData.length,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setGeneratedEmail({
        subject: data.subject,
        body: data.body,
      });
      setCurrentEmailId(newId);

      // Save to history list
      setHistory((prev) => [emailObj, ...prev]);

      // Smooth scroll to preview section
      setTimeout(() => {
        const previewElement = document.getElementById('preview-section');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      console.error('Generation error:', err);
      const is503 = isTransientError || err.message?.includes('503') || err.message?.includes('busy');
      setIsTransientError(is503);
      setError(err.message || 'An unexpected error occurred while contacting the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setGeneratedEmail({
      subject: item.subject,
      body: item.body,
    });
    setCurrentEmailId(item.id);
    setFormData({
      recipient: item.recipient || '',
      purpose: item.purpose || 'Leave Request',
      situation: item.situation || '',
      tone: item.tone || 'Professional',
      length: item.length || 'Medium',
    });
    setError(null);

    // Scroll to preview
    const previewElement = document.getElementById('preview-section');
    if (previewElement) {
      previewElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('ai_email_history');
    } catch {}
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateNewEmail = () => {
    setGeneratedEmail(null);
    setCurrentEmailId(null);
    setError(null);
    setFormData({
      recipient: '',
      purpose: 'Leave Request',
      situation: '',
      tone: 'Professional',
      length: 'Medium',
    });
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Header backendStatus={backendStatus} onRetryBackend={checkBackendHealth} />

        {error && (
          <div className={`error-toast animate-fade-in ${isTransientError ? 'transient-503' : ''}`}>
            <div className="error-icon-box">
              <AlertCircle size={20} />
            </div>
            <div className="error-message">
              <div className="error-title">
                {isTransientError ? 'Service Temporarily Busy (503)' : 'Notice'}
              </div>
              <div className="error-desc">{error}</div>
            </div>
            <div className="error-toast-actions">
              {isTransientError && (
                <button
                  type="button"
                  className="retry-request-btn"
                  onClick={() => handleGenerate(false)}
                  disabled={isLoading}
                >
                  <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  <span>Retry Request</span>
                </button>
              )}
              <button 
                className="error-dismiss-btn"
                onClick={() => setError(null)}
                title="Dismiss error"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main className="content-grid">
          {/* Left section: Input Form */}
          <section className="form-section">
            <EmailForm
              formData={formData}
              setFormData={setFormData}
              onGenerate={() => handleGenerate(false)}
              onSimulate503={() => handleGenerate(true)}
              isLoading={isLoading}
            />

            {/* Generation History List */}
            <HistoryList
              history={history}
              onSelectEmail={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              currentEmailId={currentEmailId}
            />
          </section>

          {/* Right section: Output Preview */}
          <section id="preview-section" className="preview-section">
            {isLoading ? (
              <div className="skeleton-loading-card glass-panel animate-fade-in">
                <div className="loading-spinner-box">
                  <div className="ai-pulse-dot"></div>
                  <div className="ai-pulse-ring"></div>
                </div>
                <h3>Crafting your professional email...</h3>
                <p>Gemini AI is analyzing your situation, formatting subject line, and tailoring tone.</p>
                <div className="skeleton-lines">
                  <div className="skeleton-line full"></div>
                  <div className="skeleton-line medium"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ) : generatedEmail ? (
              <EmailPreview
                email={generatedEmail}
                setEmail={setGeneratedEmail}
                onRegenerate={() => handleGenerate(false)}
                onNewEmail={handleCreateNewEmail}
                onClear={() => setGeneratedEmail(null)}
                isLoading={isLoading}
                recipient={formData.recipient}
                tone={formData.tone}
                purpose={formData.purpose}
              />
            ) : (
              <div className="empty-state-card glass-panel">
                <div className="empty-state-illustration">
                  ✉️
                </div>
                <h3>Ready to generate</h3>
                <p>Fill in recipient details, choose a tone and purpose, and click <strong>Generate Email</strong> to see your drafted message here.</p>
                <div className="empty-state-features">
                  <span className="feature-pill">⚡ Instant Generation</span>
                  <span className="feature-pill">📋 1-Click Copy</span>
                  <span className="feature-pill">🚀 Direct to Gmail</span>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="footer-container">
          <p>© {new Date().getFullYear()} AI Gmail Generator • Built with React, FastAPI & Google Gemini API</p>
        </footer>
      </div>
    </div>
  );
}
