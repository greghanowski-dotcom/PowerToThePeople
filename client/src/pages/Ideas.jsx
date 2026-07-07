import { useState } from 'react';
import Accordion from '../components/Accordion';
import './Ideas.css';

const ideasData = [
    {
        title: 'Budget Deficit & National Debt',
        panelContent: [
            { id: 5, title: 'Spending Reform', details: 'Conducting comprehensive audits to reduce inefficient government spending.' }
        ]
    },
    {
        title: 'Climate Change',
        panelContent: [
            { id: 1, title: 'Carbon Tax', details: 'Implementing a tax on carbon emissions to incentivize clean energy.' },
            { id: 2, title: 'Renewable Subsidies', details: 'Expanding funding for solar and wind infrastructure projects.' }
        ]
    },
    {
        title: 'Healthcare',
        panelContent: [
            { id: 3, title: 'Public Option', details: 'Creating a government-run insurance plan to compete with private providers.' }
        ]
    },
    {
        title: 'Wealth Inequality',
        panelContent: [
            { id: 4, title: 'Wealth Tax', details: 'Levying a tax on high-net-worth individuals to reduce economic disparity.' }
        ]
    },
];

export default function Ideas() {
    const [modalData, setModalData] = useState(null);
    const [votes, setVotes] = useState({});

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
            <Accordion
                items={ideasData}
                renderContent={(item) => (
                    item.panelContent.map(sol => (
                        <div key={sol.id} className="solution-row">
                            <span>{sol.title}</span>
                            <button onClick={() => setModalData({ ...sol, votes: votes[sol.id] || { up: 0, down: 0, hasVoted: false } })}>
                                Details
                            </button>
                        </div>
                    ))
                )}
            />

            {modalData && (
                <div className="modal-overlay" onClick={() => setModalData(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setModalData(null)}>✕</button>
                        <h3>{modalData.title}</h3>
                        <p>{modalData.details}</p>
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