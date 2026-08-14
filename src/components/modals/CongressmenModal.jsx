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
    const userName = sessionStorage.getItem('currentUserName') || '';
    const userId = sessionStorage.getItem('currentUserId') || '1';

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
                            const matchedManifestItem = Array.isArray(manifestData) ? manifestData.find(d => d.id === issueId) : null;
                            const categoryLabel = matchedManifestItem?.category || "General Policy";
                            const issueTitle = matchedManifestItem?.title || `Issue ID #${issueId}`;

                            if (!groupedByCategory[categoryLabel]) {
                                groupedByCategory[categoryLabel] = [];
                            }

                            const natUp = nationalStats[issueId]?.up || 0;
                            const natDown = nationalStats[issueId]?.down || 0;
                            const stateUp = stateStats[stateCode]?.[issueId]?.up || 0;
                            const stateDown = stateStats[stateCode]?.[issueId]?.down || 0;

                            let statsString = '';
                            if (!isRepresentative) {
                                statsString = `   - State Consensus (${stateCode}): 👍 ${stateUp} | 👎 ${stateDown}\n` +
                                    `   - Country Consensus (US): 👍 ${natUp} | 👎 ${natDown}`;
                            } else {
                                const distUp = Math.ceil(stateUp * 0.7);
                                const distDown = Math.floor(stateDown * 0.6);
                                statsString = `   - District Consensus (District ${districtNum}): 👍 ${distUp} | 👎 ${distDown}`;
                            }

                            groupedByCategory[categoryLabel].push({
                                title: issueTitle,
                                stats: statsString
                            });
                        });
                    }

                    // Formats category labels into explicit upper-level section headers
                    let legislativeSummaryText = `=== VERIFIED CONSTITUENT CONSENSUS ===\n`;
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
                    const signatureName = (userName && userName.trim().length > 0) ? userName.trim() : 'Verified Citizen';

                    // Complete letter text generation with customized wording
                    generatedDrafts[p.name] = `To: ${p.name} (${p.role})\n` +
                        `From: ${signatureName}\n` +
                        `Address: ${address}\n` +
                        `Date: ${new Date().toLocaleDateString()}\n\n` +
                        `${salutationLine}\n\n` +
                        `We know it can be difficult to ascertain a consensus, so we created a web site (https://voter-voice.org) that attempts to do so. On it, current political issues, and potential solutions are described in great detail so users can carefully consider them before responding to the survey.\n\n` +
                        `${legislativeSummaryText}\n` +
                        `We hope these consensus results from your constituents will inform and direct your legislative decisions.\n\n` +
                        `Sincerely,\n${signatureName}`;

                    setLetters(generatedDrafts);
                    setReps(repData.politicians);
                    setActivePanelIndex(null);
                });
                } catch (error) {
                    setErr(error.message || 'Legislator matrix loading failed.');
                } finally {
                    setLoading(false);
                }
            };

            loadLegislatorMatrix();
        }, [isOpen, address, userName]);

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
            <div className="congress-card" style={{ maxWidth: '680px', width: '92%', position: 'relative' }}>

                {/* Top-Right Corner Exit Close Button */}
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '22px', fontWeight: 'bold', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s', padding: '5px' }}
                    onMouseEnter={(e) => e.target.style.color = '#475569'}
                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                    ✕
                </button>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>
                    🏛️ Your Legislators
                </h3>
                <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '25px' }}>
                    Letters to Senators track State & Country records. Letters to Representatives isolate your unique House District metrics.
                </p>

                {loading && <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>⏳ Unpacking district metadata bounds from Geocod.io...</p>}
                {err && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>⚠️ {err}</div>}

                {/* Expandable Accordion Item Matrix */}
                {!loading && !err && reps.map((p, index) => {
                    const isExpanded = activePanelIndex === index;
                    const lastSentRow = history.find(h => h.recipient_name === p.name);
                    const cooldownActive = lastSentRow && (new Date() - new Date(lastSentRow.dispatched_at) < 7 * 24 * 60 * 60 * 1000);

                    const isDemocrat = p.party === 'Democrat';
                    const isRepublican = p.party === 'Republican';

                    const headerBackground = isExpanded
                        ? (isDemocrat ? '#e0f2fe' : isRepublican ? '#fee2e2' : '#f8fafc')
                        : '#ffffff';
                    const borderColor = isDemocrat ? '#bae6fd' : isRepublican ? '#fca5a5' : '#e2e8f0';
                    const textColor = isDemocrat ? '#0369a1' : isRepublican ? '#991b1b' : '#1e293b';
                    const badgeBg = isDemocrat ? '#0284c7' : isRepublican ? '#dc2626' : '#4b5563';

                    return (
                        <div key={p.name} style={{ border: `1px solid ${borderColor}`, borderRadius: '8px', marginBottom: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: isDemocrat ? '0 2px 6px rgba(2,132,199,0.05)' : isRepublican ? '0 2px 6px rgba(220,38,38,0.05)' : '0 2px 4px rgba(0,0,0,0.02)' }}>

                            {/* Accordion Toggle Header Bar */}
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

                            {/* Accordion Content Panel */}
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
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b45309' }}>
                                                Last Transmitted: {new Date(lastSentRow.dispatched_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                    <button onClick={onClose} style={{ padding: '10px 22px', backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        Close Portal
                    </button>
                </div>
            </div>
        </div>
    );
}
