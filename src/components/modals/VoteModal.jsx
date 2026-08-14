import { useState } from 'react';
import '../../styles/VoteModal.css';

export default function VoteModal({ issue, mode, onClose, onSubmit }) {
  const [selectedChoice, setSelectedChoice] = useState('');

  if (!issue) return null;

  const stats = { 'Strongly Agree': '45%', 'Somewhat Agree': '20%', 'Neutral': '15%', 'Somewhat Disagree': '10%', 'Strongly Disagree': '10%' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* X Close Button */}
        <button className="close-x-btn" onClick={onClose}>&times;</button>

        <h2>{mode === 'results' ? 'Consensus: ' + issue.title : issue.title}</h2>
        <p className="description">{issue.desc}</p>

        <div className="scrollable-area">
          {mode === 'results' ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(stats).map(([label, val]) => (
                <li key={label} style={{ marginBottom: '8px' }}>{label}: <strong>{val}</strong></li>
              ))}
            </ul>
          ) : (
            <div className="radio-group">
              {['Strongly Agree', 'Somewhat Agree', 'Neutral', 'Somewhat Disagree', 'Strongly Disagree'].map(opt => (
                <label key={opt} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="vote" value={opt} onChange={(e) => setSelectedChoice(e.target.value)} /> {opt}
                </label>
              ))}
            </div>
          )}

          {mode === 'vote' && (
            <div className="arguments">
              <h3>Arguments For</h3>
              <p>{issue.for}</p>
              <h3>Arguments Against</h3>
              <p>{issue.against}</p>
            </div>
          )}
        </div>

        {/* Center-justified Submit Button */}
        {mode === 'vote' && (
          <div className="modal-actions">
            <button 
              className="submit-btn" 
              onClick={() => onSubmit(selectedChoice)}
              disabled={!selectedChoice}
            >
              Submit Vote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};