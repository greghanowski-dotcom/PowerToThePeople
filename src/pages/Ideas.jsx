import { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import HtmlDocViewer from '../components/HtmlDocViewer';
import './Ideas.css';

export default function Ideas({ keepAccordionsOpen }) {
    const [groupedDocs, setGroupedDocs] = useState({}); // Stores data grouped by category
    const [modalData, setModalData] = useState(null);
    const [votes, setVotes] = useState({});

    useEffect(() => {
        fetch('/html-docs/manifest.json')
            .then(res => res.json())
            .then(data => {
                // Group the flat manifest array by the 'category' property
                const grouped = data.reduce((acc, doc) => {
                    const category = doc.category || "Uncategorized";
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(doc);
                    return acc;
                }, {});
                setGroupedDocs(grouped);
            })
            .catch(err => console.error("Error loading manifest:", err));
    }, []);

const handleVote = async (id, type) => {
  // 1. Guard clause: Stop if they already voted (This disables the action programmatically)
  if (votes[id]?.hasVoted) return;

  // 2. Update your local React UI state counters instantly
  setVotes(prev => ({
    ...prev,
    [id]: {
      up: (prev[id]?.up || 0) + (type === 'up' ? 1 : 0),
      down: (prev[id]?.down || 0) + (type === 'down' ? 1 : 0),
      hasVoted: true // This flags the issue id as voted
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

  // 3. SECURE PIPELINE: Send data to your native MySQL server
  try {
    const savedUserId = sessionStorage.getItem('currentUserId') || 1; 

    // CRITICAL: Double checking that the IP address string is 100% complete and accurate!
    const response = await fetch('http://127.0.0.1:5000/api/save_vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: parseInt(savedUserId, 10),
        issueId: id,
        voteType: type
      }),
    });

    if (response.ok) {
      // FIXED: Clears out your modal's active document item state, closing the window overlay instantly
      setModalData(null); 
    } else {
      const errorData = await response.json();
      console.error("Database rejected vote:", errorData.error);
    }
  } catch (error) {
    console.error("Network interface error on port 5000:", error);
  }
};


    return (
        <div style={{ position: 'relative' }}>
            {/* Map grouped keys to the Accordion items */}
            <Accordion
                items={Object.keys(groupedDocs).map(category => ({
                    title: category,
                    content: groupedDocs[category]
                }))}
                renderContent={(item) => (
                    item.content.map(doc => (
                        <div key={doc.id} className="solution-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{doc.title}</span>
<button 
  // FIXED: HTML attribute makes the button gray and completely unclickable
  disabled={votes[doc.id]?.hasVoted} 
  
  onClick={() => {
    // Only open the voting modal if they haven't cast a vote yet
    if (!votes[doc.id]?.hasVoted) {
      setModalData({ 
        ...doc, 
        votes: votes[doc.id] || { up: 0, down: 0, hasVoted: false } 
      });
    }
  }}
  style={{
    padding: '6px 12px',
    cursor: votes[doc.id]?.hasVoted ? 'not-allowed' : 'pointer',
    backgroundColor: votes[doc.id]?.hasVoted ? '#6c757d' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold'
  }}
>
  {votes[doc.id]?.hasVoted ? '✓ Voted' : 'Vote'}
</button>
                        </div>
                    ))
                )}
                keepOpen={keepAccordionsOpen}
            />

            {modalData && (
                <div className="modal-overlay" onClick={() => setModalData(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalData(null)}>x</button>
                        <h3>{modalData.title}</h3>
                        <HtmlDocViewer url={modalData.url} />
                        <hr />
                        <div className="vote-group">
                            <span>Vote on this idea:</span>
                            <button disabled={modalData.votes?.hasVoted} onClick={() => handleVote(modalData.id, 'up')}>
                                👍 {modalData.votes?.up || 0}
                            </button>
                            <button disabled={modalData.votes?.hasVoted} onClick={() => handleVote(modalData.id, 'down')}>
                                👎 {modalData.votes?.down || 0}
                            </button>
                        </div>
                        {modalData.votes?.hasVoted && <p className="voted-msg">Thanks for your vote!</p>}
                    </div>
                </div>
            )}
        </div>
    );
}