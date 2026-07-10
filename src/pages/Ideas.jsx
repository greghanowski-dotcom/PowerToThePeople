import { useState, useEffect } from 'react';
import Accordion from '../components/Accordion'; 
import HtmlDocViewer from '../components/HtmlDocViewer'; 

export default function Ideas() {
    const [docs, setDocs] = useState([]); // Will hold the manifest
    const [modalData, setModalData] = useState(null);
    const [votes, setVotes] = useState({});

    // Load the manifest file on startup
useEffect(() => {
    fetch('/html-docs/manifest.json')
        .then(async (res) => {
            const text = await res.text(); // Get raw text first
            console.log("Raw Response from fetch:", text); // Check the console!
            
            try {
                const data = JSON.parse(text);
                setDocs(data);
            } catch (e) {
                console.error("Failed to parse JSON. Is the file empty or formatted wrong?");
            }
        })
        .catch(err => console.error("Fetch error:", err));
}, []);

    const handleVote = (id, type) => {
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
    };

    return (
        <div>
            {/* The Accordion now maps the dynamic 'docs' array from manifest.json */}
            <Accordion
                items={docs} 
                renderContent={(item) => (
                    <div className="solution-row">
                        <span>{item.title}</span>
                        <button onClick={() => setModalData({ ...item, votes: votes[item.id] || { up: 0, down: 0, hasVoted: false } })}>
                            Details
                        </button>
                    </div>
                )}
            />

            {modalData && (
                <div className="modal-overlay" onClick={() => setModalData(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalData(null)}>✕</button>
                        <h3>{modalData.title}</h3>
                        
                        {/* THE DYNAMIC PART: Instead of p tag, we load the HTML file */}
                        <div className="doc-wrapper">
                            <HtmlDocViewer fileName={modalData.id} />
                        </div>
                        
                        <hr />
                        <div className="vote-group">
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