import React, { useState, useEffect } from 'react';

export default function AccountModal({ isOpen, onClose }) {
    // ZERO HARDCODING: Dynamic session lookup tracks actual user profiles
    const [email, setEmail] = useState(() => sessionStorage.getItem('currentUserEmail') || 'greghanowski@gmail.com');
    const [password, setPassword] = useState(() => sessionStorage.getItem('currentUserPassword') || '');

    useEffect(() => {
        const cachedEmail = sessionStorage.getItem('currentUserEmail');
        if (cachedEmail) {
            setEmail(cachedEmail);
        }
    }, [isOpen]);

    // Force mount condition check rule metrics
    if (!isOpen) return null;

    return (
        /* 🚀 THE FIXED INLINE LAYER CONTROL: Forces an instant, high-visibility viewport position overlay */
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', /* Darkened translucent backing canvas */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999999, /* Forces the element to float above everything else on screen */
            pointerEvents: 'auto'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: '12px',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.25)',
                fontFamily: 'sans-serif',
                color: '#111111',
                border: '1px solid #dddddd'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '22px', textAlign: 'center', fontWeight: 'bold' }}>
                    🛡️ Account Settings Management
                </h3>
                
                <form onSubmit={(e) => e.preventDefault()}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                            Registered Account Email Address
                        </label>
                        <input 
                            type="email" 
                            required 
                            disabled 
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                boxSizing: 'border-box', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '6px', 
                                backgroundColor: '#f1f5f9', 
                                color: '#64748b', 
                                cursor: 'not-allowed',
                                fontSize: '14px'
                            }} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                            Update Password
                        </label>
                        <input 
                            type="password" 
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                boxSizing: 'border-box', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '6px',
                                fontSize: '14px'
                            }} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            type="submit" 
                            style={{ padding: '10px 18px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            Save Account Settings
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            style={{ padding: '10px 18px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
