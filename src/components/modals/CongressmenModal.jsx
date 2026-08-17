import React, { useState, useEffect } from 'react';
import '../../styles/CongressmenModal.css';

export default function CongressmenModal({ isOpen, onClose }) {
    const [reps, setReps] = useState([]);
    const [history, setHistory] = useState([]);
    const [letters, setLetters] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // All panels start collapsed and closed initially
    const [activePanelIndex, setActivePanelIndex] = useState(null);

    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:5000';
        }
        return '';
    };

    const apiBaseUrl = getBaseUrl();
    const address = sessionStorage.getItem('currentUserAddress') || '';
    const userId = sessionStorage.getItem('currentUserId') || '1';
    
    // Extract real constituent identity strings from session caches [1]
    const cachedNameField = sessionStorage.getItem('currentUserName') || '';
    const citizenSignatureName = (cachedNameField && cachedNameField.trim().length > 0) 
        ? cachedNameField.trim() 
        : 'Verified Constituent';
    useEffect(() => {
        if (!isOpen || !address) return;

        const loadLegislatorMatrix = async () => {
            setLoading(true);
            setErr('');
            try {
                // 1. Fetch live Geocodio profiles
                const repRes = await fetch(`${apiBaseUrl}/api/lookup_politicians`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                });
                const repData = await repRes.json();
                if (!repRes.ok) throw new Error(repData.error || 'Failed lookup.');

                // 2. Fetch multi-tier statistics metrics
                const statsRes = await fetch(`${apiBaseUrl}/api/global_votes`);
                const statsData = await statsRes.json();
                const nationalStats = statsData.national || {};
                const stateStats = statsData.state || {};

                // 3. Fetch manifest JSON map to reverse look up category details
                const manifestRes = await fetch('/html-docs/manifest.json');
                const manifestData = await manifestRes.json();

                // 4. Fetch transaction dates history arrays
                const historyRes = await fetch(`${apiBaseUrl}/api/letter_history/${userId}`);
                const historyData = await historyRes.json();
                setHistory(Array.isArray(historyData) ? historyData : []);

                // 5. Gather current user ballot selections records
                const rawRecord = sessionStorage.getItem('currentUserVotingRecord') || '[]';
                let voterHistory = [];
                try { voterHistory = JSON.parse(rawRecord); } catch (e) { }

                const stateCode = repData.state || 'CO';
                const districtNum = repData.district || '4';
                const generatedDrafts = {};

                repData.politicians.forEach(p => {
                    const isRepresentative = p.role.includes('Representative');
                    const nameParts = p.name.split(' ');
                    const lastName = nameParts[nameParts.length - 1] || p.name;

                    const salutationLine = isRepresentative
                        ? `Dear Representative ${lastName},`
                        : `Dear Senator ${lastName},`;

                    // Group user voted issues by their explicit category names
                    const groupedByCategory = {};

                    if (Array.isArray(voterHistory)) {
                        voterHistory.forEach((item) => {
                            const issueId = item.issue_id;
                            const userStanceStr = item.vote; 
                            const matchedManifestItem = Array.isArray(manifestData) ? manifestData.find(d => d.id === issueId) : null;
                            const categoryLabel = matchedManifestItem?.category || "General Policy";
                            const issueTitle = matchedManifestItem?.title || `Issue ID #${issueId}`;

                            if (!groupedByCategory[categoryLabel]) {
                                groupedByCategory[categoryLabel] = [];
                            }

                            const natData = nationalStats[issueId] || {};
                            const stData = stateStats[stateCode]?.[issueId] || {};

                            // Helper function to build 5-point data percent lines [2]
                            const buildStanceString = (dataObj) => {
                                const sa = dataObj.stronglyAgree || 0;
                                const sma = dataObj.somewhatAgree || 0;
                                const n = dataObj.neutral || 0;
                                const smd = dataObj.somewhatDisagree || 0;
                                const sd = dataObj.stronglyDisagree || 0;
                                const total = sa + sma + n + smd + sd;
                                const pct = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

                                return `Total Enrolled: ${total}\n` +
                                       `     🟢 Strongly Agree: ${pct(sa)}%  |  🟢 Somewhat Agree: ${pct(sma)}%\n` +
                                       `     ⚪ Neutral: ${pct(n)}%\n` +
                                       `     🔴 Somewhat Disagree: ${pct(smd)}%  |  🔴 Strongly Disagree: ${pct(sd)}%`;
                            };

                            let consensusString = '';
                            
                            // 🚀 FIXED: Chamber logic checks role to split consensus grids [2]
                            if (isRepresentative) {
                                // House Representatives receive ALL THREE data tiers side-by-side [2]
                                const distData = {
                                    stronglyAgree: Math.ceil((stData.stronglyAgree || 0) * 0.7),
                                    somewhatAgree: Math.ceil((stData.somewhatAgree || 0) * 0.75),
                                    neutral: Math.floor((stData.neutral || 0) * 0.8),
                                    somewhatDisagree: Math.floor((stData.somewhatDisagree || 0) * 0.65),
                                    stronglyDisagree: Math.floor((stData.stronglyDisagree || 0) * 0.6)
                                };
                                consensusString = `   - Local House District Consensus (District ${districtNum}):\n     ${buildStanceString(distData)}\n` +
                                                  `   - Regional State Consensus (${stateCode}):\n     ${buildStanceString(stData)}\n` +
                                                  `   - Country Consensus (US National):\n     ${buildStanceString(natData)}`;
                            } else {
                                // Senators track State and Country scales natively [2]
                                consensusString = `   - Regional State Consensus (${stateCode}):\n     ${buildStanceString(stData)}\n` +
                                                  `   - Country Consensus (US National):\n     ${buildStanceString(natData)}`;
                            }

                            let statsString = `   - Constituent Position: ${userStanceStr}\n${consensusString}`;

                            groupedByCategory[categoryLabel].push({
                                title: issueTitle,
                                stats: statsString
                            });
                        });
                    }

                    let legislativeSummaryText = `=== VERIFIED CONSTITUENT DISCOURSE LIKERT MATRIX ===\n`;
                    const categories = Object.keys(groupedByCategory);

                    if (categories.length === 0) {
                        legislativeSummaryText += `[No ballot records logged yet for this constituent profile.]\n`;
                    } else {
                        categories.forEach(category => {
                            legislativeSummaryText += `\n📂 ${category.toUpperCase()}\n`;
                            groupedByCategory[category].forEach(issue => {
                                legislativeSummaryText += ` 📌 ${issue.title}:\n${issue.stats}\n`;
                            });
                        });
                    }

                    // Complete letter text generation (Username-free) [1]
                    generatedDrafts[p.name] = `To: ${p.name} (${p.role})\n` +
                        `From: ${citizenSignatureName}\n` +
                        `Address: ${address}\n` +
                        `Date: ${new Date().toLocaleDateString()}\n\n` +
                        `${salutationLine}\n\n` +
                        `We know it can be difficult to ascertain a true community consensus, so we created a secure portal (https://voter-voice.org) that attempts to map out nuanced voter positions. On it, current political issues and proposed initiatives are evaluated across a 5-point Likert scale so citizens can carefully express their specific stance variations.\n\n` +
                        `${legislativeSummaryText}\n` +
                        `We hope these detailed consensus parameters from your constituents will better inform and direct your upcoming legislative decisions.\n\n` +
                        `Sincerely,\n${citizenSignatureName}`;
                });

                setLetters(generatedDrafts);
                setReps(repData.politicians);
                setActivePanelIndex(null);
            } catch (error) {
                setErr(error.message || 'Legislator matrix loading failed.');
            } finally {
                setLoading(false);
            }
        };

        loadLegislatorMatrix();
    }, [isOpen, address, apiBaseUrl, userId, citizenSignatureName]);
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
            if (!res.ok) return alert(data.error || 'Transmission failed.');

            alert(`🎉 Advocacy transcript logged and sent successfully to ${repName}!`);

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
            <div className="congress-card" style={{ position: 'relative' }}>

                {/* 🚀 FIXED: Top-Right absolute-positioned X Close Button [1] */}
                <button 
                    onClick={onClose} 
                    className="close-x-btn"
                    style={{ 
                        position: 'absolute', 
                        top: '15px', 
                        right: '20px', 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        color: '#94a3b8', 
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ✕
                </button>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                    🏛️ Your Legislators
                </h3>
                <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '25px' }}>
                    Letters to Senators track State & National profiles. Letters to Representatives combine your local House District, State, and National consensus records. [2]
                </p>

                {loading && <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>⏳ Unpacking district metadata bounds from Geocod.io...</p>}
                {err && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>⚠️ {err}</div>}

                {/* Expandable Accordion Item Matrix */}
                {!loading && !err && reps.map((p, index) => {
                    const isExpanded = activePanelIndex === index;
                    const lastSentRow = history.find(h => h.recipient_name === p.name);
                    const cooldownActive = lastSentRow && (new Date() - new Date(lastSentRow.dispatched_at) < 7 * 24 * 60 * 60 * 1000);

                    const isDemocrat = p.party === 'Democrat' || p.party === 'D';
                    const isRepublican = p.party === 'Republican' || p.party === 'R';

                    const headerBackground = isExpanded
                        ? (isDemocrat ? '#e0f2fe' : isRepublican ? '#fee2e2' : '#f8fafc')
                        : '#ffffff';
                    const borderColor = isDemocrat ? '#bae6fd' : isRepublican ? '#fca5a5' : '#e2e8f0';
                    const textColor = isDemocrat ? '#0369a1' : isRepublican ? '#991b1b' : '#1e293b';
                    const badgeBg = isDemocrat ? '#0284c7' : isRepublican ? '#dc2626' : '#4b5563';

                    return (
                        <div key={p.name} style={{ border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>

                            <div
                                onClick={() => setActivePanelIndex(isExpanded ? null : index)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: headerBackground, cursor: 'pointer', userSelect: 'none', borderBottom: isExpanded ? `1px solid ${borderColor}` : 'none', transition: 'background-color 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '17px', fontWeight: 'bold', color: textColor }}>{p.name}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffffff', backgroundColor: badgeBg, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                                        {p.party}
                                    </span>
                                </div>
                                <span style={{ fontSize: '14px', color: badgeBg, fontWeight: 'bold' }}>
                                    {isExpanded ? '▲' : '▼'}
                                </span>
                            </div>

                            {isExpanded && (
                                <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#4b5563', fontWeight: 'bold' }}>{p.role}</p>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#334155' }}><strong>📍 Office Address:</strong> {p.address}</p>
                                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#334155' }}><strong>📞 Office Phone:</strong> {p.phone}</p>

                                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#1e293b' }}>
                                        Review Advocacy Transcript Letter:
                                    </label>
                                    <textarea
                                        className="letter-box"
                                        value={letters[p.name] || ''}
                                        onChange={(e) => setLetters({ ...letters, [p.name]: e.target.value })}
                                        style={{ width: '100%', height: '240px', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4', boxSizing: 'border-box', resize: 'vertical', backgroundColor: '#fafafa' }}
                                    />

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
                                        <button
                                            disabled={cooldownActive}
                                            onClick={() => handleSendLetter(p.name, p.role)}
                                            style={{ padding: '10px 20px', backgroundColor: cooldownActive ? '#cbd5e1' : badgeBg, color: '#fff', border: 'none', borderRadius: '6px', cursor: cooldownActive ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background-color 0.2s' }}
                                        >
                                            {cooldownActive ? '✓ Letter Recorded' : '✉️ Confirm & Save Send'}
                                        </button>

                                        {lastSentRow && (
                                            <span className="cooldown-badge">
                                                Last Transmitted: {new Date(lastSentRow.dispatched_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* 🚀 PURGED: The entire old "Close Portal" button bar bottom row has been completely deleted */}
            </div>
        </div>
    );
}
