import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  RotateCw, 
  ExternalLink, 
  Trash2, 
  Mail, 
  Edit3, 
  Eye,
  Sparkles
} from './Icons';

export default function EmailPreview({
  email,
  setEmail,
  onRegenerate,
  onNewEmail,
  onClear,
  isLoading,
  recipient,
  tone,
  purpose,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!email || (!email.subject && !email.body)) {
    return null;
  }

  // Build full email string for copying
  const getFullEmailText = () => {
    return `Subject: ${email.subject}\n\n${email.body}`;
  };

  const handleCopy = async () => {
    try {
      const fullText = getFullEmailText();
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = getFullEmailText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenInGmail = () => {
    // Standard Gmail web compose URL
    const subjectParam = encodeURIComponent(email.subject || '');
    const bodyParam = encodeURIComponent(email.body || '');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subjectParam}&body=${bodyParam}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="preview-card glass-panel animate-fade-in">
      {/* Top action bar */}
      <div className="preview-header">
        <div className="preview-header-left">
          <div className="preview-avatar">
            <Mail size={18} />
          </div>
          <div>
            <div className="preview-title">Generated Email Draft</div>
            <div className="preview-meta">
              <span className="badge-tag">{purpose}</span>
              <span className="badge-tag tone-tag">{tone} Tone</span>
              {recipient && <span className="badge-tag to-tag">To: {recipient}</span>}
            </div>
          </div>
        </div>

        <div className="preview-header-right">
          <button
            type="button"
            className="toggle-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Switch to Preview' : 'Edit Email'}
          >
            {isEditing ? <Eye size={15} /> : <Edit3 size={15} />}
            <span>{isEditing ? 'Preview' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Main Email Box (Gmail-like styling) */}
      <div className="email-content-box">
        {/* Subject Area */}
        <div className="subject-box">
          <span className="subject-label">Subject:</span>
          {isEditing ? (
            <input
              type="text"
              className="edit-subject-input"
              value={email.subject}
              onChange={(e) => setEmail((prev) => ({ ...prev, subject: e.target.value }))}
            />
          ) : (
            <div className="subject-text">{email.subject}</div>
          )}
        </div>

        {/* Divider */}
        <div className="email-divider"></div>

        {/* Body Area */}
        <div className="body-box">
          {isEditing ? (
            <textarea
              className="edit-body-textarea custom-scrollbar"
              rows={12}
              value={email.body}
              onChange={(e) => setEmail((prev) => ({ ...prev, body: e.target.value }))}
            />
          ) : (
            <div className="email-body-text custom-scrollbar">
              {email.body.split('\n').map((paragraph, index) => (
                <p key={index} className={paragraph.trim() === '' ? 'empty-p' : ''}>
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="preview-actions-row">
        <div className="left-actions">
          {/* 1. Copy Email */}
          <button
            type="button"
            className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={17} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={17} />
                <span>Copy Email</span>
              </>
            )}
          </button>

          {/* 2. Regenerate */}
          <button
            type="button"
            className="action-btn regenerate-btn"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            <RotateCw size={17} className={isLoading ? 'animate-spin' : ''} />
            <span>Regenerate</span>
          </button>
        </div>

        <div className="right-actions">
          {/* New Email */}
          {onNewEmail && (
            <button
              type="button"
              className="action-btn new-email-btn"
              onClick={onNewEmail}
              title="Compose another email"
            >
              <Sparkles size={16} />
              <span>+ New Email</span>
            </button>
          )}

          {/* 3. Open in Gmail */}
          <button
            type="button"
            className="action-btn gmail-btn"
            onClick={handleOpenInGmail}
            title="Open pre-filled compose window in Gmail"
          >
            <ExternalLink size={17} />
            <span>Open in Gmail</span>
          </button>

          {/* 4. Clear */}
          <button
            type="button"
            className="action-btn clear-btn"
            onClick={onClear}
            title="Clear preview"
          >
            <Trash2 size={17} />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
