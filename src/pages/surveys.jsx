import React, { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import HtmlDocViewer from '../components/HtmlDocViewer';
import CongressmenModal from '../components/modals/CongressmenModal'; // 🚀 IMPORT YOUR CONGRESSIONAL MODAL HERE!
import './Surveys.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Surveys({ keepAccordionsOpen, isLoggedIn }) {
  const [groupedDocs, setGroupedDocs] = useState({}); // Stores data grouped by category
  const [modalData, setModalData] = useState(null);
  const [votes, setVotes] = useState({});

  // 🚀 NEW: State parameters layer tracking for your legislator overlays
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
            acc[issueId] = {
              up: voteType === 'up' ? 1 : 0,
              down: voteType === 'down' ? 1 : 0,
              hasVoted: true
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
          if (Array.isArray(globalData)) {
            globalData.forEach(item => {
              updatedVotes[item.issue_id] = {
                up: item.up_votes || 0,
                down: item.down_votes || 0,
                hasVoted: localHistoryMap[item.issue_id]?.hasVoted || false
              };
            });
          }
          return updatedVotes;
        });
      })
      .catch(err => console.error("Error connecting to public votes:", err));
  }, [isLoggedIn]);

  const handleVote = async (id, type) => {
    if (votes[id]?.hasVoted) return;

    setVotes(prev => ({
      ...prev,
      [id]: {
        up: (prev[id]?.up || 0) + (type === 'up' ? 1 : 0),
        down: (prev[id]?.down || 0) + (type === 'down' ? 1 : 0),
        hasVoted: true
      }
    }));

    setModalData(prev => ({
      ...prev,
      votes: {
        up: (prev.votes?.up || 0) + (type === 'up' ? 1 : 0),
        down: (prev.votes?.down || 0) + (type === 'down' ? 1 : 0),
        hasVoted: true
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
          voteType: type
        }),
      });

      if (response.ok) {
        const storedRecord = sessionStorage.getItem('currentUserVotingRecord');
        let currentArray = [];
        try { currentArray = JSON.parse(storedRecord) || []; } catch (e) { }
        if (!Array.isArray(currentArray)) currentArray = [];

        currentArray = currentArray.filter(item => item.issue_id !== id);
        currentArray.push({ issue_id: id, vote: type });
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
      {/* Map grouped keys to the Accordion items (Unchanged) */}
      <Accordion items={Object.keys(groupedDocs).map(category => ({ title: category, content: groupedDocs[category] }))} renderContent={(item) => (
        item.content.map(doc => (
          <div key={doc.id} className="solution-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{doc.title}</span>
            <button disabled={votes[doc.id]?.hasVoted} onClick={() => {
              if (!votes[doc.id]?.hasVoted) {
                setModalData({ ...doc, votes: votes[doc.id] || { up: 0, down: 0, hasVoted: false } });
              }
            }} style={{ padding: '6px 12px', cursor: votes[doc.id]?.hasVoted ? 'not-allowed' : 'pointer', backgroundColor: votes[doc.id]?.hasVoted ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
              {votes[doc.id]?.hasVoted ? '✓ Voted' : 'Vote'}
            </button>
          </div>
        ))
      )} keepOpen={keepAccordionsOpen} />

      {/* 🚀 THE BASE LAYOUT ACTION SECTION BANNER: Placed at the bottom of the screen page */}
      <div style={{ marginTop: '40px', padding: '25px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
          📬 Engage with your Congressional Delegation
        </h4>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569', maxWIdth: '500px', margin: '0 auto 20px auto', lineHeight: '1.4' }}>
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

      {/* The Interactive Voting Dialog Overlay Window */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalData(null)}>x</button>
            <h3>{modalData.title}</h3>
            <HtmlDocViewer url={modalData.url} />
            <hr />
            <div className="vote-group">
              <span>Vote on this idea:</span>
              <button disabled={votes[modalData.id]?.hasVoted} onClick={() => handleVote(modalData.id, 'up')}> 👍 {votes[modalData.id]?.up || 0} </button>
              <button disabled={votes[modalData.id]?.hasVoted} onClick={() => handleVote(modalData.id, 'down')}> 👎 {votes[modalData.id]?.down || 0} </button>
            </div>
            {votes[modalData.id]?.hasVoted && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <p className="voted-msg" style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'green' }}>Thanks for your vote!</p>
                <div className="global-stats-banner" style={{ display: 'inline-block', backgroundColor: '#f8f9fa', padding: '8px 15px', borderRadius: '6px', border: '1px solid #eee', fontSize: '14px', color: '#555' }}>
                  📈 Global Total: <strong style={{ color: 'green' }}>👍 {votes[modalData.id]?.up || 0}</strong> | <strong style={{ color: 'red' }}>👎 {votes[modalData.id]?.down || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render the sub-modal container independently outside your markup flow blocks */}
      <CongressmenModal isOpen={showCongress} onClose={() => setShowCongress(false)} />
    </div>
  );
}