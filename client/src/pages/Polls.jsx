import { useState } from 'react';
import { Accordion } from '../components/Accordion';
import { VoteModal } from '../components/VoteModal';
import './Polls.css';

const politicalIssues = [
  { id: 2, title: "Carbon Tax on Imports", desc: "Should the country enact tariff penalties on heavy industrial goods imported from nations failing to meet standard climate benchmarks?", for: "Protects native manufacturing clean-tech investments and incentivizes polluting nations to clean up their supply chains.", against: "Likely to drive up consumer prices on everyday items and risk starting global trade retaliations or economic wars.", type: "likert" },
  { id: 3, title: "Federal Term Limits", desc: "Should constitutional rules limit supreme court judges and federal congress members to structured term ceilings rather than lifetime appointments?", for: "Encourages systemic legislative turnover, dampens long-term corruption, and introduces modern, generational viewpoints.", against: "Loses essential historical legislative experience and amplifies reliance on unelected backroom corporate lobbyists.", type: "likert" },
  // ... (rest of your issues)
];

const Polls = () => {
  const [activeIssue, setActiveIssue] = useState(null);
  const [modalMode, setModalMode] = useState('vote'); // 'vote' or 'results'
  const [userVotes, setUserVotes] = useState({}); // Stores { issueId: choice }

  const handleVoteSubmit = (issueId, choice) => {
    setUserVotes(prev => ({ ...prev, [issueId]: choice }));
    setActiveIssue(null);
  };

  return (
    <div className="polls-page">
      <Accordion title="How Our System Works">
        <p>We believe in a democratic process that is transparent, secure, and impactful.</p>
        <hr />
        <h3>Requirements for Participation</h3>
        <ul>
          <li><strong>Age:</strong> At least 18 years old.</li>
          <li><strong>Citizenship:</strong> United States citizen.</li>
        </ul>
      </Accordion>

      <div id="issuesContainer">
        {politicalIssues.map((issue) => (
          <Accordion key={issue.id} title={issue.title}>
            <p>{issue.desc}</p>
            <div className="button-group">
              {!userVotes[issue.id] && (
                <button className="vote-btn" onClick={() => { setModalMode('vote'); setActiveIssue(issue); }}>
                  Vote
                </button>
              )}
              <button 
                className="cons-btn" 
                disabled={!userVotes[issue.id]}
                onClick={() => { setModalMode('results'); setActiveIssue(issue); }}
              >
                Consensus
              </button>
            </div>
          </Accordion>
        ))}
      </div>

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
};

export default Polls;