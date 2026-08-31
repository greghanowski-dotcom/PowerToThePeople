import React, { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import EvaluateModal from '../components/modals/EvaluateModal';
import CongressmenModal from '../components/modals/CongressmenModal';
//import '../styles/Surveys.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Surveys({ keepAccordionsOpen, isLoggedIn }) {
  const [groupedDocs, setGroupedDocs] = useState({});
  const [modalData, setModalData] = useState(null);
  const [votes, setVotes] = useState({});
  const [showCongress, setShowCongress] = useState(false);
  const isCongressOpen = showCongress;
  const setIsCongressOpen = setShowCongress;

  // src/pages/Surveys.jsx
  useEffect(() => {
    // ==========================================================================
    // 🚀 PIPELINE A: LOAD INITIATIVES LIVE FROM YOUR MYSQL DATABASE ENDPOINT
    // ==========================================================================
    fetch(`${API_URL}/initiatives`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to connect to the live initiatives catalog API.");
        return res.json();
      })
      .then(data => {
        console.log("Fetched initiatives data:", data);
        // Group the incoming database table rows by their category fields dynamically
        const grouped = data.reduce((acc, doc) => {
          const category = doc.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(doc);
          console.log(`Added document ${doc} to category "${category}".`);
          return acc;
        }, {});
        setGroupedDocs(grouped);
      })
      .catch(err => console.error("Database connection failure:", err));

    // ==========================================================================
    // 📦 PIPELINE B: GATHER LOCAL USER VOTING HISTORY RECORDS ARRAYS
    // ==========================================================================
    let localHistoryMap = {};
    const storedVotingRecord = sessionStorage.getItem('currentUserVotingRecord');

    if (isLoggedIn && storedVotingRecord) {
      try {
        const votingHistory = JSON.parse(storedVotingRecord);
        if (Array.isArray(votingHistory)) {
          // Dynamic parsing maps 5-point Likert scale history strings safely
          localHistoryMap = votingHistory.reduce((acc, currentVote) => {
            const issueId = currentVote.issue_id;
            const voteType = currentVote.vote;
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
        console.error("Failed to parse database records:", error);
      }
    }

    setVotes(localHistoryMap);

    // ==========================================================================
    // 📊 PIPELINE C: PULL LIVE AGGREGATE PUBLIC SERVER METRICS FOR CONSENSUS
    // ==========================================================================
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
      .catch(err => console.error("Error connecting to public votes tracker:", err));
  }, [isLoggedIn]);


  const handleVote = async (id, chosenPositionString) => {
    if (votes[id]?.hasVoted) return;

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
      }
    } catch (error) {
      console.error("Network error on port 5000:", error);
    }
  };

  const hasSavedAddress = !!sessionStorage.getItem('currentUserAddress') || !!sessionStorage.getItem('currentUserEmail');

  /* 🚀 FIXED ACCORDION MOUNT IN SURVEYS.JSX */
  return (
    <div className="surveys-page-wrapper">

      {/* 🟢 FIXED: Removed keepOpen={keepAccordionsOpen} loop variables.
        Passing keepOpen={true} allows multiple category sheets to expand and stay open together fluidly! */}
      <Accordion
        items={Object.keys(groupedDocs).map(category => ({ title: category, content: groupedDocs[category] }))}
        renderContent={(item) => (
          item.content.map(doc => (
            <div key={doc.id} className="solution-row">
              <span className="solution-title-text">{doc.title}</span>
              <button
                onClick={() => {
                  setModalData({ ...doc, votes: votes[doc.id] || { stronglyAgree: 0, somewhatAgree: 0, neutral: 0, somewhatDisagree: 0, stronglyDisagree: 0, hasVoted: false, userChoice: null } });
                }}
                className="solution-evaluate-btn"
                style={{
                  cursor: 'pointer',
                  backgroundColor: votes[doc.id]?.hasVoted ? '#10b981' : '#007bff',
                  color: 'white'
                }}
              >
                {votes[doc.id]?.hasVoted ? '✓ Registered' : 'Evaluate'}
              </button>
            </div>
          ))
        )}
        keepOpen={true}
      />

      {/* 📬 CONGRESSIONAL ACTION DELEGATION BANNER SECTION */}
      <div className="eval-advocacy-section-block">
        <h4 className="eval-advocacy-title">📬 Engage with your Congressional Delegation</h4>
        <p className="eval-advocacy-description">
          Generate dynamic advocacy letter updates sharing your private ballot alignments and platform consensus statistics to send directly to your lawmakers.
        </p>

        {/* Horizontal Axis Row holding your premium center button */}
        <div className="eval-toggle-row-center">
          <button
            type="button"
            className="eval-legislators-btn"
            onClick={() => setIsCongressOpen(true)} /* Opens your state handler natively on click */
          >
            See your legislators
          </button>
        </div>
      </div>

      {/* Slide-out evaluation workflow panels */}
      <EvaluateModal
        isOpen={modalData !== null}
        modalData={modalData}
        votes={votes}
        handleVote={handleVote}
        isLoggedIn={isLoggedIn}
        onClose={() => setModalData(null)}
      />
      <CongressmenModal
        isOpen={isCongressOpen}
        show={isCongressOpen}
        showModal={isCongressOpen}
        onClose={() => setIsCongressOpen(false)}
      />
    </div>
  );
}
