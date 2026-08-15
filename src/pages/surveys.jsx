import React, { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import HtmlDocViewer from '../components/HtmlDocViewer';
import CongressmenModal from '../components/modals/CongressmenModal';
import '../styles/Surveys.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Surveys({ keepAccordionsOpen, isLoggedIn }) {
  const [groupedDocs, setGroupedDocs] = useState({}); // Stores data grouped by category
  const [modalData, setModalData] = useState(null);
  const [votes, setVotes] = useState({});

  // State parameters layer tracking for your legislator overlays
  const [showCongress, setShowCongress] = useState(false);

  useEffect(() => {
    // 1. PIPELINE A: Load and group your document manifest assets
    fetch('/html-docs/manifest.json')
      .then(res => res.json())
      .then(data => {
        const grouped = data.reduce((acc, doc) => {
          const category = doc.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(doc);
          return acc;
        }, {});
        setGroupedDocs(grouped);
      })
      .catch(err => console.error("Error loading manifest:", err));

    // 2. PIPELINE B: Sync dynamic historical user votes if logged in
    let localHistoryMap = {};
    const storedVotingRecord = sessionStorage.getItem('currentUserVotingRecord');

    if (isLoggedIn && storedVotingRecord) {
      try {
        const votingHistory = JSON.parse(storedVotingRecord);
        if (Array.isArray(votingHistory)) {
          localHistoryMap = votingHistory.reduce((acc, currentVote) => {
            const issueId = currentVote.issue_id;
            const voteType = currentVote.vote;

            // Standardize string casing mapping key helper conversion
            const internalKey = voteType.charAt(0).toLowerCase() + voteType.slice(1).replace(/\s+/g, '');

            acc[issueId] = {
              stronglyAgree: internalKey === 'stronglyAgree' ? 1 : 0,
              somewhatAgree: internalKey === 'somewhatAgree' ? 1 : 0,
              neutral: internalKey === 'neutral' ? 1 : 0,
              somewhatDisagree: internalKey === 'somewhatDisagree' ? 1 : 0,
              stronglyDisagree: internalKey === 'stronglyDisagree' ? 1 : 0,
              hasVoted: true,
              userChoice: voteType
            };
            return acc;
          }, {});
        }
      } catch (error) {
        console.error("Failed to parse loaded database voting records:", error);
      }
    }

    setVotes(localHistoryMap);

    // 3. PIPELINE C: Fetch global statistics and merge with user history securely
    fetch(`${API_URL}/global_votes`)
      .then(res => res.json())
      .then(globalData => {
        setVotes(prev => {
          const updatedVotes = { ...localHistoryMap };

          if (globalData && globalData.national) {
            Object.keys(globalData.national).forEach(issueId => {
              const stats = globalData.national[issueId];
              updatedVotes[issueId] = {
                stronglyAgree: stats.stronglyAgree || 0,
                somewhatAgree: stats.somewhatAgree || 0,
                neutral: stats.neutral || 0,
                somewhatDisagree: stats.somewhatDisagree || 0,
                stronglyDisagree: stats.stronglyDisagree || 0,
                hasVoted: localHistoryMap[issueId]?.hasVoted || false,
                userChoice: localHistoryMap[issueId]?.userChoice || null
              };
            });
          }
          return updatedVotes;
        });
      })
      .catch(err => console.error("Error connecting to public votes:", err));
  }, [isLoggedIn]);

  const handleVote = async (id, chosenPositionString) => {
    if (votes[id]?.hasVoted) return;

    // Convert string titles format mapping: 'Strongly Agree' -> 'stronglyAgree'
    const internalKey = chosenPositionString.charAt(0).toLowerCase() + chosenPositionString.slice(1).replace(/\s+/g, '');

    setVotes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [internalKey]: (prev[id]?.[internalKey] || 0) + 1,
        hasVoted: true,
        userChoice: chosenPositionString
      }
    }));

    setModalData(prev => ({
      ...prev,
      votes: {
        ...prev.votes,
        [internalKey]: (prev.votes?.[internalKey] || 0) + 1,
        hasVoted: true,
        userChoice: chosenPositionString
      }
    }));

    try {
      const savedUserId = sessionStorage.getItem('currentUserId') || 1;
      const response = await fetch(`${API_URL}/save_vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(savedUserId, 10),
          issueId: id,
          voteType: chosenPositionString
        }),
      });

      if (response.ok) {
        const storedRecord = sessionStorage.getItem('currentUserVotingRecord');
        let currentArray = [];
        try { currentArray = JSON.parse(storedRecord) || []; } catch (e) { }
        if (!Array.isArray(currentArray)) currentArray = [];

        currentArray = currentArray.filter(item => item.issue_id !== id);
        currentArray.push({ issue_id: id, vote: chosenPositionString });
        sessionStorage.setItem('currentUserVotingRecord', JSON.stringify(currentArray));
      } else {
        const errorData = await response.json();
        console.error("Database rejected vote:", errorData.error);
      }
    } catch (error) {
      console.error("Network interface error on port 5000:", error);
    }
  };
  // Tracks if an address exists inside state or browser memory cache strings to unlock actions
  const hasSavedAddress = !!sessionStorage.getItem('currentUserAddress') || !!sessionStorage.getItem('currentUserEmail');

  return (
    <div style={{ position: 'relative', paddingBottom: '60px' }}>

      {/* Map grouped keys to the Accordion items */}
      <Accordion
        items={Object.keys(groupedDocs).map(category => ({ title: category, content: groupedDocs[category] }))}
        renderContent={(item) => (
          item.content.map(doc => (
            <div key={doc.id} className="solution-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{doc.title}</span>
              {/* 🚀 ALLOW ALL USERS: Guest access route unblocks evaluation button panel */}
              <button
                onClick={() => {
                  setModalData({ ...doc, votes: votes[doc.id] || { stronglyAgree: 0, somewhatAgree: 0, neutral: 0, somewhatDisagree: 0, stronglyDisagree: 0, hasVoted: false, userChoice: null } });
                }}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: votes[doc.id]?.hasVoted ? '#10b981' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}
              >
                {votes[doc.id]?.hasVoted ? '✓ Registered' : 'Evaluate'}
              </button>
            </div>
          ))
        )}
        keepOpen={keepAccordionsOpen}
      />

      {/* 📬 CONGRESSIONAL ACTION DELEGATION BANNER SECTION */}
      <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
          📬 Engage with your Congressional Delegation
        </h4>
        <p style={{ margin: '0 auto 20px auto', fontSize: '14px', color: '#475569', maxWidth: '500px', lineHeight: '1.4' }}>
          Generate dynamic advocacy letter updates sharing your private ballot alignments and platform consensus statistics to send directly to your lawmakers.
        </p>

        <button
          type="button"
          disabled={!hasSavedAddress || !isLoggedIn}
          onClick={() => setShowCongress(true)}
          style={{ padding: '12px 28px', backgroundColor: (hasSavedAddress && isLoggedIn) ? '#6366f1' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: (hasSavedAddress && isLoggedIn) ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '15px', transition: 'background-color 0.2s' }}
        >
          🏛️ See your Legislators
        </button>

        {(!isLoggedIn) ? (
          <small style={{ color: '#ef4444', display: 'block', marginTop: '10px', fontWeight: '500' }}>⚠️ You must log in first to look up representatives parameters.</small>
        ) : !hasSavedAddress ? (
          <small style={{ color: '#ef4444', display: 'block', marginTop: '10px', fontWeight: '500' }}>⚠️ You must save a mailing address inside your 👤 Profile modal settings first to unlock your tracker.</small>
        ) : null}
      </div>

      {/* Interactive Voting Dialog Overlay Window */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setModalData(null)}>x</button>
            <h3 style={{ margin: '0 0 4px 0', color: '#1e3a8a' }}>{modalData.title}</h3>

            {/* Injects the manifest.json "desc" value directly beneath the title heading */}
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px 0', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {modalData.desc || "No survey statement summary provided."}
            </p>

            {/* 🚀 SUB-ACCORDION DETAILS PANEL: Displays For and Against arguments */}
            <div style={{ marginBottom: '20px' }}>
              <Accordion
                keepOpen={false}
                items={[
                  {
                    title: "📋 Details",
                    for: modalData.for || "No supporting parameters logged.",
                    against: modalData.against || "No opposing parameters logged."
                  }
                ]}
                renderContent={(argItem) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '5px 0' }}>
                    <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '4px solid #16a34a' }}>
                      <strong style={{ display: 'block', color: '#14803d', fontSize: '13.5px', marginBottom: '4px' }}>🟢 Arguments For:</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: '1.4' }}>{argItem.for}</p>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', borderLeft: '4px solid #dc2626' }}>
                      <strong style={{ display: 'block', color: '#b91c1c', fontSize: '13.5px', marginBottom: '4px' }}>🔴 Arguments Against:</strong>
                      <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: '1.4' }}>{argItem.against}</p>
                    </div>
                  </div>
                )}
              />
            </div>

            <HtmlDocViewer url={modalData.url} />
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            {/* Formal 5-point Likert Scale voting prompt grid layout */}
            <div className="likert-vote-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {!votes[modalData.id]?.hasVoted ? (
                <>
                  <span style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#1e293b' }}>Select your position on this initiative statement:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
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
                          // 🚀 SECURITY SHIELD GUEST INTERCEPTOR LOCKOUT
                          if (!isLoggedIn) {
                            alert("🔒 Authentication Required: You are welcome to browse the details of this policy, but you must register or sign in to vote on public initiatives.");
                            setModalData(null); // Close the survey details window safely
                            return;
                          }
                          handleVote(modalData.id, opt.text);
                        }}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'left',
                          backgroundColor: opt.bg,
                          color: opt.color,
                          border: `1px solid ${opt.color}40`,
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        🔘 {opt.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ marginTop: '5px', textAlign: 'center' }}>
                  <p className="voted-msg" style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#16a34a', fontSize: '15px' }}>
                    🎉 Thanks for your vote! Your response position [ {votes[modalData.id]?.userChoice} ] has been locked.
                  </p>
                  <div className="global-stats-banner" style={{ display: 'block', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#334155', textAlign: 'left', lineHeight: '1.6' }}>
                    <strong style={{ display: 'block', marginBottom: '6px', fontSize: '13.5px', color: '#1e3a8a', textAlign: 'center' }}>📊 Active Community Consensus Trends:</strong>
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
      )}
      {/* Render the sub-modal container independently outside your markup flow blocks */}
      <CongressmenModal isOpen={showCongress} onClose={() => setShowCongress(false)} />
    </div>
  );
}
