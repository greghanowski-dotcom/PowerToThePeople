import { useState } from 'react';
import Accordion from '../components/Accordion';
import { VoteModal } from '../components/VoteModal';
import './Polls.css';

const pollsData = [
  { id: 2, title: "Carbon Tax on Imports", description: "Should the country enact tariff penalties on heavy industrial goods imported from nations failing to meet standard climate benchmarks?", for: "Protects native manufacturing clean-tech investments and incentivizes polluting nations to clean up their supply chains.", against: "Likely to drive up consumer prices on everyday items and risk starting global trade retaliations or economic wars.", type: "likert" },
  { id: 3, title: "Federal Term Limits", description: "Should constitutional rules limit supreme court judges and federal congress members to structured term ceilings rather than lifetime appointments?", for: "Encourages systemic legislative turnover, dampens long-term corruption, and introduces modern, generational viewpoints.", against: "Loses essential historical legislative experience and amplifies reliance on unelected backroom corporate lobbyists.", type: "likert" },
  { id: 4, title: "Campaign Finance Reform", description: "Should the government implement stricter regulations on campaign contributions and expenditures?", for: "Encourages systemic legislative turnover, dampens long-term corruption, and introduces modern, generational viewpoints.", against: "Loses essential historical legislative experience and amplifies reliance on unelected backroom corporate lobbyists.", type: "likert" },
];

export default function Polls() {
  const [activeIssue, setActiveIssue] = useState(null);
  const [modalMode, setModalMode] = useState('vote');
  const [userVotes, setUserVotes] = useState({});

  const handleVoteSubmit = (issueId, choice) => {
    setUserVotes(prev => ({ ...prev, [issueId]: choice }));
    setActiveIssue(null);
  };

  return (
    <div>
      <Accordion 
        items={pollsData}
        renderContent={(poll) => (
          <div>
            <p>{poll.description}</p>
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

      {activeIssue && (
        <VoteModal 
          issue={activeIssue}
          mode={modalMode}
          onClose={() => setActiveIssue(null)} 
          onSubmit={(choice) => handleVoteSubmit(activeIssue.id, choice)}
        />
      )}
    </div>
  );
}