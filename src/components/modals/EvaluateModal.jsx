import React from 'react';
import { Link } from 'react-router-dom';
import Accordion from '../Accordion';

export default function EvaluateModal({ isOpen, modalData, votes, handleVote, isLoggedIn, onClose }) {
  // Safety gate: block rendering entirely if state is closed
  if (!isOpen || !modalData) return null;

  // 🚀 FIXED: Slug parameter completely removed!
  // Reads the Title string natively, trims spaces, and generates a clean lowercase URL trail
  const cleanUrlTitle = modalData.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Strips out extra punctuation marks
    .replace(/\s+/g, '-');         // Turns spaces into standard web dashes (-)

  const externalDetailsRoute = `/details/${cleanUrlTitle}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      
      {/* COMBINED CLASSES: Connects with global.css to force the 1200px wide canvas naturally */}
      <div className="modal-content evaluation-modal-wide" onClick={e => e.stopPropagation()}>
        
        {/* Top-Right Corner Absolute Positioned Exit Button */}
        <button className="close-btn" onClick={onClose}>x</button>
        
        <h3 className="modal-issue-heading">{modalData.title}</h3>
        
        {/* Injects the summary description statement text directly from manifest.json */}
        <p className="modal-manifest-description">
          {modalData.desc || "No survey statement summary provided."}
        </p>
        
        {/* SUB-ACCORDION DETAILS PANEL: Houses arguments and the new "Read more" link channel */}
        <div className="sub-accordion-container">
          <div className="compact-modal-accordion">
            <Accordion
              keepOpen={false}
              items={[
                {
                  title: "📋 Details",
                  for: modalData.for || "No supporting parameters logged.",
                  against: modalData.against || "No opposing parameters logged.",
                  summary: modalData.summary || "Review the structured platform balance arguments compiled for this public initiative."
                }
              ]}
              renderContent={(argItem) => (
                /* FIXED COLLAPSE LAYOUT: Pure flat structural components stacking beautifully 
                   with predictable, tight space boundaries. */
                <>
                  {/* Summary Segment Box */}
                  <div style={{ padding: '14px 16px', backgroundColor: '#f8fafc', borderLeft: '4px solid #64748b', margin: '0 0 14px 0', borderRadius: '6px' }}>
                    <strong style={{ display: 'block', color: '#334155', fontSize: '13.5px', fontWeight: 'bold', marginBottom: '4px' }}>📝 Issue Summary:</strong>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>{argItem.summary}</p>
                    
                    {/* 🚀 FIXED READ MORE ACTION LINK: Uses native router Links instead of standard browser hrefs */}
                    <Link 
                      to={externalDetailsRoute} 
                      style={{ color: '#0070f3', fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={onClose} /* Closes the modal popup cleanly so your viewport route is tidy */
                    >
                      📖 Read full document briefs in a separate view page →
                    </Link>
                  </div>

                  {/* Arguments For Card */}
                  <div className="argument-card-for" style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', margin: '0 0 10px 0', width: '100%', boxSizing: 'border-box' }}>
                    <strong className="argument-title-for" style={{ display: 'block', color: '#14803d', fontSize: '13.5px', fontWeight: 'bold', marginBottom: '4px' }}>🟢 Arguments For:</strong>
                    <p className="argument-text-body argument-text-for" style={{ margin: 0, fontSize: '13.5px', color: '#166534', lineHeight: '1.4' }}>{argItem.for}</p>
                  </div>
                  
                  {/* Arguments Against Card */}
                  <div className="argument-card-against" style={{ padding: '12px 16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', margin: '0', width: '100%', boxSizing: 'border-box' }}>
                    <strong className="argument-title-against" style={{ display: 'block', color: '#b91c1c', fontSize: '13.5px', fontWeight: 'bold', marginBottom: '4px' }}>🔴 Arguments Against:</strong>
                    <p className="argument-text-body argument-text-against" style={{ margin: 0, fontSize: '13.5px', color: '#991b1b', lineHeight: '1.4' }}>{argItem.against}</p>
                  </div>
                </>
              )}
            />
          </div>
        </div>
        
        {/* Formal 5-point Likert Scale voting layout section */}
        <div className="likert-vote-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', width: '100%' }}>
          
          {!votes[modalData.id]?.hasVoted ? (
            <>
              <span className="likert-prompt-text">Select your position on this initiative statement:</span>
              
              {/* Horizontal Choice Flex Row */}
              <div className="likert-flex-row">
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
                        alert("🔒 Authentication Required: You are welcome to browse the details of this policy, but you must register or sign in to vote on public initiatives.");
                        onClose(); 
                        return;
                      }
                      handleVote(modalData.id, opt.text);
                    }}
                    className="likert-option-btn"
                    style={{
                      backgroundColor: opt.bg,
                      color: opt.color,
                      border: `1px solid ${opt.color}40`
                    }}
                  >
                    <span className="likert-icon-span">🔘</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Locked Voted Feedback Display Screen Canvas */
            <div className="vote-success-block">
              <p className="voted-msg">
                🎉 Thanks for your vote! Your response position [ {votes[modalData.id]?.userChoice} ] has been locked.
              </p>
              <div className="global-stats-banner">
                <strong className="stats-banner-title">📊 Active Community Consensus Trends:</strong>
                🟢 Strongly Agree: <strong>{votes[modalData.id]?.stronglyAgree || 0}</strong><br />
                🟢 Somewhat Agree: <strong>{votes[modalData.id]?.somewhatAgree || 0}</strong><br />
                ⚪ Neutral: <strong>{votes[modalData.id]?.neutral || 0}</strong><br />
                🔴 Somewhat Disagree: <strong>{votes[modalData.id]?.somewhatDisagree || 0}</strong><br />
                🔴 Strongly Disagree: <strong>{votes[modalData.id]?.stronglyDisagree || 0}</strong>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
