// src/components/modals/EvaluateModal.jsx
import React, { useState, useEffect } from 'react';

export default function EvaluateModal({ isOpen, modalData, votes, handleVote, isLoggedIn, onClose }) {
  // Local state to track whether the text section is expanded
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. STATE CLEANUP: Fold panels shut whenever a user closes the overlay card completely
  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  // 2. MAIN WINDOW LOCK: Freezes background browser scrollbars when overlay is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Safety gate: block rendering entirely if state is closed or missing
  if (!isOpen || !modalData) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      
      {/* 🖥️ CONTAINER CANVAS CARD */}
      <div className="modal-content evaluation-modal-wide" onClick={e => e.stopPropagation()}>
        
        {/* ==========================================================================
           🏛️ STATIC TOP HEADER TRACK (ALWAYS VISIBLE AT TOP)
           ========================================================================== */}
        <div className="eval-modal-header">
          <button className="close-btn" onClick={onClose}>x</button>
          <h3>{modalData.title}</h3>
          <p>{modalData.desc}</p>
        </div>
        {/* ==========================================================================
           📜 MIDDLE CONTENT SECTION (INDEPENDENT TEXT VIEWPORT SCROLL AREA)
           ========================================================================== */}
        <div className="modal-scrollable-body">
          
          {/* Issue Summary Display Box */}
          <div className="eval-summary-card-box">
            <strong>📝 Issue Summary:</strong>
            <p>{modalData.summary}</p>
            
            {/* 🚀 FIXED TOP TOGGLE: Only renders "more ▼". When clicked, 
                it hides completely from the top card, clearing out all layout gaps! */}
            {!isExpanded && (
              <div className="eval-toggle-row-left">
                <button 
                  type="button" 
                  className="eval-toggle-action-btn" 
                  onClick={() => setIsExpanded(true)}
                >
                  more ▼
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC EXTENDED POLICY HTML DISPLAY REGION */}
          {isExpanded && (
            <div className="eval-expanded-content-view">
              
              {/* THE HTML BOX LAYER: Reverted back to your clean original HTML injection layout format */}
              <div 
                className="database-html-renderer" 
                dangerouslySetInnerHTML={{ __html: modalData.full_content_html || "No document text stored in database." }} 
              />
              
            </div>
          )}
        </div>

        {/* ==========================================================================
           🔘 VOTING CONTAINER FOOTER (FROZEN STATIC TO THE ABSOLUTE BOTTOM EDGE)
           ========================================================================== */}
        <div className="eval-frozen-voting-footer">
          
          {/* 🚀 FIXED BOTTOM LESS LINK: Placed in a left-aligned row block inside 
              the frozen container shell so it aligns perfectly with your text column. 
              Since the footer is frozen, this link stays locked in view at all times! */}
          {isExpanded && (
            <div className="eval-toggle-row-left" style={{ marginBottom: '15px' }}>
              <button
                type="button"
                className="eval-toggle-action-btn"
                onClick={() => {
                  setIsExpanded(false);
                  const scrollPanel = document.querySelector('.modal-scrollable-body');
                  if (scrollPanel) scrollPanel.scrollTop = 0;
                }}
              >
                less ▲
              </button>
            </div>
          )}

          {!votes[modalData.id]?.hasVoted ? (
            <div>
              <span className="eval-vote-prompt-label">Select your position on this initiative statement:</span>
              
              {/* Horizontal Choice Flex Box Row Grid */}
              <div className="eval-likert-flex-row">
                {[
                  { text: 'Strongly Agree', color: '#16a34a', bg: '#f0fdf4' },
                  { text: 'Somewhat Agree', color: '#15803d', bg: '#f0fdf4' },
                  { text: 'Neutral', color: '#475569', bg: '#f8fafc' },
                  { text: 'Somewhat Disagree', color: '#b91c1c', bg: '#fef2f2' },
                  { text: 'Strongly Disagree', color: '#dc2626', bg: '#fef2f2' }
                ].map((opt) => (
                  <button
                    key={opt.text}
                    onClick={() => {
                      if (!isLoggedIn) {
                        alert("🔒 Authentication Required: You must register or sign in to vote on public initiatives.");
                        return;
                      }
                      handleVote(modalData.id, opt.text);
                    }}
                    className="likert-option-btn"
                    style={{ backgroundColor: opt.bg, color: opt.color, border: `1px solid ${opt.color}40` }}
                  >
                    <span>🔘</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Locked Consensus Trends Aggregation Display Box */
            <div className="eval-vote-success-block">
              <p className="voted-msg">🎉 Thanks for your vote! Your response position [ {votes[modalData.id]?.userChoice} ] has been locked.</p>
              <div className="eval-global-stats-banner">
                <strong>📊 Active Community Consensus Trends:</strong>
                <div className="eval-stats-grid-row">
                  <div>🟢 Strongly Agree: <strong>{votes[modalData.id]?.stronglyAgree || 0}</strong></div>
                  <div>🟢 Somewhat Agree: <strong>{votes[modalData.id]?.somewhatAgree || 0}</strong></div>
                  <div>⚪ Neutral: <strong>{votes[modalData.id]?.neutral || 0}</strong></div>
                  <div>🔴 Somewhat Disagree: <strong>{votes[modalData.id]?.somewhatDisagree || 0}</strong></div>
                  <div>🔴 Strongly Disagree: <strong>{votes[modalData.id]?.stronglyDisagree || 0}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
