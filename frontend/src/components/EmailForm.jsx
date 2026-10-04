import React from 'react';
import { 
  Sparkles, 
  Loader2, 
  Lightbulb, 
  User, 
  Tag, 
  FileText, 
  SlidersHorizontal, 
  Clock 
} from './Icons';

const PURPOSES = [
  'Leave Request',
  'Internship',
  'Job Application',
  'Follow-up',
  'Meeting Request',
  'Complaint',
  'Thank You',
  'College',
  'General',
];

const TONES = [
  { id: 'Formal', label: 'Formal', desc: 'Strictly traditional & polite' },
  { id: 'Professional', label: 'Professional', desc: 'Crisp, respectful & workplace-ready' },
  { id: 'Friendly', label: 'Friendly', desc: 'Warm, personable & approachable' },
  { id: 'Simple', label: 'Simple', desc: 'Clear, direct & jargon-free' },
];

const LENGTHS = [
  { id: 'Short', label: 'Short', desc: '1-2 brief paragraphs' },
  { id: 'Medium', label: 'Medium', desc: 'Balanced & standard length' },
  { id: 'Detailed', label: 'Detailed', desc: 'Comprehensive with full context' },
];

const PRESETS = [
  {
    label: 'Sick Leave',
    recipient: 'Professor Miller',
    purpose: 'Leave Request',
    situation: 'I was absent yesterday because I was sick. I want to request permission to attend the missed lab and submit my assignment tomorrow.',
    tone: 'Professional',
    length: 'Short'
  },
  {
    label: 'Internship Application',
    recipient: 'Hiring Manager',
    purpose: 'Internship',
    situation: 'I am a 3rd-year Computer Science student applying for the Software Development Summer Internship. I have experience with React and Python.',
    tone: 'Professional',
    length: 'Medium'
  },
  {
    label: 'Meeting Request',
    recipient: 'Project Lead',
    purpose: 'Meeting Request',
    situation: 'I would like to schedule a 15-minute sync this Thursday to review our upcoming project milestones and clarify requirements.',
    tone: 'Friendly',
    length: 'Short'
  },
  {
    label: 'Interview Follow-up',
    recipient: 'HR Recruiter',
    purpose: 'Follow-up',
    situation: 'Following up on the interview held on Monday for the Junior Developer position. Reiterate my excitement and inquire about next steps.',
    tone: 'Formal',
    length: 'Medium'
  }
];

export default function EmailForm({
  formData,
  setFormData,
  onGenerate,
  onSimulate503,
  isLoading,
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset) => {
    setFormData({
      recipient: preset.recipient,
      purpose: preset.purpose,
      situation: preset.situation,
      tone: preset.tone,
      length: preset.length,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipient.trim() || !formData.situation.trim() || isLoading) {
      return;
    }
    onGenerate();
  };

  const isFormValid = formData.recipient.trim().length > 0 && formData.situation.trim().length > 0;

  return (
    <div className="form-card glass-panel animate-fade-in">
      {/* Quick Presets Bar */}
      <div className="presets-container">
        <div className="presets-label">
          <Lightbulb size={15} />
          <span>Quick Examples:</span>
        </div>
        <div className="presets-list">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handleApplyPreset(preset)}
              title="Click to auto-fill form with this example"
              disabled={isLoading}
            >
              {preset.label}
            </button>
          ))}
          {onSimulate503 && (
            <button
              type="button"
              className="preset-chip test-503-chip"
              onClick={onSimulate503}
              title="Test 503 error handling & retry mechanism"
              disabled={isLoading}
            >
              🧪 Test 503 Error
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="email-form">
        {/* Recipient & Purpose Grid */}
        <div className="form-grid-2">
          {/* 1. Recipient */}
          <div className="form-group">
            <label htmlFor="recipient" className="form-label">
              <User size={16} className="label-icon" />
              Recipient <span className="required-star">*</span>
            </label>
            <input
              id="recipient"
              type="text"
              className="form-input"
              placeholder="e.g., Professor / HR Manager / Team Lead"
              value={formData.recipient}
              onChange={(e) => handleChange('recipient', e.target.value)}
              required
            />
          </div>

          {/* 2. Email Purpose */}
          <div className="form-group">
            <label htmlFor="purpose" className="form-label">
              <Tag size={16} className="label-icon" />
              Email Purpose
            </label>
            <select
              id="purpose"
              className="form-select"
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
            >
              {PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Describe your situation */}
        <div className="form-group">
          <div className="label-with-hint">
            <label htmlFor="situation" className="form-label">
              <FileText size={16} className="label-icon" />
              Describe your situation <span className="required-star">*</span>
            </label>
            <span className="char-hint">
              {formData.situation.length > 0 ? `${formData.situation.length} chars` : 'Be specific'}
            </span>
          </div>
          <textarea
            id="situation"
            className="form-textarea custom-scrollbar"
            rows={4}
            placeholder="Example: I was absent yesterday because I was sick. I want to request permission to attend the missed lab."
            value={formData.situation}
            onChange={(e) => handleChange('situation', e.target.value)}
            required
          />
        </div>

        {/* 4. Tone Selection */}
        <div className="form-group">
          <label className="form-label">
            <SlidersHorizontal size={16} className="label-icon" />
            Tone
          </label>
          <div className="options-grid tone-grid">
            {TONES.map((tone) => {
              const isSelected = formData.tone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  className={`option-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleChange('tone', tone.id)}
                >
                  <div className="option-title">{tone.label}</div>
                  <div className="option-desc">{tone.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Email Length Selection */}
        <div className="form-group">
          <label className="form-label">
            <Clock size={16} className="label-icon" />
            Email Length
          </label>
          <div className="options-grid length-grid">
            {LENGTHS.map((len) => {
              const isSelected = formData.length === len.id;
              return (
                <button
                  key={len.id}
                  type="button"
                  className={`option-card ${isSelected ? 'active' : ''}`}
                  onClick={() => handleChange('length', len.id)}
                >
                  <div className="option-title">{len.label}</div>
                  <div className="option-desc">{len.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Generate Email Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`generate-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Email</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
