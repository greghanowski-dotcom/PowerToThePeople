import React, { useState, useEffect } from 'react';
import './CongressmenModal.css';

export default function CongressmenModal({ isOpen, onClose }) {
    const [reps, setReps] = useState([]);
    const [history, setHistory] = useState([]);
    const [letters, setLetters] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // 🚀 NEW: State hook tracks which panel index integer is currently clicked open on screen
    const [activePanelIndex, setActivePanelIndex] = useState(null);

    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:5000';
        }
        return '';
    };

    const apiBaseUrl = getBaseUrl();
    const userId = sessionStorage.getItem('currentUserId') || '1';
    const address = sessionStorage.getItem('currentUserAddress') || '';

    useEffect(() => {
        if (!isOpen || !address) return;
        
        const loadLegislatorMatrix = async () => {
            setLoading(true);
            setErr('');
            try {
                // 1. Fetch live Geocodio profiles via our fixed backend pipeline
                const repRes = await fetch(`${apiBaseUrl}/api/lookup_politicians`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                });
                const repData = await repRes.json();
                if (!repRes.ok) throw new Error(repData.error || 'Failed lookup.');

                // 2. Fetch tracking dates history matrices
                const historyRes = await fetch(`${apiBaseUrl}/api/letter_history/${userId}`);
                const historyData = await historyRes.json();
                setHistory(Array.isArray(historyData) ? historyData : []);

                // 3. Compile platform core issues and generate the data summary blocks
                const rawRecord = sessionStorage.getItem('currentUserVotingRecord') || '[]';
                let voterHistory = [];
                try { voterHistory = JSON.parse(rawRecord); } catch(e) {}

                let legislativeSummaryText = '';
                if (voterHistory.length === 0) {
                    legislativeSummaryText = "\n[No specific consensus ballot records logged yet for this voter profile.]\n";
                } else {
                    voterHistory.forEach((item) => {
                        legislativeSummaryText += ` - Issue ID #${item.issue_id}: Voter choice aligned [${item.vote.toUpperCase()}].\n`;
                    });
                }

                // Generate text initial drafts for each mapped representative row natively
                const generatedDrafts = {};
                repData.politicians.forEach(p => {
                    generatedDrafts[p.name] = `To: ${p.name} (${p.role})\n` +
                        `From: Registered Constituent (ID: ${userId})\n` +
                        `Date: ${new Date().toLocaleDateString()}\n\n` +
                        `Dear Legislator,\n\n` +
                        `I am writing to share my direct alignment feedback along with global consensus metrics gathered via our verified platform infrastructure:\n\n` +
                        `${legislativeSummaryText}\n` +
                        `Please take these platform consensus statistics into direct consideration when voting on upcoming policy updates.\n\n` +
                        `Sincerely,\nVerified Voter`;
                });

                setLetters(generatedDrafts);
                setReps(repData.politicians);
                
                // 🚀 Automatically open the absolute first politician accordion panel by default on load
                if (repData.politicians.length > 0) {
                    setActivePanelIndex(0);
                }
            } catch (error) {
                setErr(error.message || 'Mailing address mapping failed.');
            } finally {
                setLoading(false);
            }
        };

        loadLegislatorMatrix();
    }, [isOpen, address]);

    // Handles expanding/collapsing individual panels on click
    const handleAccordionToggle = (index) => {
        setActivePanelIndex(activePanelIndex === index ? null : index);
    };

    const handleSendLetter = async (repName, repRole) => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/dispatch_letter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    recipientName: repName,
                    recipientRole: repRole,
                    letterText: letters[repName]
                })
            });
            const data = await res.json();
            if (!res.ok) return alert(data.error || 'Transmission block failed.');

            alert(`🎉 Advocacy letter text logged successfully to ${repName}!`);
            
            // Refresh local transaction dates metrics arrays instantly
            const freshRes = await fetch(`${apiBaseUrl}/api/letter_history/${userId}`);
            const freshData = await freshRes.json();
            setHistory(Array.isArray(freshData) ? freshData : []);
        } catch (e) {
            alert('Failed to transmit letter configuration records.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="congress-overlay">
            <div className="congress-card">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', textAlign: 'center' }}> U.S. Congressional Delegation</h3>
                <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '25px' }}>
                    Click on any lawmaker below to expand their contact information profile and review your consensus advocacy text letter drafts.
                </p>

                {loading && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>⏳ Fetching congressional boundaries from Geocodio API...</p>}
                {err && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px' }}>⚠️ {err}</div>}

                {/* 🚀 THE FIXED ACCORDION INTERFACE ACCORDION LOOP */}
                {!loading && !err && reps.map((p, index) => {
                    const isExpanded = activePanelIndex === index;
                    const lastSentRow = history.find(h => h.recipient_name === p.name);
                    const cooldownActive = lastSentRow && (new Date() - new Date(lastSentRow.dispatched_at) < 7 * 24 * 60 * 60 * 1000);

                    // Set standard party badge formatting variables themes
                    const badgeBg = p.party === 'Republican' ? '#dc2626' : p.party === 'Democrat' ? '#2563eb' : '#4b5563';

                    return (
                        <div key={p.name} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                            {/* 📂 PANEL ACCORDION TRIGGER HEADER BUTTON ROW */}
                            <div 
                                onClick={() => handleAccordionToggle(index)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: isExpanded ? '#f8fafc' : '#ffffff', cursor: 'pointer', userSelect: 'none', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', transition: 'background-color 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{p.name}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff', backgroundColor: badgeBg, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                                        {p.party}
                                    </span>
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}>
                                    {isExpanded ? '▲' : '▼'}
                                </span>
                            </div>

                            {/* 📂 ACCORDION INSIDE DRAWER CONTENT BODY */}
                            {isExpanded && (
                                <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563', fontWeight: 'bold' }}>{p.role}</p>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#334155' }}><strong>📍 Washington Office Address:</strong> {p.address}</p>
                                    <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#334155' }}><strong>📞 Office Phone Line:</strong> {p.phone}</p>

                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#1e293b' }}>
                                        Advocacy Transcript Letter Draft:
                                    </label>
                                    <textarea 
                                        className="letter-box" 
                                        value={letters[p.name] || ''} 
                                        onChange={(e) => setLetters({ ...letters, [p.name]: e.target.value })}
                                        style={{ width: '100%', height: '160px', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.4', boxSizing: 'border-box', resize: 'vertical' }}/>
                                    <button
                                        disabled={cooldownActive}
                                        onClick={() => handleSendLetter(p.name, p.role)}
                                        style={{ marginTop: '14px', padding: '10px 18px', backgroundColor: cooldownActive ? '#cbd5e1' : '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: cooldownActive ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                    >
                                        {cooldownActive ? '✓ Summary Letter Dispatched' : '✉️ Confirm & Record Send'}
                                    </button>
                                    {lastSentRow && (
                                        <small className="cooldown-badge" style={{ display: 'block', marginTop: '10px', color: '#b45309', fontWeight: 'bold', fontSize: '12px' }}>
                                            ⚠️ Anti-Spam Guard Active. Last Sent: {new Date(lastSentRow.dispatched_at).toLocaleString()}. You can log another update after 7 days.
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}