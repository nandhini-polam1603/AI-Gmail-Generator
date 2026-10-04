import React from 'react';
import { Mail, Clock, Trash2, ArrowRight, Sparkles } from './Icons';

export default function HistoryList({
  history,
  onSelectEmail,
  onClearHistory,
  onDeleteHistoryItem,
  currentEmailId,
}) {
  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return (
    <div className="history-card glass-panel animate-fade-in">
      <div className="history-header">
        <div className="history-title-box">
          <Clock size={18} className="history-icon" />
          <h3>Email History</h3>
          <span className="history-count">{history.length}</span>
        </div>
        <button
          type="button"
          className="clear-history-btn"
          onClick={onClearHistory}
          title="Clear all history"
        >
          <Trash2 size={14} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="history-items-list custom-scrollbar">
        {history.map((item) => {
          const isSelected = currentEmailId === item.id;
          return (
            <div
              key={item.id}
              className={`history-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectEmail(item)}
            >
              <div className="history-item-top">
                <span className="history-badge purpose">{item.purpose}</span>
                <span className="history-badge tone">{item.tone}</span>
                <span className="history-time">{item.timestamp}</span>
              </div>
              <div className="history-subject">{item.subject}</div>
              <div className="history-recipient">To: {item.recipient}</div>
              <div className="history-preview-snippet">
                {item.body.slice(0, 90)}...
              </div>

              <div className="history-item-actions">
                <span className="view-link">
                  <span>View</span>
                  <ArrowRight size={13} />
                </span>
                <button
                  type="button"
                  className="delete-item-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  title="Delete from history"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
