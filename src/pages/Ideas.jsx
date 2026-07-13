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
                            <button onClick={() => setModalData({ ...doc, votes: votes[doc.id] || { up: 0, down: 0, hasVoted: false } })}>
                                Vote
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