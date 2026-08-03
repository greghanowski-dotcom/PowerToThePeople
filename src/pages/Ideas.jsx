import React, { useState, useEffect } from 'react';
import Accordion from '../components/Accordion';
import HtmlDocViewer from '../components/HtmlDocViewer';
import './Ideas.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Ideas({ keepAccordionsOpen, isLoggedIn }) {
    const [groupedDocs, setGroupedDocs] = useState({}); // Stores data grouped by category
    const [modalData, setModalData] = useState(null);
    const [votes, setVotes] = useState({});

    useEffect(() => {
        // 1. PIPELINE A: Load and group your document manifest assets (Unchanged)
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
                            hasVoted: true // This locks your buttons on screen mount
                        };
                        return acc;
                    }, {});
                }
            } catch (error) {
                console.error("Failed to parse loaded database voting records:", error);
            }
        }

        // Initialize state with your local historical locks first so they render immediately
        setVotes(localHistoryMap);

        // 3. PIPELINE C: Fetch global statistics and merge with user history securely
        fetch(`${API_URL}/global_votes`)
            .then(res => res.json())
            .then(globalData => {
                setVotes(prev => {
                    // Start fresh with current user's history map layer
                    const updatedVotes = { ...localHistoryMap };
                    
                    if (Array.isArray(globalData)) {
                        globalData.forEach(item => {
                            // Merge the public counts into the map structure securely
                            updatedVotes[item.issue_id] = {
                                up: item.up_votes || 0,
                                down: item.down_votes || 0,
                                // 🚀 FIXED: Checks your real local state history map instead of missing variables!
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
                // 🚀 FIXED: Removed setModalData(null) to keep your overlay window open after voting!
                
                // Update local session storage record cache so it remembers on a page refresh
                const storedRecord = sessionStorage.getItem('currentUserVotingRecord');
                let currentArray = [];
                try { currentArray = JSON.parse(storedRecord) || []; } catch(e) {}
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

    return (
        <div style={{ position: 'relative' }}>
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
                        {/* FIXED RENDERING PIPELINE: Positions the live database-backed public counts underneath the vote confirmation text */}
                        {votes[modalData.id]?.hasVoted && (
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <p className="voted-msg" style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'green' }}>
                                    Thanks for your vote!
                                </p>
                                <div className="global-stats-banner" style={{ display: 'inline-block', backgroundColor: '#f8f9fa', padding: '8px 15px', borderRadius: '6px', border: '1px solid #eee', fontSize: '14px', color: '#555' }}>
                                    <span>📈 Global Total: </span>
                                    <strong style={{ color: 'green' }}>👍 {votes[modalData.id]?.up || 0}</strong>
                                    <span style={{ margin: '0 8px' }}>|</span>
                                    <strong style={{ color: 'red' }}>👎 {votes[modalData.id]?.down || 0}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
