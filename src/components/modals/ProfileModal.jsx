import React, { useState, useEffect } from 'react';

export default function ProfileModal({ isOpen, onClose }) {
    // Reads the values cached inside your session storage variables on load
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [party, setParty] = useState('Independent');
    const [name, setName] = useState('');

    const [showTooltip, setShowTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : '';

    // Synchronizes component inputs directly with session storage keys whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            setName(sessionStorage.getItem('currentUserName') || '');
            setAddress(sessionStorage.getItem('currentUserAddress') || '');
            setGender(sessionStorage.getItem('currentUserGender') || '');
            setAge(sessionStorage.getItem('currentUserAge') || '');
            setParty(sessionStorage.getItem('currentUserPartyAffiliation') || 'Independent');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFormSave = async (e) => {
        e.preventDefault();
        const cachedUserId = sessionStorage.getItem('currentUserId') || '1';
        setIsLoading(true);
        setStatusMessage('');

        try {
            const res = await fetch(`${apiBaseUrl}/api/update_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: cachedUserId,
                    address: address.trim(),
                    gender,
                    age,
                    party,
                    name: name.trim() // 🚀 Pass name parameter value to backend updates
                })
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                setStatusMessage(`❌ Error: ${data.error || 'Sync failed.'}`);
                return;
            }

            // Sync successful local session cache copies seamlessly
            sessionStorage.setItem('currentUserAddress', address.trim());
            sessionStorage.setItem('currentUserGender', gender);
            sessionStorage.setItem('currentUserAge', age);
            sessionStorage.setItem('currentUserPartyAffiliation', party);
            sessionStorage.setItem('currentUserName', name.trim());

            alert("🎉 Profile parameters synchronized successfully!");
            onClose();
        } catch (err) {
            setStatusMessage('❌ Network failure. Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999999 }}>
            <div style={{ backgroundColor: '#fff', padding: '35px', borderRadius: '10px', maxWidth: '460px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontFamily: 'sans-serif', color: '#111' }}>
                <h3 style={{ marginTop: 0, marginBottom: '25px', textAlign: 'center', fontSize: '22px' }}>👤 Voter Profile Attributes</h3><br />

                {statusMessage && (
                    <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '13px', border: '1px solid #fca5a5' }}>
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleFormSave}>
                    <div style={{ marginBottom: '18px', position: 'relative' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                disabled={isLoading}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Full Mailing Address (Optional)</label>
                            <span
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '50%', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                            >
                                ?
                            </span>
                        </div>

                        {showTooltip && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1e293b', color: '#f8fafc', padding: '14px', borderRadius: '6px', fontSize: '12px', zIndex: 999999, marginTop: '5px' }}>
                                📌 Why add your address? ZIP codes cross state boundaries. An address allows us to cleanly map your exact congressmen.
                            </div>
                        )}

                        <input type="text" placeholder="123 Main St, Denver, CO 80108" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }} value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Gender Indicator</label>
                        <select style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }} value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Voter Age Group</label>
                        <select style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }} value={age} onChange={(e) => setAge(e.target.value)}>
                            <option value="">Select Age Group...</option>
                            <option value="18-24">18-24</option>
                            <option value="25-34">25-34</option>
                            <option value="35-44">35-44</option>
                            <option value="45-54">45-54</option>
                            <option value="55-64">55-64</option>
                            <option value="65+">65+</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Party Affiliation Alignment</label>
                        <select style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }} value={party} onChange={(e) => setParty(e.target.value)}>
                            <option value="Independent">Independent</option>
                            <option value="Democrat">Democrat</option>
                            <option value="Republican">Republican</option>
                            <option value="Green">Green Party</option>
                            <option value="Libertarian">Libertarian</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="submit" disabled={isLoading} style={{ padding: '10px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {isLoading ? 'Syncing...' : 'Save'}
                        </button>
                        <button type="button" onClick={onClose} style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
