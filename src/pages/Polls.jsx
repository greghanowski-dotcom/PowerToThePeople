import { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import VoteModal from '../components/modals/VoteModal';
import '../styles/Polls.css';

// 🚀 FIXED: Standardized array keys from 'description' to 'desc' to match child component requirements
const pollsData = [
  { id: 2, title: "Carbon Tax on Imports", desc: "Should the country enact tariff penalties on heavy industrial goods imported from nations failing to meet standard climate benchmarks?", for: "Protects native manufacturing clean-tech investments and incentivizes polluting nations to clean up their supply chains.", against: "Likely to drive up consumer prices on everyday items and risk starting global trade retaliations or economic wars.", type: "likert" },
  { id: 3, title: "Federal Term Limits", desc: "Should constitutional rules limit supreme court judges and federal congress members to structured term ceilings rather than lifetime appointments?", for: "Encourages systemic legislative turnover, dampens long-term corruption, and introduces modern, generational viewpoints.", against: "Loses essential historical legislative experience and amplifies reliance on unelected backroom corporate lobbyists.", type: "likert" },
  { id: 4, title: "Campaign Finance Reform", desc: "Should the government implement stricter regulations on campaign contributions and expenditures?", for: "Dampens hidden financial special interest fundraising loops and returns electoral baseline power to everyday citizens.", against: "Restricts free organizational advocacy speech channels and limits resource capabilities for modern campaign outreach.", type: "likert" },
];

export default function Polls() {
  const [activeIssue, setActiveIssue] = useState(null);
  const [modalMode, setModalMode] = useState('vote');
  const [userVotes, setUserVotes] = useState({});

  // 🚀 Hydrate local voting markers from browser session memory on mount
  useEffect(() => {
    const rawRecord = sessionStorage.getItem('currentUserVotingRecord') || '[]';
    try {
        const parsed = JSON.parse(rawRecord);
        const mapped = parsed.reduce((acc, current) => {
            acc[current.issue_id] = current.vote;
            return acc;
        }, {});
        setUserVotes(mapped);
    } catch(e){}
  }, []);

  const handleVoteSubmit = (issueId, choice) => {
    setUserVotes(prev => ({ ...prev, [issueId]: choice }));
  };

  return (
    <div className="polls-page-container" style={{ padding: '20px 0' }}>
      <h2 style={{ fontSize: '24px', color: '#1e3a8a', marginBottom: '8px' }}>📊 Active Public Referendums</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Select a ballot topic box below to evaluate arguments and record consensus tracking parameters.
      </p>

      <Accordion 
        items={pollsData}
        renderContent={(poll) => (
          <div style={{ padding: '5px 0' }}>
            <p style={{ color: '#475569', marginBottom: '15px' }}>{poll.desc}</p>
            
            {userVotes[poll.id] && (
              <div style={{ padding: '8px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', marginBottom: '15px', display: 'inline-block' }}>
                ✓ Ballot Choice Locked Natively
              </div>
            )}

            <div className="button-group">
              {!userVotes[poll.id] && (
                <button className="vote-btn" onClick={() => { setModalMode('vote'); setActiveIssue(poll); }}>
                  Vote
                </button>
              )}
              <button 
                className="cons-btn" 
                disabled={!userVotes[poll.id]}
                onClick={() => { setModalMode('results'); setActiveIssue(poll); }}
              >
                Consensus
              </button>
            </div>
          </div>
        )}
      />

      {/* 🚀 FIXED: Added the mandatory isOpen property and changed onSubmit to onVoteCast */}
      <VoteModal 
        isOpen={activeIssue !== null}
        issue={activeIssue}
        mode={modalMode}
        onClose={() => setActiveIssue(null)} 
        onVoteCast={(issueId, choice) => handleVoteSubmit(issueId, choice)}
      />
    </div>
  );
}
