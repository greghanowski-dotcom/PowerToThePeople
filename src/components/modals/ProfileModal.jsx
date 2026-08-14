import React, { useState, useEffect } from 'react';
import CongressmenModal from './CongressmenModal';
import '../../styles/ProfileModal.css';

export default function ProfileModal({ isOpen, onClose }) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [party, setParty] = useState('Independent');
    
    // Status tracking tooltips visibility layers
    const [showCongress, setShowCongress] = useState(false);
    const [showAddressTooltip, setShowAddressTooltip] = useState(false);
    
    // Independent state hook tracks the hover card visibility for your Name field
    const [showNameTooltip, setShowNameTooltip] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : '';

    // Synchronize form states on mount using browser session values
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
                    name: name.trim()
                })
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                setStatusMessage(`❌ Error: ${data.error || 'Sync failed.'}`);
                return;
            }

            sessionStorage.setItem('currentUserName', name.trim());
            sessionStorage.setItem('currentUserAddress', address.trim());
            sessionStorage.setItem('currentUserGender', gender);
            sessionStorage.setItem('currentUserAge', age);
            sessionStorage.setItem('currentUserPartyAffiliation', party);

            alert("🎉 Profile parameters synchronized successfully!");
            onClose();
        } catch (err) {
            setStatusMessage('❌ Network failure. Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const hasSavedAddress = address.trim().length > 0 || !!sessionStorage.getItem('currentUserAddress');
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3 className="modal-title">👤 Voter Profile</h3>
                
                {statusMessage && (
                    <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '13px', border: '1px solid #fca5a5' }}>
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleFormSave}>
                    
                    {/* Aligned Full Name field group with bold label layout and explicit (Optional) text */}
                    <div className="form-group">
                        <div className="label-container">
                            <label className="form-label" style={{ fontWeight: 'bold' }}>Full Name (Optional)</label>
                            <span 
                                onMouseEnter={() => setShowNameTooltip(true)}
                                onMouseLeave={() => setShowNameTooltip(false)}
                                className="info-icon"
                            >
                                ?
                            </span>
                        </div>

                        {showNameTooltip && (
                            <div className="floating-tooltip">
                                Why add your name? It's just a convenience for you to have it drop into the letters to your congressmen. You can add it manually in the letters if you prefer.
                            </div>
                        )}

                        <input 
                            type="text" 
                            className="input-field" 
                            disabled={isLoading}
                            placeholder="John Doe" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>

                    {/* Address Group Input Box Container */}
                    <div className="form-group">
                        <div className="label-container">
                            <label className="form-label" style={{ fontWeight: 'bold' }}>Full Mailing Address (Optional)</label>
                            <span 
                                onMouseEnter={() => setShowAddressTooltip(true)}
                                onMouseLeave={() => setShowAddressTooltip(false)}
                                className="info-icon"
                            >
                                ?
                            </span>
                        </div>

                        {showAddressTooltip && (
                            <div className="floating-tooltip">
                                📌 Why add your address? ZIP codes cross state boundaries. An address allows us to cleanly map your exact congressmen.
                            </div>
                        )}

                        <input 
                            type="text" 
                            className="input-field" 
                            disabled={isLoading}
                            placeholder="123 Main St, Denver, CO 80108" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                        />
                    </div>

                    {/* Gender Indicator Selector */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold' }}>Gender Indicator</label>
                        <select 
                            className="input-field" 
                            disabled={isLoading}
                            value={gender} 
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Voter Age Group Selector */}
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 'bold' }}>Voter Age Group</label>
                        <select 
                            className="input-field" 
                            disabled={isLoading}
                            value={age} 
                            onChange={(e) => setAge(e.target.value)}
                        >
                            <option value="">Select Age Group...</option>
                            <option value="18-24">18-24</option>
                            <option value="25-34">25-34</option>
                            <option value="35-44">35-44</option>
                            <option value="45-54">45-54</option>
                            <option value="55-64">55-64</option>
                            <option value="65+">65+</option>
                        </select>
                    </div>

                    {/* Party Affiliation Alignment Selector */}
                    <div className="form-group-last">
                        <label className="form-label" style={{ fontWeight: 'bold' }}>Party Affiliation Alignment</label>
                        <select 
                            className="input-field" 
                            disabled={isLoading}
                            value={party} 
                            onChange={(e) => setParty(e.target.value)}
                        >
                            <option value="Independent">Independent</option>
                            <option value="Democrat">Democrat</option>
                            <option value="Republican">Republican</option>
                            <option value="Green">Green Party</option>
                            <option value="Libertarian">Libertarian</option>
                        </select>
                    </div>

                    {/* See Your Congressmen Action Row Section Link Container */}
                    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '15px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button 
                            type="button"
                            disabled={!hasSavedAddress}
                            onClick={() => setShowCongress(true)}
                            style={{ width: '100%', padding: '12px', backgroundColor: hasSavedAddress ? '#6366f1' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: hasSavedAddress ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            🏛️ See your congressmen
                        </button>
                        {!hasSavedAddress && <small style={{ color: '#ef4444', textAlign: 'center', fontSize: '11px', fontWeight: '500' }}>⚠️ You must save an address first to unlock your legislators tracker.</small>}
                    </div>

                    {/* 🚀 FIXED: Save button renamed and positioned to the left of the Close button */}
                    <div className="action-container" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn-close" onClick={onClose}>Close</button>
                    </div>
                </form>
            </div>

            <CongressmenModal isOpen={showCongress} onClose={() => setShowCongress(false)} />
        </div>
    );
}
